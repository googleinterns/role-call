/* eslint-disable @typescript-eslint/naming-convention */

import {CdkDragDrop, copyArrayItem, transferArrayItem,
} from '@angular/cdk/drag-drop';
import {Location} from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import {AfterViewChecked, ChangeDetectorRef, Component, OnDestroy,
  OnInit, ViewChild,
} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {ActivatedRoute} from '@angular/router';
import {PerformanceStatus} from 'src/api_types';
import {Cast, CastApi} from '../api/cast_api.service';
import {Performance, PerformanceApi, PerformanceSegment,
} from '../api/performance-api.service';
import {Piece, PieceApi} from '../api/piece_api.service';
import {UserApi} from '../api/user_api.service';
import {CastDragAndDrop} from '../cast/cast-drag-and-drop.component';
import {Stepper} from '../common_components/stepper.component';
import {CsvGenerator} from '../services/csv-generator.service';
import {ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import {CAST_COUNT} from 'src/constants';

@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class PerformanceEditor implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('stepper') stepper: Stepper;
  @ViewChild('castDnD') castDnD?: CastDragAndDrop;

  stepperOpts = ['Performance Details', 'Pieces & Intermissions', 'Fill Casts',
    'Finalize'];

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
      private csvGenerator: CsvGenerator,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.urlUUID = this.activatedRoute.snapshot.params.uuid;
    this.state = this.createNewPerformance();
    this.performanceAPI.performanceEmitter.subscribe(
        val => this.onPerformanceLoad(val));
    this.piecesAPI.pieceEmitter.subscribe(val => this.onPieceLoad(val));
    this.castAPI.castEmitter.subscribe(val => this.onCastLoad(val));
    this.userAPI.userEmitter.subscribe(() => this.onUserLoad());
    this.performanceAPI.getAllPerformances();
    this.piecesAPI.getAllPieces();
    this.castAPI.getAllCasts();
    this.userAPI.getAllUsers();
    this.initPDFMake();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnDestroy(): void {
    this.deleteWorkingCasts();
  }

  toDateString = (num: number): string =>
    new Date(num).toLocaleDateString('en-US');


  initPDFMake = (): void => {
    pdfMake.fonts = {
      Roboto: {
        // eslint-disable-next-line max-len
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        // eslint-disable-next-line max-len
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        // eslint-disable-next-line max-len
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        // eslint-disable-next-line max-len
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
      },
    };
  };

  onPerformanceLoad = (perfs: Performance[]): void => {
    this.allPerformances = perfs.sort((a, b) => a.step_1.date - b.step_1.date);
    this.publishedPerfs = this.allPerformances.filter(
        val => val.status === PerformanceStatus.PUBLISHED);
    this.draftPerfs = this.allPerformances.filter(
        val => val.status === PerformanceStatus.DRAFT);
    this.performancesLoaded = true;
    this.checkDataLoaded();
  };

  onUserLoad = (): void => {
    this.usersLoaded = true;
    this.checkDataLoaded();
  };

  onPieceLoad = (pieces: Piece[]): void => {
    this.step2AllSegments = [];
    this.step2AllSegments.push(...pieces.map(val => val));
    // Make sure pick list only includes top level segments and excludes
    // children of Super Ballets
    this.step2PickFrom = this.step2AllSegments.filter(
        (segment: Piece) => !segment.siblingId);
    this.step2PickFrom.sort((a, b) => a.name < b.name ? -1 : 1);
    this.step2Data = [];
    this.initStep2Data();
    this.piecesLoaded = true;
    this.checkDataLoaded();
  };

  onCastLoad = (casts: Cast[]): void => {
    this.allCasts = casts;
    this.castsLoaded = true;
    this.checkDataLoaded();
  };

  checkDataLoaded = (): boolean => {
    this.dataLoaded = this.performancesLoaded && this.piecesLoaded &&
                      this.castsLoaded && this.usersLoaded;
    if (this.dataLoaded && this.urlUUID && !this.performanceSelected) {
      this.startAtPerformance(this.urlUUID);
    }
    return this.dataLoaded;
  };

  startAtPerformance = (uuid: string): void => {
    const foundPerf = this.allPerformances.find(val => val.uuid === uuid);
    if (foundPerf) {
      this.onSelectRecentPerformance(foundPerf);
      this.onEditPerformance();
    } else {
      this.location.replaceState('/performance');
      this.urlUUID = undefined;
    }
  };

  updateUrl = (perf: Performance): void => {
    if (perf && this.location.path().startsWith('/performance')) {
      if (perf.uuid) {
        this.urlUUID = perf.uuid;
        this.location.replaceState('/performance/' + perf.uuid);
      } else {
        this.urlUUID = undefined;
        this.location.replaceState('/performance');
      }
    }
  };

  // All Steps ----------------------------------------------------

  createNewPerformance = (): Performance => ({
      uuid: 'performance' + Date.now(),      
      status: PerformanceStatus.DRAFT,
      step_1: {
        title: 'New Performance',
        date: Date.now(),
        state: 'NY',
        city: 'New York',
        country: 'USA',
        venue: '',
        description: ''
      },
      step_2: {
        segments: []
      },
      step_3: {
        segments: []
      }
    }
  );

  onSaveDraft = async (): Promise<void> => {
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
  };


  resetState = (): void => {
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
  };

  onNextClick = (): void => {
    this.stepper.nextStep();
    this.updateBasedOnStep();
  };

  onPrevClick = (): void => {
    this.stepper.prevStep();
    this.updateBasedOnStep();
  };

  onStepChange = (): void => {
    this.updateBasedOnStep();
  };

  updateBasedOnStep = (): void => {
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
  };

  // --------------------------------------------------------------

  // Step 0 -------------------------------------------------------

  onEditPerformance = (): void => {
    if (!this.selectedPerformance) {
      this.respHandler.showError({
        errorMessage: 'Must select a performance to edit!',
        url: 'Error occurred while selecting performance.',
        status: 400,
        statusText: 'Performance not selected!'
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
  };

  onDuplicatePerformance = (perf: Performance): void => {
    if (!this.selectedPerformance) {
      this.respHandler.showError({
        errorMessage: 'Must select a performance to duplicate!',
        url: 'Error occurred while selecting performance.',
        status: 400,
        statusText: 'Performance not selected!'
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
  };


  onNewPerformance = (): void => {
    this.resetPerformance();
    this.performanceSelected = true;
    this.updateUrl(this.state);
  };

  onCancelPerformance = (): void => {
    if (!this.selectedPerformance) {
      this.respHandler.showError({
        errorMessage: 'Must select a performance to cancel!',
        url: 'Error occurred while selecting performance.',
        status: 400,
        statusText: 'Performance not selected!'
      });
      return;
    }
    if (this.selectedPerformance.status === PerformanceStatus.DRAFT) {
      this.performanceAPI.deletePerformance(this.selectedPerformance);
    } else if (this.selectedPerformance.status ===
               PerformanceStatus.PUBLISHED) {
      this.selectedPerformance.status = PerformanceStatus.CANCELED;
      this.selectedPerformance.step_3.segments = [];
      this.selectedPerformance.step_2.segments = [];
      this.performanceAPI.setPerformance(this.selectedPerformance);
    };
  };

  // --------------------------------------------------------------

  // Step 1 -------------------------------------------------------

  onSelectRecentPerformance = (perf: Performance): void => {
    this.selectedPerformance = perf;
    this.updateDateString();
  };

  updateDateString = (): void => {
    const timeZoneOffset = new Date().getTimezoneOffset() * 60000;
    this.date = new Date(this.state.step_1.date - timeZoneOffset);
    const iso = this.date.toISOString();
    const isoSplits = iso.slice(0, iso.length - 1).split(':');
    this.dateStr = isoSplits[0] + ':' + isoSplits[1];
  };

  onStep1Input = (field: string, event: InputEvent): void => {
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
  };

  resetPerformance = (): void => {
    this.state = this.createNewPerformance();
    this.updateDateString();
    this.initStep2Data();
    this.initCastsLoaded = false;
  };

  // --------------------------------------------------------------

  // Step 2 -------------------------------------------------------

  deletePiece = (piece: Piece, index: number): void => {
    this.step2Data = this.step2Data.filter(
        (val, ind) => val.uuid !== piece.uuid || ind !== index);
    this.updateStep2State();
  };

  initStep2Data = (): void => {
    this.step2Data = this.state.step_2.segments
        .map(segmentUUID => this.step2AllSegments
            .find(segment => segment.uuid === segmentUUID))
        .filter(val => val !== undefined);
  };

  updateStep2State = (): void => {
    this.state.step_2.segments = this.step2Data.map(val => val.uuid);
    this.hasSuper = !!this.step2Data.find(segment => segment.type === 'SUPER');
  };

  step2Drop = (event: CdkDragDrop<Piece[]>): void => {
    let draggedSegment;
    if (event.container.id === 'program-list' &&
        event.previousContainer.id === 'program-list') {
      draggedSegment = event.previousContainer.data[event.previousIndex];
      transferArrayItem(event.previousContainer.data, event.container.data,
          event.previousIndex, event.currentIndex);
    } else if (event.previousContainer.id === 'piece-list' &&
               event.container.id === 'program-list') {
      draggedSegment = event.item.data;
      copyArrayItem([draggedSegment], event.container.data, 0,
          event.currentIndex);
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
  };

  // --------------------------------------------------------------

  // Step 3 -------------------------------------------------------

  saveCastChanges = (): void => {
    if (this.selectedSegment) {
      const prevCastUUID = this.state.uuid + 'cast' + this.selectedSegment.uuid;
      if (this.selectedSegment && this.castDnD && this.castDnD.cast &&
          this.castDnD.castSelected) {
        const exportedCast: Cast = this.castDnD.dataToCast();
        if (this.castAPI.hasCast(exportedCast.uuid)) {
          this.castAPI.deleteCast(exportedCast);
        }
        this.segmentToCast.set(exportedCast.uuid, [exportedCast,
          this.primaryGroupNum, this.segmentLength]);
        this.castAPI.setCast(exportedCast, true);
        this.castAPI.getAllCasts();
      }
      if (this.selectedSegment && this.selectedSegment.type === 'SEGMENT') {
        this.intermissions.set(this.selectedIndex, this.segmentLength);
      }
      this.castDnD?.setBoldedCast(this.segmentToCast.get(prevCastUUID)
          ? this.segmentToCast.get(prevCastUUID)[1] : undefined);
    }
  };

  onSelectStep3Segment = (segment: Piece, segmentIx: number): void => {
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
        filled_positions: this.selectedSegment.positions.map(val => ({
            position_uuid: val.uuid,
            groups: [
              {
                group_index: 0,
                members: []
              }
            ]
          }
        ))
      };
      this.segmentToCast.set(newCast.uuid, [newCast, 0, 0]);
      this.castAPI.setCast(newCast, true);
      this.castAPI.getAllCasts();
      castAndPrimLength = this.segmentToCast.get(castUUID);
    }
    this.primaryGroupNum = castAndPrimLength[1];
    this.castDnD?.selectCast({uuid: castUUID, saveDeleteEnabled: false, perfDate: this.state.dateTime});
    this.updateGroupIndices(castAndPrimLength[0]);
    this.updateCastsForSegment();
    this.segmentLength = castAndPrimLength[2];
    this.changeDetectorRef.detectChanges();
    this.castDnD?.setBoldedCast(this.segmentToCast.get(castUUID)[1]);
  };

  updateGroupIndices = (cast: Cast): void => {
    let maxGroupInd = 0;
    for (const pos of cast.filled_positions) {
      for (const group of pos.groups) {
        if (group.group_index > maxGroupInd) {
          maxGroupInd = group.group_index;
        }
      }
    }
    this.chooseFromGroupIndices = Array(maxGroupInd + 1).fill(0)
        .map((_, ind) => ind);
  };

  updateCastsForSegment = (): void => {
    this.castsForSegment = this.allCasts.filter(
        val => val.segment === this.selectedSegment.uuid);
  };

  onChangeCast = (cast: Cast): void => {
    this.updateGroupIndices(cast);
    this.saveCastChanges();
  };

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngAfterViewChecked(): void {
    if (this.selectedSegment && this.shouldSelectFirstSegment) {
      this.onSelectStep3Segment(this.selectedSegment, 0);
      this.shouldSelectFirstSegment = false;
    }
  }

  initStep3Data = (): void => {
    this.selectedSegment = this.step2Data[0];
    this.selectedIndex = 0;
    this.shouldSelectFirstSegment = true;
    const newInterms: Map<number, number> = new Map();
    for (const entry of this.intermissions.entries()) {
      if (this.step2Data.length > entry[0] &&
          this.step2Data[entry[0]].type === 'SEGMENT') {
        newInterms.set(entry[0], entry[1]);
      }
    }
    this.intermissions = newInterms;
    if (!this.initCastsLoaded) {
      // Sort the positions (=custom_groups) of all ballets (=segments)
      // in the performance
      for (const segment of this.state.step_3.segments) {
        segment.custom_groups.sort(
            (a, b) => a.position_order < b.position_order ? -1 : 1);
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
            filled_positions: seg.custom_groups
          };
          this.segmentToCast.set(castUUID, [cast, seg.selected_group,
            seg.length ? seg.length : 0]);
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
  };

  onChoosePrimaryCast = (event: MatSelectChange): void => {
    this.saveCastChanges();
    this.castDnD?.setBoldedCast(event.value);
  };

  onAutofillCast = (cast: Cast): void => {
    const newCast: Cast = JSON.parse(JSON.stringify(cast));
    newCast.uuid = this.state.uuid + 'cast' + this.selectedSegment.uuid;
    this.segmentToCast.set(newCast.uuid, [newCast, 0, this.segmentLength]);
    this.castAPI.setCast(newCast, true);
    this.castAPI.getAllCasts();
    this.updateGroupIndices(newCast);
  };

  onLengthChange = (event: Event): void => {
    const length = ( event.target as HTMLInputElement ).value;
    try {
      this.segmentLength = Number(length);
    } catch (err) {
      this.segmentLength = 0;
    }
    this.saveCastChanges();
  };


  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------

  onSubmit = async (): Promise<void> => {
    const finishedPerf = this.dataToPerformance();
    finishedPerf.status = PerformanceStatus.PUBLISHED;
    this.performanceAPI.setPerformance(finishedPerf).then(() => {
      this.submitted = true;
      this.initCastsLoaded = false;
      this.deleteWorkingCasts();
    }).catch(err => {
      alert('Unable to save performance: ' + err.error.status + ' ' +
            err.error.error);
    });
  };

  deleteWorkingCasts = (): void => {
    for (const entry of this.segmentToCast.entries()) {
      if (this.castAPI.workingCasts.has(entry[0])) {
        this.castAPI.deleteCast(entry[1][0]);
      }
    }
    this.segmentToCast.clear();
  };

  initStep4 = (): void => {
    this.state = this.dataToPerformance();
  };

  exportPerformance = (): void => {
    this.csvGenerator.generateCSVFromPerformance(this.state);
  };

  exportPerformanceAsPDF = (): void => {
    const data = this.state.step_3.segments;
    pdfMake.createPdf(this.getCastDetailsForPDF(data)).open();
  };

  getCastDetailsForPDF = (
    segments: PerformanceSegment[],
  ): any => {
    const content = [];

    content.push({image: 'banner', width: 510, margin: [ 0, 0, 0, 0 ]});
    const perfDetail = this.state.step_1;
    content.push({text: perfDetail.title, style: 'header'});
    content.push({
      text: perfDetail.description,
      style: 'header_desc',
    });

    const step2Data = this.step2Data;
    segments.forEach((segment, index) => {
      const siblingId = step2Data[index] && step2Data[index].siblingId;
      if (siblingId > 0) {
        content.push({text: segment.name, style: 'mleft4'});
      } else {
        content.push({text: segment.name, style: 'mleft1'});
      }
      const positions = segment.custom_groups;
      positions.forEach(position => {
        if (this.hasSuper && siblingId < 1) {
          content.push({text: position.name, style: 'mleft10'});
        } else {
          content.push({text: position.name, style: 'mleft10'});
        }
        const selectedGroup = position.groups.filter(
            grp => grp.group_index === segment.selected_group
        ) || [];
        if (selectedGroup.length > 0) {
          content.push({
            text: selectedGroup[0].memberNames.join(', '),
            style: 'mleft14',
          });
        }
      });
    });

    return {
      content,
      images: {
        banner: `${window.location.origin}/assets/images/AADT-banner.jpg`
      },
      footer: (currentPage, pageCount): any => ({
          columns: [
            {
              text: `Printed at: ${
                new Date(Date.now()).toLocaleDateString()}  ${
                new Date(Date.now()).toLocaleTimeString()}`,
              style: 'footer_timestamp',
            },
            {
              text: `Pages: ${currentPage.toString()} of ${pageCount}`,
              alignment: 'right',
              style: 'footer_page',
            }
          ]
        }
      ),
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
        footer_page: {
          fontSize: 8,
          bold: false,
          italics: true,
          margin: [0, 10, 20, 0],
        },
        footer_timestamp: {
          fontSize: 8,
          bold: false,
          italics: true,
          margin: [20, 10, 0, 0],
        },
      },
    };
  };

  dataToPerformance = (): Performance => {
    this.updateStep2State();
    const newState: Performance = JSON.parse(JSON.stringify(this.state));
    newState.step_3.segments =
        this.step2Data.map((segment, segmentIx) => {
          const segUUID = newState.uuid + 'cast' + segment.uuid;
          const info: [Cast, number, number] = this.segmentToCast.get(segUUID);
          if (segment.type === 'SEGMENT' || segment.type === 'SUPER' || !info) {
            return {
              id: this.segmentToPerfSectionID.has(segUUID)
                  ? this.segmentToPerfSectionID.get(segUUID) : undefined,
              segment: segment.uuid,
              name: segment.name,
              type: segment.type,
              selected_group: undefined,
              length: this.intermissions.get(segmentIx)
                  ? this.intermissions.get(segmentIx) : 0,
              custom_groups: []
            };
          }
          return {
            id: this.segmentToPerfSectionID.has(segUUID)
                ? this.segmentToPerfSectionID.get(segUUID) : undefined,
            segment: segment.uuid,
            name: segment.name,
            type: segment.type,
            selected_group: info ? info[1] : 0,
            length: info[2] ? info[2] : 0,
            custom_groups: info ? info[0].filled_positions.map(val => {
              let positionName = '';
              let positionOrder = 0;
              this.step2AllSegments.forEach(val2 => {
                const foundPos = val2.positions.find(
                    val3 => val3.uuid === val.position_uuid);
                if (foundPos) {
                  positionName = foundPos.name;
                  positionOrder = foundPos.order;
                }
              });
              return {
                ...val,
                name: positionName,
                position_order: positionOrder,
                groups: val.groups.map(g => ({
                    ...g,
                    memberNames: g.members.map(
                        mem => this.userAPI.users.get(mem.uuid)).map(
                        usr => usr.first_name + ' ' +
                               (usr.middle_name ? usr.middle_name + ' ' : '') +
                               usr.last_name +
                               (usr.suffix ? usr.suffix : ''),
                    )
                  })
                )
              };
            }) : []
          };
        });
    return newState;
  };

  onResetFromStart = (e: Event): void => {
    e.preventDefault();
    this.deleteWorkingCasts();
    this.stepper.navigate(0);
    this.resetPerformance();
    this.resetState();
  };

  // --------------------------------------------------------------

  // Private methods

  // Step 2 -------------------------------------------------------

  // Removes the Super Ballet children so every Super Ballet drag just inserts
  // its children right below it, regardless of where the dragging originated
  private removeSuperChildren = (draggedSegment: Piece): void => {
    for (const segment of this.step2Data) {
      if (segment.uuid === draggedSegment.uuid) {
        for (const position of segment.positions) {
          if (position.siblingId) {
            this.step2Data = this.step2Data.filter(filterSegment => Number(
                filterSegment.uuid) !== position.siblingId);
          }
        }
      }
    }
  };

  // A Super Ballet has children that need to be placed right below the Super
  // Ballet
  private addSuperChildren = (draggedSegment: Piece): void => {
    for (let segmentIndex = 0; segmentIndex < this.step2Data.length;
         segmentIndex++) {
      const segment = this.step2Data[segmentIndex];
      if (segment.uuid === draggedSegment.uuid) {
        const childArr: Piece[] = [];
        for (const position of segment.positions) {
          if (position.siblingId) {
            const sibling = this.step2AllSegments.find(
                filterSegment => Number(
                    filterSegment.uuid) === position.siblingId);
            childArr.push(sibling);
          }
        }
        this.step2Data.splice(segmentIndex + 1, 0, ...childArr);
        break;
      }
    }
  };

}
