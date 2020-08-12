import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Cast, CastApi } from '../api/cast_api.service';
import { Performance, PerformanceApi } from '../api/performance-api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
import { User, UserApi } from '../api/user_api.service';
import { CastDragAndDrop } from '../cast/cast-drag-and-drop.component';
import { Stepper } from '../common_components/stepper.component';
import { ResponseStatusHandlerService } from '../services/response-status-handler.service';

@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss']
})
export class PerformanceEditor implements OnInit, AfterViewChecked {

  @ViewChild('stepper') stepper: Stepper;
  stepperOpts = ["Performance Details", "Pieces & Intermissions", "Fill Casts", "Finalize"];

  state: Performance;

  performancesLoaded = false;
  usersLoaded = false;
  piecesLoaded = false;
  castsLoaded = false;
  dataLoaded = false;

  constructor(private performanceAPI: PerformanceApi, private piecesAPI: PieceApi,
    private castAPI: CastApi, private respHandler: ResponseStatusHandlerService,
    private userAPI: UserApi, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
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

  onPerformanceLoad(perfs: Performance[]) {
    this.allPerformances = perfs;
    // this.onSelectRecentPerformance(perfs[0] ? perfs[0] : undefined);
    this.publishedPerfs = perfs.filter(val => val.status == "Published");
    this.draftPerfs = perfs.filter(val => val.status == "Draft");
    this.performancesLoaded = true;
    this.checkDataLoaded();
  }

  onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.checkDataLoaded();
  }

  onPieceLoad(pieces: Piece[]) {
    this.step2PickFrom = [];
    this.step2PickFrom.push(...pieces.map(val => val));
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
    return this.dataLoaded;
  }

  // All Steps ----------------------------------------------------

  createNewPerformance(): Performance {
    return {
      uuid: "performance" + Date.now(),
      status: "Draft",
      step_1: {
        title: "New Performance",
        date: Date.now(),
        location: "New York, NY",
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
    this.state.status = "Draft";
    if (this.isEditing) {
      await this.performanceAPI.deletePerformance(this.state);
    }
    this.performanceAPI.setPerformance(this.state);
    this.deleteWorkingCasts();
    this.resetState();
  }


  resetState() {
    this.initCastsLoaded = false;
    this.isEditing = false;
    this.performanceSelected = false;
    this.submitted = false;
    this.selectedPerformance = undefined;
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
    this.performanceSelected = true;
    this.initStep3Data();
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
  }


  onNewPerformance() {
    this.resetPerformance();
    this.performanceSelected = true;
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
    this.performanceAPI.deletePerformance(this.selectedPerformance);
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
    if (field == "location") {
      let val2 = value as InputEvent;
      this.state.step_1.location = val2.target['value'];
    }
    if (field == "date") {
      let val3 = value as InputEvent;
      this.state.step_1.date = Date.parse(val3.target['value'])
      this.updateDateString();
    }
    if (field == "description") {
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

  step2Data: Piece[];
  step2PickFrom: Piece[];

  deletePiece(piece: Piece, index: number) {
    this.step2Data = this.step2Data.filter((val, ind) => val.uuid != piece.uuid || ind != index);
    this.updateStep2State();
  }

  initStep2Data() {
    this.step2Data = this.state.step_2.segments.map(val => this.step2PickFrom.find(x => x.uuid == val)).filter(val => val != undefined);
  }

  updateStep2State() {
    this.state.step_2.segments = this.step2Data.map(val => val.uuid);
  }

  step2Drop(event: CdkDragDrop<Piece[]>) {
    if (event.container.id == "program-list" && event.previousContainer.id == "program-list") {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.step2Data = event.container.data;
    }
    else if (event.previousContainer.id == "piece-list" && event.container.id == "program-list") {
      let itemArr = [event.item.data];
      copyArrayItem(itemArr, event.container.data, 0, event.currentIndex);
      this.step2Data = event.container.data;
    }
    this.updateStep2State();
  }

  // --------------------------------------------------------------

  // Step 3 -------------------------------------------------------

  selectedSegment: Piece;
  selectedIndex: number;
  @ViewChild('castDnD') castDnD: CastDragAndDrop;
  // segment uuid to cast, primary cast, and length
  segmentToCast: Map<string, [Cast, number, number]> = new Map();
  // segement index to length
  intermissions: Map<number, number> = new Map();
  chooseFromGroupIndices: number[] = [];
  primaryGroupNum = 0;
  allCasts: Cast[] = [];

  saveCastChanges() {
    let prevCastUUID = this.state.uuid + "cast" + this.selectedSegment.uuid;
    if (this.selectedSegment && this.castDnD && this.castDnD.cast && this.castDnD.castSelected) {
      let exportedCast: Cast = this.castDnD.dataToCast();
      if (this.castAPI.hasCast(exportedCast.uuid)) {
        this.castAPI.deleteCast(exportedCast);
      }
      this.segmentToCast.set(prevCastUUID, [exportedCast, this.primaryGroupNum, this.segmentLength]);
      this.castAPI.setCast(exportedCast, true);
    }
    if (this.selectedSegment && this.selectedSegment.type == "SEGMENT") {
      this.intermissions.set(this.selectedIndex, this.segmentLength);
    }
  }

  onSelectStep3Segment(segment: Piece, ind: number) {
    this.saveCastChanges();
    this.selectedSegment = segment;
    this.selectedIndex = ind;
    if (segment.type == "SEGMENT") {
      if (this.intermissions.has(ind)) {
        this.segmentLength = this.intermissions.get(ind);
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
      castAndPrimLength = this.segmentToCast.get(castUUID);
    }
    this.primaryGroupNum = castAndPrimLength[1];
    this.castDnD ? this.castDnD.selectCast(castUUID, false) : '';
    this.updateGroupIndices(castAndPrimLength[0]);
    this.updateCastsForSegment();
    this.segmentLength = castAndPrimLength[2];
    this.changeDetectorRef.detectChanges();
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
      for (let [i, seg] of this.state.step_3.segments.entries()) {
        let castUUID = this.state.uuid + "cast" + seg.segment;
        if (this.piecesAPI.pieces.get(seg.segment).type == "SEGMENT") {
          this.intermissions.set(i, seg.length ? seg.length : 0);
        } else {
          let cast: Cast = {
            uuid: castUUID,
            name: "Copied Cast",
            segment: seg.segment,
            filled_positions: seg.custom_groups
          }
          this.segmentToCast.set(castUUID, [cast, seg.selected_group, seg.length ? seg.length : 0]);
          this.castAPI.setCast(cast, true);
        }
      }
      this.initCastsLoaded = true;
    }

    this.onSelectStep3Segment(this.selectedSegment, 0);
  }

  onChoosePrimaryCast(groupInd: number) {
    this.saveCastChanges();
  }

  castsForSegment: Cast[] = [];

  onAutofillCast(cast: Cast) {
    let newCast: Cast = JSON.parse(JSON.stringify(cast));
    newCast.uuid = this.state.uuid + "cast" + this.selectedSegment.uuid;
    this.segmentToCast.set(newCast.uuid, [newCast, 0, this.segmentLength]);
    this.castAPI.setCast(newCast, true);
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
    finishedPerf.status = "Published";
    if (this.isEditing) {
      await this.performanceAPI.deletePerformance(this.state);
    }
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
      this.castAPI.deleteCast(entry[1][0]);
    }
  }

  initStep4() {
    this.state = this.dataToPerformance();
  }

  dataToPerformance(): Performance {
    this.updateStep2State();
    let newState: Performance = JSON.parse(JSON.stringify(this.state));
    newState.step_3.segments =
      this.step2Data.map((segment, ind) => {
        if (segment.type == "SEGMENT") {
          return {
            segment: segment.uuid,
            name: segment.name,
            type: segment.type,
            selected_group: undefined,
            length: this.intermissions.get(ind) ? this.intermissions.get(ind) : 0,
            custom_groups: []
          };
        }
        let segUUID = newState.uuid + "cast" + segment.uuid;
        let info: [Cast, number, number] = this.segmentToCast.get(segUUID);
        return {
          segment: segment.uuid,
          name: segment.name,
          type: segment.type,
          selected_group: info ? info[1] : 0,
          length: info[2] ? info[2] : 0,
          custom_groups: info ? info[0].filled_positions.map(val => {
            let positionName = "";
            this.step2PickFrom.forEach(val2 => {
              let foundPos = val2.positions.find(val3 => val3.uuid == val.position_uuid);
              if (foundPos) { positionName = foundPos.name }
            });
            return {
              ...val,
              name: positionName,
              groups: val.groups.map(g => {
                return {
                  ...g,
                  memberNames: g.members.map(mem => this.userAPI.users.get(mem.uuid)).map(usr => usr.first_name + " " + usr.last_name)
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
