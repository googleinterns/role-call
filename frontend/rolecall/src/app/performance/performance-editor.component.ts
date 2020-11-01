import {
  CdkDragDrop,
  copyArrayItem,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import _ from 'lodash';
import pdfMake from 'pdfmake/build/pdfmake';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { CAST_COUNT } from 'src/constants';

@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss'],
})
export class PerformanceEditor implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('stepper') stepper: Stepper;
  stepperOpts = [
    'Performance Details',
    'Pieces & Intermissions',
    'Fill Casts',
    'Finalize',
  ];

  state: Performance;

  urlUUID: string;

  performancesLoaded = false;
  usersLoaded = false;
  piecesLoaded = false;
  castsLoaded = false;
  dataLoaded = false;

  // Step 0 -------------------------------------------------------

  performanceSelected = false;
  isEditing = false;

  draftPerfs;
  publishedPerfs;

  lastStepperIndex = 0;

  // Step 1 -------------------------------------------------------

  allPerformances: Performance[] = [];
  selectedPerformance: Performance;
  dateStr: string;
  date: Date;

  // Step 2 -------------------------------------------------------

  hasSuper: boolean;
  step2AllSegments: Piece[];
  step2Data: Piece[];
  step2PickFrom: Piece[];

  // Step 3 -------------------------------------------------------

  selectedSegment: Piece;
  selectedIndex: number;
  @ViewChild('castDnD') castDnD?: CastDragAndDrop;
  // segment uuid to cast, primary cast, and length
  segmentToCast: Map<string, [Cast, number, number]> = new Map();
  // segment uuid to performance section ID
  segmentToPerfSectionID: Map<string, string> = new Map();
  // segment index to length
  intermissions: Map<number, number> = new Map();
  chooseFromGroupIndices: number[] = [];
  primaryGroupNum = 0;
  allCasts: Cast[] = [];

  shouldSelectFirstSegment = false;
  segmentLength = 0;
  initCastsLoaded = false;
  castsForSegment: Cast[] = [];

  // Step 4 -------------------------------------------------------

  submitted = false;

  // --------------------------------------------------------------

  constructor(
    private performanceAPI: PerformanceApi,
    private piecesAPI: PieceApi,
    private castAPI: CastApi,
    private respHandler: ResponseStatusHandlerService,
    private userAPI: UserApi,
    private changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private csvGenerator: CsvGenerator
  ) {}

  toDateString(num: number) {
    return new Date(num).toLocaleDateString('en-US');
  }

  ngOnInit() {
    this.urlUUID = this.activatedRoute.snapshot.params.uuid;
    this.state = this.createNewPerformance();
    this.performanceAPI.performanceEmitter.subscribe((val) =>
      this.onPerformanceLoad(val)
    );
    this.piecesAPI.pieceEmitter.subscribe((val) => this.onPieceLoad(val));
    this.castAPI.castEmitter.subscribe((val) => this.onCastLoad(val));
    this.userAPI.userEmitter.subscribe((val) => this.onUserLoad(val));
    this.performanceAPI.getAllPerformances();
    this.piecesAPI.getAllPieces();
    this.castAPI.getAllCasts();
    this.userAPI.getAllUsers();
    this.initPDFMake();
  }

  ngOnDestroy() {
    this.deleteWorkingCasts();
  }

  initPDFMake() {
    pdfMake.fonts = {
      Roboto: {
        normal:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
      },
    };
  }

  onPerformanceLoad(perfs: Performance[]) {
    this.allPerformances = perfs.sort((a, b) => a.step_1.date - b.step_1.date);
    this.publishedPerfs = this.allPerformances.filter(
      (val) => val.status === PerformanceStatus.PUBLISHED
    );
    this.draftPerfs = this.allPerformances.filter(
      (val) => val.status === PerformanceStatus.DRAFT
    );
    this.performancesLoaded = true;
    this.checkDataLoaded();
  }

  onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.checkDataLoaded();
  }

  onPieceLoad(pieces: Piece[]) {
    this.step2AllSegments = [];
    this.step2AllSegments.push(...pieces.map((val) => val));
    // Make sure pick list only includes top level segments and excludes
    // children of Super Ballets
    this.step2PickFrom = this.step2AllSegments.filter(
      (segment: Piece) => !segment.siblingId
    );
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
    this.dataLoaded =
      this.performancesLoaded &&
      this.piecesLoaded &&
      this.castsLoaded &&
      this.usersLoaded;
    if (this.dataLoaded && this.urlUUID && !this.performanceSelected) {
      this.startAtPerformance(this.urlUUID);
    }
    return this.dataLoaded;
  }

  startAtPerformance(uuid: string) {
    const foundPerf = this.allPerformances.find((val) => val.uuid === uuid);
    if (foundPerf) {
      this.onSelectRecentPerformance(foundPerf);
      this.onEditPerformance();
    } else {
      this.location.replaceState('/performance');
      this.urlUUID = undefined;
    }
  }

  updateUrl(perf: Performance) {
    if (perf && this.location.path().startsWith('/performance')) {
      if (perf.uuid) {
        this.urlUUID = perf.uuid;
        this.location.replaceState('/performance/' + perf.uuid);
      } else {
        this.urlUUID = undefined;
        this.location.replaceState('/performance');
      }
    }
  }

  // All Steps ----------------------------------------------------

  createNewPerformance(): Performance {
    return {
      uuid: 'performance' + Date.now(),
      status: PerformanceStatus.DRAFT,
      step_1: {
        title: 'New Performance',
        date: Date.now(),
        state: 'NY',
        city: 'New York',
        country: 'USA',
        venue: '',
        description: '',
      },
      step_2: {
        segments: [],
      },
      step_3: {
        segments: [],
      },
    };
  }

  async onSaveDraft() {
    this.initStep3Data();
    this.initStep4();
    this.state.status = PerformanceStatus.DRAFT;
    // Saving casts results in an immediate cast load.
    // Clear a key parameter to prevent deadly embrace
    if (this.castDnD) {
      this.castDnD.castSelected = false;
    }

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
    this.location.replaceState('/performance');
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

  updateBasedOnStep() {
    if (this.stepper.currentStepIndex === 1) {
      this.initStep2Data();
      this.updateStep2State();
    }
    if (this.stepper.currentStepIndex === 2) {
      this.initStep3Data();
    }
    if (this.stepper.currentStepIndex === 3) {
      this.initStep4();
    }
    this.lastStepperIndex = this.stepper.currentStepIndex;
  }

  // --------------------------------------------------------------

  // Step 0 -------------------------------------------------------

  onEditPerformance() {
    if (!this.selectedPerformance) {
      this.respHandler.showError({
        errorMessage: 'Must select a performance to edit!',
        url: 'Error occurred while selecting performance.',
        status: 400,
        statusText: 'Performance not selected!',
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
        errorMessage: 'Must select a performance to duplicate!',
        url: 'Error occurred while selecting performance.',
        status: 400,
        statusText: 'Performance not selected!',
      });
      return;
    }
    this.state = JSON.parse(JSON.stringify(perf));
    this.state.uuid = 'performance' + Date.now();
    this.state.step_1.title = this.state.step_1.title + ' copy';
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
        errorMessage: 'Must select a performance to cancel!',
        url: 'Error occurred while selecting performance.',
        status: 400,
        statusText: 'Performance not selected!',
      });
      return;
    }
    if (this.selectedPerformance.status === PerformanceStatus.DRAFT) {
      this.performanceAPI.deletePerformance(this.selectedPerformance);
    } else if (
      this.selectedPerformance.status === PerformanceStatus.PUBLISHED
    ) {
      this.selectedPerformance.status = PerformanceStatus.CANCELED;
      this.selectedPerformance.step_3.segments = [];
      this.selectedPerformance.step_2.segments = [];
      this.performanceAPI.setPerformance(this.selectedPerformance);
    }
  }

  // --------------------------------------------------------------

  // Step 1 -------------------------------------------------------

  onSelectRecentPerformance(perf: Performance) {
    this.selectedPerformance = perf;
    this.updateDateString();
  }

  updateDateString() {
    const timeZoneOffset = new Date().getTimezoneOffset() * 60000;
    this.date = new Date(this.state.step_1.date - timeZoneOffset);
    const iso = this.date.toISOString();
    const isoSplits = iso.slice(0, iso.length - 1).split(':');
    this.dateStr = isoSplits[0] + ':' + isoSplits[1];
  }

  onStep1Input(field: string, event: InputEvent) {
    const targetValue = (event.target as HTMLInputElement).value;
    if (field === 'title') {
      this.state.step_1.title = targetValue;
    } else if (field === 'city') {
      this.state.step_1.city = targetValue;
    } else if (field === 'country') {
      this.state.step_1.country = targetValue;
    } else if (field === 'state') {
      this.state.step_1.state = targetValue;
    } else if (field === 'venue') {
      this.state.step_1.venue = targetValue;
    } else if (field === 'date') {
      this.state.step_1.date = Date.parse(targetValue);
      this.updateDateString();
    } else if (field === 'description') {
      this.state.step_1.description = targetValue;
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

  deletePiece(piece: Piece, index: number) {
    this.step2Data = this.step2Data.filter(
      (val, ind) => val.uuid !== piece.uuid || ind !== index
    );
    this.updateStep2State();
  }

  initStep2Data() {
    this.step2Data = this.state.step_2.segments
      .map((segmentUUID) =>
        this.step2AllSegments.find((segment) => segment.uuid === segmentUUID)
      )
      .filter((val) => val !== undefined);
  }

  updateStep2State() {
    this.state.step_2.segments = this.step2Data.map((val) => val.uuid);
    this.hasSuper = !!this.step2Data.find(
      (segment) => segment.type === 'SUPER'
    );
  }

  step2Drop(event: CdkDragDrop<Piece[]>) {
    let draggedSegment;
    if (
      event.container.id === 'program-list' &&
      event.previousContainer.id === 'program-list'
    ) {
      draggedSegment = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else if (
      event.previousContainer.id === 'piece-list' &&
      event.container.id === 'program-list'
    ) {
      draggedSegment = event.item.data;
      copyArrayItem(
        [draggedSegment],
        event.container.data,
        0,
        event.currentIndex
      );
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

  // Removes the Super Ballet children so every Super Ballet drag just inserts
  // its children right below it, regardless of where the dragging originated
  private removeSuperChildren(draggedSegment: Piece) {
    for (const segment of this.step2Data) {
      if (segment.uuid === draggedSegment.uuid) {
        for (const position of segment.positions) {
          if (position.siblingId) {
            this.step2Data = this.step2Data.filter(
              (filterSegment) =>
                Number(filterSegment.uuid) !== position.siblingId
            );
          }
        }
      }
    }
  }

  // A Super Ballet has children that need to be placed right below the Super
  // Ballet
  private addSuperChildren(draggedSegment: Piece) {
    for (
      let segmentIndex = 0;
      segmentIndex < this.step2Data.length;
      segmentIndex++
    ) {
      const segment = this.step2Data[segmentIndex];
      if (segment.uuid === draggedSegment.uuid) {
        const childArr: Piece[] = [];
        for (const position of segment.positions) {
          if (position.siblingId) {
            const sibling = this.step2AllSegments.find(
              (filterSegment) =>
                Number(filterSegment.uuid) === position.siblingId
            );
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

  saveCastChanges() {
    if (this.selectedSegment) {
      const prevCastUUID = this.state.uuid + 'cast' + this.selectedSegment.uuid;
      if (
        this.selectedSegment &&
        this.castDnD &&
        this.castDnD.cast &&
        this.castDnD.castSelected
      ) {
        const exportedCast: Cast = this.castDnD.dataToCast();
        if (this.castAPI.hasCast(exportedCast.uuid)) {
          this.castAPI.deleteCast(exportedCast);
        }
        this.segmentToCast.set(exportedCast.uuid, [
          exportedCast,
          this.primaryGroupNum,
          this.segmentLength,
        ]);
        this.castAPI.setCast(exportedCast, true);
        this.castAPI.getAllCasts();
      }
      if (this.selectedSegment && this.selectedSegment.type === 'SEGMENT') {
        this.intermissions.set(this.selectedIndex, this.segmentLength);
      }
      this.castDnD?.setBoldedCast(
        this.segmentToCast.get(prevCastUUID)
          ? this.segmentToCast.get(prevCastUUID)[1]
          : undefined
      );
    }
  }

  onSelectStep3Segment(segment: Piece, segmentIx: number) {
    this.saveCastChanges();
    this.selectedSegment = segment;
    this.selectedIndex = segmentIx;
    if (segment.type === 'SEGMENT' || segment.type === 'SUPER') {
      if (this.intermissions.has(segmentIx)) {
        this.segmentLength = this.intermissions.get(segmentIx);
      } else {
        this.segmentLength = 0;
      }
      return;
    }
    const castUUID = this.state.uuid + 'cast' + this.selectedSegment.uuid;
    let castAndPrimLength: [Cast, number, number];
    if (this.segmentToCast.has(castUUID)) {
      castAndPrimLength = this.segmentToCast.get(castUUID);
    } else {
      const newCast: Cast = {
        uuid: castUUID,
        name: 'New Cast',
        segment: this.selectedSegment.uuid,
        castCount: CAST_COUNT,
        filled_positions: this.selectedSegment.positions.map((val) => {
          return {
            position_uuid: val.uuid,
            groups: [
              {
                group_index: 0,
                members: [],
              },
            ],
          };
        }),
      };
      this.segmentToCast.set(newCast.uuid, [newCast, 0, 0]);
      this.castAPI.setCast(newCast, true);
      this.castAPI.getAllCasts();
      castAndPrimLength = this.segmentToCast.get(castUUID);
    }
    this.primaryGroupNum = castAndPrimLength[1];
    this.castDnD?.selectCast({ uuid: castUUID, saveDeleteEnabled: false });
    this.updateGroupIndices(castAndPrimLength[0]);
    this.updateCastsForSegment();
    this.segmentLength = castAndPrimLength[2];
    this.changeDetectorRef.detectChanges();
    this.castDnD?.setBoldedCast(this.segmentToCast.get(castUUID)[1]);
  }

  updateGroupIndices(cast: Cast) {
    let maxGroupInd = 0;
    for (const pos of cast.filled_positions) {
      for (const group of pos.groups) {
        if (group.group_index > maxGroupInd) {
          maxGroupInd = group.group_index;
        }
      }
    }
    this.chooseFromGroupIndices = Array(maxGroupInd + 1)
      .fill(0)
      .map((val, ind) => ind);
  }

  updateCastsForSegment() {
    this.castsForSegment = this.allCasts.filter(
      (val) => val.segment === this.selectedSegment.uuid
    );
  }

  onChangeCast(cast: Cast) {
    this.updateGroupIndices(cast);
    this.saveCastChanges();
  }

  ngAfterViewChecked() {
    if (this.selectedSegment && this.shouldSelectFirstSegment) {
      this.onSelectStep3Segment(this.selectedSegment, 0);
      this.shouldSelectFirstSegment = false;
    }
  }

  initStep3Data() {
    this.selectedSegment = this.step2Data[0];
    this.selectedIndex = 0;
    this.shouldSelectFirstSegment = true;
    const newInterms: Map<number, number> = new Map();
    for (const entry of this.intermissions.entries()) {
      if (
        this.step2Data.length > entry[0] &&
        this.step2Data[entry[0]].type === 'SEGMENT'
      ) {
        newInterms.set(entry[0], entry[1]);
      }
    }
    this.intermissions = newInterms;
    if (!this.initCastsLoaded) {
      // Sort the positions (=custom_groups) of all ballets (=segments)
      // in the performance
      for (const segment of this.state.step_3.segments) {
        segment.custom_groups.sort((a, b) =>
          a.position_order < b.position_order ? -1 : 1
        );
      }
      for (const [i, seg] of this.state.step_3.segments.entries()) {
        const castUUID = this.state.uuid + 'cast' + seg.segment;
        if (this.piecesAPI.pieces.get(seg.segment).type === 'SEGMENT') {
          this.intermissions.set(i, seg.length ? seg.length : 0);
          this.segmentToPerfSectionID.set(castUUID, seg.id);
        } else {
          const cast: Cast = {
            uuid: castUUID,
            name: 'Copied Cast',
            segment: seg.segment,
            castCount: CAST_COUNT,
            filled_positions: seg.custom_groups,
          };
          this.segmentToCast.set(castUUID, [
            cast,
            seg.selected_group,
            seg.length ? seg.length : 0,
          ]);
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
    this.castDnD?.setBoldedCast(event.value);
  }

  onAutofillCast(cast: Cast) {
    const newCast: Cast = JSON.parse(JSON.stringify(cast));
    newCast.uuid = this.state.uuid + 'cast' + this.selectedSegment.uuid;
    this.segmentToCast.set(newCast.uuid, [newCast, 0, this.segmentLength]);
    this.castAPI.setCast(newCast, true);
    this.castAPI.getAllCasts();
    this.updateGroupIndices(newCast);
  }

  onLengthChange(event: any) {
    const length = event.target.value;
    try {
      this.segmentLength = Number(length);
    } catch (err) {
      this.segmentLength = 0;
    }
    this.saveCastChanges();
  }

  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------

  async onSubmit() {
    const finishedPerf = this.dataToPerformance();
    finishedPerf.status = PerformanceStatus.PUBLISHED;
    this.performanceAPI
      .setPerformance(finishedPerf)
      .then((val) => {
        this.submitted = true;
        this.initCastsLoaded = false;
        this.deleteWorkingCasts();
      })
      .catch((err) => {
        alert(
          'Unable to save performance: ' +
            err.error.status +
            ' ' +
            err.error.error
        );
      });
  }

  deleteWorkingCasts() {
    for (const entry of this.segmentToCast.entries()) {
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
  exportPerformanceAsPDF() {
    const data = _.get(this.state, 'step_3.segments');
    pdfMake.createPdf(this.getCastDetailsForPDF(data)).open();
    console.log(data);
    console.log(this.step2Data);
  }
  getCastDetailsForPDF(segments: Piece[]) {
    const content = [];
    const picURI =
      'data:image/png;base64,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';
    content.push({ image: picURI });

    const perfDetail = _.get(this, 'state.step_1');

    content.push({ text: _.get(perfDetail, 'title'), style: 'header' });
    content.push({
      text: _.get(perfDetail, 'description'),
      style: 'header_desc',
    });

    const { step2Data } = this;
    _.each(segments, (seg, index) => {
      const siblingId = _.get(step2Data, `[${index}].siblingId`);
      if (siblingId > 0) {
        content.push({ text: seg.name, style: 'mleft4' });
      } else {
        content.push({ text: seg.name, style: 'mleft1' });
      }
      const positions = _.get(seg, 'custom_groups');
      _.each(positions, (pos) => {
        if (this.hasSuper && siblingId < 1) {
          content.push({ text: _.get(pos, 'name'), style: 'mleft10' });
        } else {
          content.push({ text: _.get(pos, 'name'), style: 'mleft10' });
        }
        const selectedGroup = _.filter(
          pos.groups,
          (grp) => grp.group_index === seg.selected_group
        );
        content.push({
          text: _.join(_.get(selectedGroup, '[0].memberNames'), ', '),
          style: 'mleft14',
        });
      });
    });

    return {
      content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 10],
        },
        header_desc: {
          fontSize: 10,
          bold: false,
          italics: true,
          alignment: 'center',
          margin: [0, 10, 0, 10],
        },
        mleft4: {
          fontSize: 16,
          bold: true,
          margin: [40, 10, 0, 0],
        },
        mleft1: {
          fontSize: 18,
          bold: true,
          margin: [10, 10, 0, 0],
        },
        mleft10: {
          fontSize: 14,
          bold: false,
          italics: false,
          decoration: 'underline',
          margin: [100, 10, 0, 0],
        },
        mleft14: {
          fontSize: 14,
          bold: false,
          italics: true,
          margin: [130, 10, 0, 0],
        },
        // mleft7: {
        //   fontSize: 14,
        //   bold: false,
        //   margin: [70, 2, 0, 0],
        // },
      },
    };
  }
  dataToPerformance(): Performance {
    this.updateStep2State();
    const newState: Performance = JSON.parse(JSON.stringify(this.state));
    newState.step_3.segments = this.step2Data.map((segment, segmentIx) => {
      const segUUID = newState.uuid + 'cast' + segment.uuid;
      const info: [Cast, number, number] = this.segmentToCast.get(segUUID);
      if (segment.type === 'SEGMENT' || segment.type === 'SUPER' || !info) {
        return {
          id: this.segmentToPerfSectionID.has(segUUID)
            ? this.segmentToPerfSectionID.get(segUUID)
            : undefined,
          segment: segment.uuid,
          name: segment.name,
          type: segment.type,
          selected_group: undefined,
          length: this.intermissions.get(segmentIx)
            ? this.intermissions.get(segmentIx)
            : 0,
          custom_groups: [],
        };
      }
      return {
        id: this.segmentToPerfSectionID.has(segUUID)
          ? this.segmentToPerfSectionID.get(segUUID)
          : undefined,
        segment: segment.uuid,
        name: segment.name,
        type: segment.type,
        selected_group: info ? info[1] : 0,
        length: info[2] ? info[2] : 0,
        custom_groups: info
          ? info[0].filled_positions.map((val) => {
              let positionName = '';
              let positionOrder = 0;
              this.step2AllSegments.forEach((val2) => {
                const foundPos = val2.positions.find(
                  (val3) => val3.uuid === val.position_uuid
                );
                if (foundPos) {
                  positionName = foundPos.name;
                  positionOrder = foundPos.order;
                }
              });
              return {
                ...val,
                name: positionName,
                position_order: positionOrder,
                groups: val.groups.map((g) => {
                  return {
                    ...g,
                    memberNames: g.members
                      .map((mem) => this.userAPI.users.get(mem.uuid))
                      .map(
                        (usr) =>
                          usr.first_name +
                          ' ' +
                          (usr.middle_name ? usr.middle_name + ' ' : '') +
                          usr.last_name +
                          (usr.suffix ? usr.suffix : '')
                      ),
                  };
                }),
              };
            })
          : [],
      };
    });
    return newState;
  }

  onReturn() {
    this.onPrevClick();
    this.submitted = false;
  }

  onResetFromStart(e) {
    e.preventDefault();
    this.deleteWorkingCasts();
    this.stepper.navigate(0);
    this.resetPerformance();
    this.resetState();
  }

  // --------------------------------------------------------------
}
