import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { PerformanceStatus } from 'src/api_types';
import { Cast, CastApi } from '../api/cast_api.service';
import { Performance, PerformanceApi } from '../api/performance-api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
import { User, UserApi } from '../api/user_api.service';
import { CastDragAndDrop } from '../cast/cast-drag-and-drop.component';
import { Stepper } from '../common_components/stepper.component';
import { CsvGenerator } from '../services/csv-generator.service';
import { ResponseStatusHandlerService } from '../services/response-status-handler.service';
import {CAST_COUNT} from 'src/constants';

@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss']
})
export class PerformanceEditor implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('stepper') stepper: Stepper;
  stepperOpts = ["Performance Details", "Pieces & Intermissions", "Fill Casts", "Finalize"];

  state: Performance;

  urlUUID: string;

  performancesLoaded = false;
  usersLoaded = false;
  piecesLoaded = false;
  castsLoaded = false;
  dataLoaded = false;

  toDateString(number) {
    return new Date(number).toLocaleDateString('en-US');
  }

  constructor(private performanceAPI: PerformanceApi, private piecesAPI: PieceApi,
    private castAPI: CastApi, private respHandler: ResponseStatusHandlerService,
    private userAPI: UserApi, private changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute, private location: Location,
    private csvGenerator: CsvGenerator) { }

  ngOnInit() {
    this.urlUUID = this.activatedRoute.snapshot.params.uuid;
    this.state = this.createNewPerformance();
    this.performanceAPI.performanceEmitter.subscribe(val => this.onPerformanceLoad(val));
    this.piecesAPI.pieceEmitter.subscribe(val => this.onPieceLoad(val));
    this.castAPI.castEmitter.subscribe(val => this.onCastLoad(val));
    this.userAPI.userEmitter.subscribe(val => this.onUserLoad(val));
    this.performanceAPI.getAllPerformances();
    this.piecesAPI.getAllPieces();
    this.castAPI.getAllCasts();
    this.userAPI.getAllUsers();
  }

  ngOnDestroy() {
    this.deleteWorkingCasts();
  }

  onPerformanceLoad(perfs: Performance[]) {
    this.allPerformances = perfs.sort((a, b) => a.step_1.date - b.step_1.date);
    // this.onSelectRecentPerformance(perfs[0] ? perfs[0] : undefined);
    this.publishedPerfs = this.allPerformances.filter(val => val.status == PerformanceStatus.PUBLISHED);
    this.draftPerfs = this.allPerformances.filter(val => val.status == PerformanceStatus.DRAFT);
    this.performancesLoaded = true;
    this.checkDataLoaded();
  }

  onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.checkDataLoaded();
  }

  onPieceLoad(pieces: Piece[]) {
    this.step2AllSegments = [];
    this.step2AllSegments.push(...pieces.map(val => val));
    // Make sure pick list only includes top level segments and excludes children of Super Ballets
    this.step2PickFrom = this.step2AllSegments.filter((segment: Piece) => !segment.siblingId);
    this.step2Data = [];
    this.initStep2Data();
    this.piecesLoaded = true;
    this.checkDataLoaded();
  }

  onCastLoad(casts: Cast[]) {
    this.allCasts = casts;
    this.castsLoaded = true;
    this.checkDataLoaded();
  }

  checkDataLoaded(): boolean {
    this.dataLoaded = this.performancesLoaded && this.piecesLoaded && this.castsLoaded && this.usersLoaded;
    if (this.dataLoaded && this.urlUUID && !this.performanceSelected) {
      this.startAtPerformance(this.urlUUID);
    }
    return this.dataLoaded;
  }

  startAtPerformance(uuid: string) {
    let foundPerf = this.allPerformances.find(val => val.uuid == uuid);
    if (foundPerf) {
      this.onSelectRecentPerformance(foundPerf);
      this.onEditPerformance();
    } else {
      this.location.replaceState("/performance");
      this.urlUUID = undefined;
    }
  }

  updateUrl(perf: Performance) {
    if (perf && this.location.path().startsWith("/performance")) {
      if (perf.uuid) {
        this.urlUUID = perf.uuid;
        this.location.replaceState("/performance/" + perf.uuid);
      }
      else {
        this.urlUUID = undefined;
        this.location.replaceState("/performance");
      }
    }
  }

  // All Steps ----------------------------------------------------

  createNewPerformance(): Performance {
    return {
      uuid: "performance" + Date.now(),
      status: PerformanceStatus.DRAFT,
      step_1: {
        title: "New Performance",
        date: Date.now(),
        state: "NY",
        city: "New York",
        country: "USA",
        venue: "",
        description: ""
      },
      step_2: {
        segments: []
      },
      step_3: {
        segments: []
      }
    };
  }

  async onSaveDraft() {
    this.initStep3Data();
    this.initStep4();
    this.state.status = PerformanceStatus.DRAFT;
    this.performanceAPI.setPerformance(this.dataToPerformance());
    this.deleteWorkingCasts();
    this.resetState();
  }


  resetState() {
    this.deleteWorkingCasts();
    this.initCastsLoaded = false;
    this.isEditing = false;
    this.performanceSelected = false;
    this.submitted = false;
    this.selectedPerformance = undefined;
    this.urlUUID = undefined;
    this.segmentToCast.clear();
    this.segmentToPerfSectionID.clear();
    this.intermissions.clear();
    this.selectedSegment = undefined;
    this.selectedIndex = undefined;
    this.chooseFromGroupIndices = [];
    this.primaryGroupNum = 0;
    this.allCasts = [];
    this.location.replaceState("/performance");
  }

  onNextClick() {
    this.stepper.nextStep();
    this.updateBasedOnStep();
  }

  onPrevClick() {
    this.stepper.prevStep();
    this.updateBasedOnStep();
  }

  onStepChange(step) {
    this.updateBasedOnStep();
  }

  lastStepperIndex: number = 0;

  updateBasedOnStep() {
    if (this.stepper.currentStepIndex == 1) {
      this.initStep2Data();
      this.updateStep2State();
    }
    if (this.stepper.currentStepIndex == 2) {
      this.initStep3Data();
    }
    if (this.stepper.currentStepIndex == 3) {
      this.initStep4();
    }
    this.lastStepperIndex = this.stepper.currentStepIndex;
  }

  // --------------------------------------------------------------

  // Step 0 -------------------------------------------------------

  performanceSelected = false;
  isEditing = false;

  draftPerfs;
  publishedPerfs;

  onEditPerformance() {
    if (!this.selectedPerformance) {
      this.respHandler.showError({
        errorMessage: "Must select a performance to edit!",
        url: "Error ocurred while selecting performance.",
        status: 400,
        statusText: "Performance not selected!"
      });
      return;
    }
    this.isEditing = true;
    this.state = JSON.parse(JSON.stringify(this.selectedPerformance));
    this.updateDateString();
    this.initStep2Data();
    this.updateStep2State();
    this.performanceSelected = true;
    this.initStep3Data();
    this.initStep4();
    this.updateUrl(this.state);
  }

  onDuplicatePerformance(perf: Performance) {
    if (!this.selectedPerformance) {
      this.respHandler.showError({
        errorMessage: "Must select a performance to duplicate!",
        url: "Error ocurred while selecting performance.",
        status: 400,
        statusText: "Performance not selected!"
      });
      return;
    }
    this.state = JSON.parse(JSON.stringify(perf));
    this.state.uuid = "performance" + Date.now();
    this.state.step_1.title = this.state.step_1.title + " copy";
    this.updateDateString();
    this.initStep2Data();
    this.performanceSelected = true;
    this.initStep3Data();
    this.updateUrl(this.state);
  }


  onNewPerformance() {
    this.resetPerformance();
    this.performanceSelected = true;
    this.updateUrl(this.state);
  }

  onCancelPerformance() {
    if (!this.selectedPerformance) {
      this.respHandler.showError({
        errorMessage: "Must select a performance to cancel!",
        url: "Error ocurred while selecting performance.",
        status: 400,
        statusText: "Performance not selected!"
      });
      return;
    }
    if (this.selectedPerformance.status == PerformanceStatus.DRAFT) {
      this.performanceAPI.deletePerformance(this.selectedPerformance);
    } else if (this.selectedPerformance.status == PerformanceStatus.PUBLISHED) {
      this.selectedPerformance.status = PerformanceStatus.CANCELED;
      this.selectedPerformance.step_3.segments = [];
      this.selectedPerformance.step_2.segments = [];
      this.performanceAPI.setPerformance(this.selectedPerformance);
    }
  }

  // --------------------------------------------------------------

  // Step 1 -------------------------------------------------------

  allPerformances: Performance[] = [];
  selectedPerformance: Performance;
  dateStr: string;
  date: Date;

  onSelectRecentPerformance(perf: Performance) {
    this.selectedPerformance = perf;
    this.updateDateString();
  }

  updateDateString() {
    let timeZoneOffset = new Date().getTimezoneOffset() * 60000;
    this.date = new Date(this.state.step_1.date - timeZoneOffset);
    let iso = this.date.toISOString();
    let isoSplits = iso.slice(0, iso.length - 1).split(":");
    this.dateStr = isoSplits[0] + ":" + isoSplits[1];
  }

  onStep1Input(field: string, value: any) {
    if (field == "title") {
      let val = value as InputEvent;
      this.state.step_1.title = val.target['value'];
    }
    else if (field == "city") {
      let val2 = value as InputEvent;
      this.state.step_1.city = val2.target['value'];
    }
    else if (field == "country") {
      let val2 = value as InputEvent;
      this.state.step_1.country = val2.target['value'];
    }
    else if (field == "state") {
      let val2 = value as InputEvent;
      this.state.step_1.state = val2.target['value'];
    }
    else if (field == "venue") {
      let val2 = value as InputEvent;
      this.state.step_1.venue = val2.target['value'];
    }
    else if (field == "date") {
      let val3 = value as InputEvent;
      this.state.step_1.date = Date.parse(val3.target['value'])
      this.updateDateString();
    }
    else if (field == "description") {
      let val4 = value as InputEvent;
      this.state.step_1.description = val4.target['value'];
    }
  }

  resetPerformance() {
    this.state = this.createNewPerformance();
    this.updateDateString();
    this.initStep2Data();
    this.initCastsLoaded = false;
  }

  // --------------------------------------------------------------

  // Step 2 -------------------------------------------------------

  hasSuper: boolean;
  step2AllSegments: Piece[];
  step2Data: Piece[];
  step2PickFrom: Piece[];

  deletePiece(piece: Piece, index: number) {
    this.step2Data = this.step2Data.filter((val, ind) => val.uuid != piece.uuid || ind != index);
    this.updateStep2State();
  }

  initStep2Data() {
    this.step2Data = this.state.step_2.segments
      .map(segmentUUID => this.step2AllSegments
        .find(segment => segment.uuid == segmentUUID)).filter(val => val != undefined);
  }

  updateStep2State() {
    this.state.step_2.segments = this.step2Data.map(val => val.uuid);
    this.hasSuper = !!this.step2Data.find(segment => segment.type === 'SUPER');
  }

  step2Drop(event: CdkDragDrop<Piece[]>) {
    let draggedSegment;
    if (event.container.id === 'program-list' && event.previousContainer.id === 'program-list') {
      draggedSegment = event.previousContainer.data[event.previousIndex];
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    else if (event.previousContainer.id === 'piece-list' && event.container.id === 'program-list') {
      draggedSegment = event.item.data;
      copyArrayItem([draggedSegment], event.container.data, 0, event.currentIndex);
    }
    if (draggedSegment) {
      const isDraggingSuper = draggedSegment.type === 'SUPER';
      this.step2Data = event.container.data;
      if (isDraggingSuper) {
        if (event.previousContainer.id === 'program-list') {
          this.removeSuperChildren(draggedSegment);
        }
        this.addSuperChildren(draggedSegment);
      }
    }
    this.updateStep2State();
  }

  // Removes the Super Ballet children so every Super Ballet drag just inserts its
  // children right below it, regardless of where the dragging originated
  private removeSuperChildren(draggedSegment: Piece) {
    for (const segment of this.step2Data) {
      if (segment.uuid === draggedSegment.uuid) {
        for (const position of segment.positions) {
          if (position.siblingId) {
            this.step2Data = this.step2Data.filter(segment => Number(
                segment.uuid) !== position.siblingId);
          }
        }
      }
    }
  }

  // A Super Ballet has children that need to be placed right below the Super Ballet
  private addSuperChildren(draggedSegment: Piece) {
    for (let segmentIndex = 0; segmentIndex < this.step2Data.length; segmentIndex++) {
      const segment = this.step2Data[segmentIndex];
      if (segment.uuid === draggedSegment.uuid) {
        let childArr: Piece[] = [];
        for (const position of segment.positions) {
          if (position.siblingId) {
            const sibling = this.step2AllSegments.find(
                segment => Number(segment.uuid) === position.siblingId);
            childArr.push(sibling);
          }
        }
        this.step2Data.splice(segmentIndex + 1, 0, ...childArr);
        break;
      }
    }  
  }

  // --------------------------------------------------------------

  // Step 3 -------------------------------------------------------

  selectedSegment: Piece;
  selectedIndex: number;
  @ViewChild('castDnD') castDnD: CastDragAndDrop;
  // segment uuid to cast, primary cast, and length
  segmentToCast: Map<string, [Cast, number, number]> = new Map();
  // segment uuid to performance section ID
  segmentToPerfSectionID: Map<string, string> = new Map();
  // segement index to length
  intermissions: Map<number, number> = new Map();
  chooseFromGroupIndices: number[] = [];
  primaryGroupNum = 0;
  allCasts: Cast[] = [];

  saveCastChanges() {
    if (this.selectedSegment) {
      let prevCastUUID = this.state.uuid + "cast" + this.selectedSegment.uuid;
      if (this.selectedSegment && this.castDnD && this.castDnD.cast && this.castDnD.castSelected) {
        let exportedCast: Cast = this.castDnD.dataToCast();
        if (this.castAPI.hasCast(exportedCast.uuid)) {
          this.castAPI.deleteCast(exportedCast);
        }
        this.segmentToCast.set(exportedCast.uuid, [exportedCast, this.primaryGroupNum, this.segmentLength]);
        this.castAPI.setCast(exportedCast, true);
        this.castAPI.getAllCasts();
      }
      if (this.selectedSegment && this.selectedSegment.type == "SEGMENT") {
        this.intermissions.set(this.selectedIndex, this.segmentLength);
      }
      this.castDnD ? this.castDnD.setBoldedCast(this.segmentToCast.get(prevCastUUID) ? this.segmentToCast.get(prevCastUUID)[1] : undefined) : '';
    }
  }

  onSelectStep3Segment(segment: Piece, segmentIx: number) {
    this.saveCastChanges();
    this.selectedSegment = segment;
    this.selectedIndex = segmentIx;
    if (segment.type === "SEGMENT" || segment.type === "SUPER") {
      if (this.intermissions.has(segmentIx)) {
        this.segmentLength = this.intermissions.get(segmentIx);
      } else {
        this.segmentLength = 0;
      }
      return;
    }
    let castUUID = this.state.uuid + "cast" + this.selectedSegment.uuid;
    let castAndPrimLength: [Cast, number, number];
    if (this.segmentToCast.has(castUUID)) {
      castAndPrimLength = this.segmentToCast.get(castUUID);
    } else {
      let newCast: Cast = {
        uuid: castUUID,
        name: "New Cast",
        segment: this.selectedSegment.uuid,
        castCount: CAST_COUNT,
        filled_positions: this.selectedSegment.positions.map(val => {
          return {
            position_uuid: val.uuid,
            groups: [
              {
                group_index: 0,
                members: []
              }
            ]
          }
        })
      };
      this.segmentToCast.set(newCast.uuid, [newCast, 0, 0]);
      this.castAPI.setCast(newCast, true);
      this.castAPI.getAllCasts();
      castAndPrimLength = this.segmentToCast.get(castUUID);
    }
    this.primaryGroupNum = castAndPrimLength[1];
    this.castDnD ? this.castDnD.selectCast({uuid: castUUID, saveDeleteEnabled: false}) : '';
    this.updateGroupIndices(castAndPrimLength[0]);
    this.updateCastsForSegment();
    this.segmentLength = castAndPrimLength[2];
    this.changeDetectorRef.detectChanges();
    this.castDnD ? this.castDnD.setBoldedCast(this.segmentToCast.get(castUUID)[1]) : '';
  }

  updateGroupIndices(cast: Cast) {
    let maxGroupInd = 0;
    for (let pos of cast.filled_positions) {
      for (let group of pos.groups) {
        if (group.group_index > maxGroupInd) {
          maxGroupInd = group.group_index
        }
      }
    }
    this.chooseFromGroupIndices = Array(maxGroupInd + 1).fill(0).map((val, ind) => ind);
  }

  updateCastsForSegment() {
    this.castsForSegment = this.allCasts.filter(val => val.segment == this.selectedSegment.uuid);
  }

  onChangeCast(cast: Cast) {
    this.updateGroupIndices(cast);
    this.saveCastChanges();
  }

  shouldSelectFirstSegment = false;

  ngAfterViewChecked() {
    if (this.selectedSegment && this.shouldSelectFirstSegment) {
      this.onSelectStep3Segment(this.selectedSegment, 0);
      this.shouldSelectFirstSegment = false;
    }
  }

  initCastsLoaded = false;

  initStep3Data() {
    this.selectedSegment = this.step2Data[0];
    this.selectedIndex = 0;
    this.shouldSelectFirstSegment = true;
    let newInterms: Map<number, number> = new Map();
    for (let entry of this.intermissions.entries()) {
      if (this.step2Data.length > entry[0] && this.step2Data[entry[0]].type == "SEGMENT") {
        newInterms.set(entry[0], entry[1]);
      }
    }
    this.intermissions = newInterms;
    if (!this.initCastsLoaded) {
      // Sort the positions (=custom_groups) of all ballets (=segments) in the performance
      for (let i = 0; i < this.state.step_3.segments.length; i++) {
        const segment = this.state.step_3.segments[i];
        segment.custom_groups.sort((a, b) => a.position_order < b.position_order ? -1 : 1 );
      }
      for (let [i, seg] of this.state.step_3.segments.entries()) {
        let castUUID = this.state.uuid + "cast" + seg.segment;
        if (this.piecesAPI.pieces.get(seg.segment).type == "SEGMENT") {
          this.intermissions.set(i, seg.length ? seg.length : 0);
          this.segmentToPerfSectionID.set(castUUID, seg.id);
        } else {
          let cast: Cast = {
            uuid: castUUID,
            name: "Copied Cast",
            segment: seg.segment,
            castCount: CAST_COUNT,
            filled_positions: seg.custom_groups
          }
          this.segmentToCast.set(castUUID, [cast, seg.selected_group, seg.length ? seg.length : 0]);
          this.segmentToPerfSectionID.set(castUUID, seg.id);
          this.castAPI.setCast(cast, true);
          this.castAPI.getAllCasts();
        }
      }
      this.initCastsLoaded = true;
    }
    if (this.selectedSegment) {
      this.onSelectStep3Segment(this.selectedSegment, 0);
    }
  }

  onChoosePrimaryCast(event: MatSelectChange) {
    this.saveCastChanges();
    this.castDnD ? this.castDnD.setBoldedCast(event.value) : '';
  }

  castsForSegment: Cast[] = [];

  onAutofillCast(cast: Cast) {
    let newCast: Cast = JSON.parse(JSON.stringify(cast));
    newCast.uuid = this.state.uuid + "cast" + this.selectedSegment.uuid;
    this.segmentToCast.set(newCast.uuid, [newCast, 0, this.segmentLength]);
    this.castAPI.setCast(newCast, true);
    this.castAPI.getAllCasts();
    this.updateGroupIndices(newCast);
  }

  segmentLength = 0;

  onLengthChange(event: any) {
    let length = event.target.value;
    try {
      let numLength = Number(length);
      this.segmentLength = numLength;
    } catch (err) {
      this.segmentLength = 0;
    }
    this.saveCastChanges();
  }


  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------

  submitted = false;

  async onSubmit() {
    let finishedPerf = this.dataToPerformance();
    finishedPerf.status = PerformanceStatus.PUBLISHED;
    this.performanceAPI.setPerformance(finishedPerf).then(val => {
      this.submitted = true;
      this.initCastsLoaded = false;
      this.deleteWorkingCasts();
    }).catch(err => {
      alert("Unable to save performance: " + err.error.status + " " + err.error.error);
    });
  }

  deleteWorkingCasts() {
    for (let entry of this.segmentToCast.entries()) {
      if (this.castAPI.workingCasts.has(entry[0])) {
        this.castAPI.deleteCast(entry[1][0]);
      }
    }
    this.segmentToCast.clear();
  }

  initStep4() {
    this.state = this.dataToPerformance();
  }

  exportPerformance() {
    this.csvGenerator.generateCSVFromPerformance(this.state);
  }

  dataToPerformance(): Performance {
    this.updateStep2State();
    let newState: Performance = JSON.parse(JSON.stringify(this.state));
    newState.step_3.segments =
      this.step2Data.map((segment, segmentIx) => {
        const segUUID = newState.uuid + "cast" + segment.uuid;
        const info: [Cast, number, number] = this.segmentToCast.get(segUUID);
        if (segment.type == "SEGMENT" || segment.type == "SUPER" || !info) {
          return {
            id: this.segmentToPerfSectionID.has(segUUID) ? this.segmentToPerfSectionID.get(segUUID) : undefined,
            segment: segment.uuid,
            name: segment.name,
            type: segment.type,
            selected_group: undefined,
            length: this.intermissions.get(segmentIx) ? this.intermissions.get(segmentIx) : 0,
            custom_groups: []
          };
        }
        return {
          id: this.segmentToPerfSectionID.has(segUUID) ? this.segmentToPerfSectionID.get(segUUID) : undefined,
          segment: segment.uuid,
          name: segment.name,
          type: segment.type,
          selected_group: info ? info[1] : 0,
          length: info[2] ? info[2] : 0,
          custom_groups: info ? info[0].filled_positions.map(val => {
            let positionName = "";
            let positionOrder = 0;
            this.step2AllSegments.forEach(val2 => {
              let foundPos = val2.positions.find(val3 => val3.uuid == val.position_uuid);
              if (foundPos) {
                positionName = foundPos.name;
                positionOrder = foundPos.order;
              }
            });
            return {
              ...val,
              name: positionName,
              position_order: positionOrder,
              groups: val.groups.map(g => {
                return {
                  ...g,
                  memberNames: g.members.map(mem => this.userAPI.users.get(mem.uuid)).map(
                      usr => usr.first_name + " " +
                      (usr.middle_name.length > 0 ? usr.middle_name + " " : "") +
                      usr.last_name + usr.suffix),
                }
              })
            }
          }) : []
        };
      })
    return newState;
  }

  onReturn() {
    this.onPrevClick();
    this.submitted = false;
  }

  onResetFromStart() {
    this.deleteWorkingCasts();
    this.stepper.navigate(0);
    this.resetPerformance();
    this.resetState();
  }

  // --------------------------------------------------------------

}
