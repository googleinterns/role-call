/* eslint-disable @typescript-eslint/naming-convention */

import { CdkDragDrop, copyArrayItem, transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import { AfterViewChecked, ChangeDetectorRef, Component,
  OnDestroy, OnInit, ViewChild, ViewChildren, QueryList,
  AfterViewInit,
} from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { PerformanceStatus } from 'src/api-types';
import { Cast, CastApi } from '../api/cast-api.service';
import { Unavailability, UnavailabilityApi,
} from '../api/unavailability-api.service';
import { Performance, PerformanceApi, PerformanceSegment,
} from '../api/performance-api.service';
import { Segment, SegmentApi } from '../api/segment-api.service';
import { User, UserApi } from '../api/user-api.service';
import { CastDragAndDrop } from '../cast/cast-drag-and-drop.component';
import { Stepper } from '../common-components/stepper.component';
import { CsvGenerator} from '../services/csv-generator.service';
// import {ResponseStatusHandlerService,
// } from '../services/response-status-handler.service';
import { CAST_COUNT } from 'src/constants';
import { WorkUnav } from '../api/unavailability-api.service';
import { Subscription } from 'rxjs';
import { ContextService } from '../services/context.service';


@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class PerformanceEditor implements OnInit, OnDestroy,
AfterViewInit, AfterViewChecked {

  @ViewChild('stepper') stepper: Stepper;
  @ViewChildren('castDnD') castDnDQ?: QueryList<CastDragAndDrop>;

  /** The cast drag and drop sub screen */
  castDnD?: CastDragAndDrop;

  stepperOpts = [
    'Performance Details',
    'Segments & Intermissions',
    'Fill Casts',
    'Finalize',
  ];

  state: Performance;

  urlUUID: string;

  workUnavs: WorkUnav[] = [];

  performanceSubscription: Subscription;
  segmentSubscription: Subscription;
  castSubscription: Subscription;
  userSubscription: Subscription;
  unavSubscription: Subscription;

  performancesLoaded = false;
  usersLoaded = false;
  segmentsLoaded = false;
  castsLoaded = false;
  unavsLoaded = false;
  dataLoaded = false;

  haveCalcedUserUnavs = false;
  haveCalcedPerfUnavs = false;

  canSave = true;
  canDelete = false;

  // Step 0 -------------------------------------------------------

  performanceSelected = false;
  isEditing = false;

  draftPerfs: Performance[] = [];
  publishedPerfs: Performance[] = [];
  displayedPublishedPerfs: Performance[] = [];

  lastStepperIndex = 0;
  lastPerfDate: Date;

  listStartDate: Date = new Date();
  listStart: number;

  // Step 1 -------------------------------------------------------

  allPerformances: Performance[] = [];

  selectedPerformance: Performance;
  dateStr: string;
  date: Date;
  statusOpts = [
    'Draft',
    'Published',
    'Canceled',
  ];
  currentStatusOpts: string[];
  selectedStatus: string;
  performanceDate;

  // Step 2 -------------------------------------------------------

  hasSuper: boolean;
  step2AllSegments: Segment[];
  step2Data: Segment[];
  step2PickFrom: Segment[];

  // Step 3 -------------------------------------------------------

  selectedSegment: Segment;
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
  allUsers: User[] = [];

  shouldSelectFirstSegment = false;
  segmentLength = 0;
  initCastsLoaded = false;
  castsForSegment: Cast[] = [];

  // Step 4 -------------------------------------------------------

  submitted = false;

  // --------------------------------------------------------------

  private subscriptions = new Subscription();

  constructor(
      private g: ContextService,
      private activatedRoute: ActivatedRoute,
      private location: Location,
      private cdRef: ChangeDetectorRef,
      private performanceApi: PerformanceApi,
      private segmentApi: SegmentApi,
      private castApi: CastApi,
      private userApi: UserApi,
      private unavApi: UnavailabilityApi,
      private csvGenerator: CsvGenerator,
  ) {
    this.listStart = this.listStartDate.getTime();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.haveCalcedUserUnavs = false;
    this.haveCalcedPerfUnavs = false;
    // The below code is triggered when performance is selected
    // is the dashboard.
    this.urlUUID = this.activatedRoute.snapshot.params.uuid;
    this.state = this.createNewPerformance();
    this.performanceSubscription =
        this.performanceApi.cache.loadedAll.subscribe(items =>
            this.onPerformanceLoad(items as Performance[]));
    this.segmentSubscription =
        this.segmentApi.cache.loadedAll.subscribe(items =>
            this.onSegmentLoad(items as Segment[]));
    this.castSubscription =
        this.castApi.cache.loadedAll.subscribe(items =>
            this.onCastLoad(items as Cast[]));
    this.userSubscription =
        this.userApi.cache.loadedAll.subscribe(val =>
            this.onUserLoad(val as User[]));
    this.unavSubscription =
        this.unavApi.cache.loadedAll.subscribe(vals =>
            this.onUnavsLoad(vals as Unavailability[]));
    this.requestData();
    this.initPDFMake();
  }

  requestData = async (
    forceRead: boolean = false,
  ): Promise<void> => {
    this.performanceApi.loadAllPerformances(forceRead);
    // await to avoid second db load of segments.
    await this.segmentApi.loadAllSegments(forceRead);
    this.castApi.loadAllCasts(forceRead);
    this.userApi.loadAllUsers(forceRead);
    this.unavApi.loadAllUnavailabilities(forceRead);
  };

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngAfterViewInit(): void {
    if (this.castDnDQ!.first) {
      this.setupDragAndDropView();
      this.cdRef.detectChanges();
    }
    this.subscriptions.add(this.castDnDQ!.changes.subscribe(() => {
      this.setupDragAndDropView();
    }));
  }

  setupDragAndDropView = (): void => {
    this.castDnD = this.castDnDQ.first;
    this.checkDataLoaded();
  };

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnDestroy(): void {
    this.deleteWorkingCasts();
    this.performanceSubscription.unsubscribe();
    this.segmentSubscription.unsubscribe();
    this.castSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.unavSubscription.unsubscribe();

    this.subscriptions.unsubscribe();
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

  changeListStartDate = (newDate: Date): string => {
    if (newDate.getTime() === new Date(0).getTime()) {
      this.setDataLoaded(false);
      this.requestData(true);
    } else {
      this.listStartDate = newDate;
      this.listStart = this.listStartDate.getTime();
      this.filterOnDate();
    }
    return `Published Performances After ${
      this.listStartDate.toLocaleDateString()}`;
  };

  onPerformanceLoad = (perfs: Performance[]): void => {
    this.allPerformances = perfs.sort((a, b) => a.step_1.date - b.step_1.date);
    this.publishedPerfs = this.allPerformances.filter(
        val => val.status === PerformanceStatus.PUBLISHED);
    this.draftPerfs = this.allPerformances.filter(
        val => val.status === PerformanceStatus.DRAFT
          || val.status === PerformanceStatus.CANCELED);
    this.filterOnDate();
    this.performancesLoaded = true;
    this.checkDataLoaded();
  };

  onUserLoad = (users: User[]): void => {
    this.allUsers = users.filter(user => user.has_roles.isDancer);
    this.allUsers = this.allUsers.sort(
        (a, b) => a.last_name.toLocaleLowerCase() <
        b.last_name.toLocaleLowerCase() ? -1 : 1);
    this.usersLoaded = true;
    this.checkDataLoaded();
  };

  onSegmentLoad = (segments: Segment[]): void => {
    this.step2AllSegments = [];
    this.step2AllSegments.push(...segments.map(val => val));
    // Make sure pick list only includes top level segments and excludes
    // children of Super Ballets
    this.step2PickFrom = this.step2AllSegments.filter(
        (segment: Segment) => !segment.siblingId);
    this.step2PickFrom.sort((a, b) => a.name < b.name ? -1 : 1);
    this.step2Data = [];
    this.initStep2Data();
    this.segmentsLoaded = true;
    this.checkDataLoaded();
  };

  onCastLoad = (casts: Cast[]): void => {
    this.allCasts = casts;
    this.castsLoaded = true;
    this.checkDataLoaded();
  };

  onUnavsLoad = (
    unavs: Unavailability[],
  ): void => {
    this.workUnavs = unavs.map(u => ({
      userId: u.userId,
      startDate: new Date(u.startDate),
      endDate: new Date(u.endDate),
    })).sort((a, b) =>
      a.userId === b.userId ? a.userId - b.userId :
        a.startDate === b.startDate ?
          ( a.startDate > b.startDate ? 1 : -1) :
            (a.endDate > b.endDate ? 1 : -1));
    this.unavsLoaded = true;
    this.checkDataLoaded();
  };

  checkUserUnavs = (perfDate: Date): void => {
    // clear unavailibility data, if present
    this.allUsers.forEach(u => u.isAbsent = false);
    this.allUsers.forEach(user => {
      const userId = Number(user.uuid);
      let findIx = this.workUnavs.findIndex(wu => wu.userId === userId);
      if (findIx > -1) {
        while (findIx < this.workUnavs.length) {
          const wunav = this.workUnavs[findIx];
          if (wunav.userId === userId) {
            if (wunav.startDate <= perfDate && wunav.endDate >= perfDate) {
              user.isAbsent = true;
              break;
            }
          }
          findIx += 1;
        }
      }
    });
  };

  checkSegmentUnavs = (perf: Performance): void => {
    const perfDate = new Date(perf.step_1.date);
    if (this.lastPerfDate !== perfDate) {
      this.lastPerfDate = perfDate;
      this.checkUserUnavs(perfDate);
      this.haveCalcedUserUnavs = true;
    }
    perf.step_3.perfSegments.forEach(ps => {
      ps.hasAbsence = false;
      ps.custom_groups.forEach(cg => {
        cg.groups.forEach( g => {
          // 'every' stops when false is returned
          g.members.forEach(m => {
            const user = this.userApi.lookup(m.uuid);
            if (user.isAbsent) {
              if (g.group_index === ps.selected_group) {
                ps.hasAbsence = true;
              }
            }
          });
        });
      });
    });
  };

  checkQuickUnavs = (perf: Performance): void => {
    const perfDate = new Date(perf.step_1.date);
    if (this.lastPerfDate !== perfDate) {
      this.lastPerfDate = perfDate;
      this.checkUserUnavs(perfDate);
      this.haveCalcedUserUnavs = true;
    }
    perf.hasAbsence = !perf.step_3.perfSegments.every(ps =>
      ps.custom_groups.every(cg =>
        cg.groups.every( g =>
          g.members.every(m => {
            const user = this.userApi.lookup(m.uuid);
            if (user.isAbsent) {
              if (g.group_index === ps.selected_group) {
                return false;
              }
            }
            return true;
          }))));
  };

  checkCastUnavs = (perf: Performance): void => {
    const perfDate = new Date(perf.step_1.date);
    if (this.lastPerfDate !== perfDate) {
      this.lastPerfDate = perfDate;
      this.checkUserUnavs(perfDate);
      this.haveCalcedUserUnavs = true;
    }
    this.allCasts.forEach(cast => {
      cast.filled_positions.forEach(fp => {
        fp.hasAbsence = false;
        fp.groups.forEach(group => {
          group.members.forEach(m => {
            const user = this.userApi.lookup(m.uuid);
            m.hasAbsence = user.isAbsent;
            if (user.isAbsent) {
              fp.hasAbsence = true;
            }
          });
        });
      });
    });
  };

  checkDataLoaded = (): boolean => {
    this.dataLoaded = this.performancesLoaded && this.segmentsLoaded &&
        this.castsLoaded && this.usersLoaded && this.unavsLoaded;
    if (this.dataLoaded) {
     if (!this.isEditing) {
        this.displayedPublishedPerfs.forEach(perf => {
          this.checkQuickUnavs(perf);
        });
      }
    }
    if (this.dataLoaded && this.urlUUID && !this.performanceSelected) {
      this.startAtPerformance(this.urlUUID);
    }
    return this.dataLoaded;
  };

  filterOnDate = (): void => {
    this.displayedPublishedPerfs = this.publishedPerfs.filter(perf =>
      perf.step_1.date > this.listStart);
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

  canGoNext = (): boolean => {
    if (this.stepper) {
      return this.stepper.hasNextStep();
    }
    // To avoid ExpressionChangedAfterItHasBeenCheckedError
    // Set to true below
    return true;
  };

  canGoPrev = (): boolean => {
    if (this.stepper) {
      return this.stepper.hasPrevStep();
    }
    return false;
  };

  canPublish = (): boolean => {
    // put in more logic to make sure that performance is
    // properly specified (or at least filled in)
    if (this.selectedPerformance &&
        this.selectedPerformance.status !== PerformanceStatus.PUBLISHED) {
      return true;
    }
    return false;
  };

  canCancel = (): boolean => {
    if (this.selectedPerformance &&
        this.selectedPerformance.status === PerformanceStatus.PUBLISHED) {
      return true;
    }
    return false;
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
        perfSegments: []
      }
    }
  );

  canSavePerformance = (): boolean =>
    this.canSave;


  onSavePerformance = async (): Promise<void> => {
    this.initStep3Data(false);
    this.initStep4();
    // Saving casts results in an immediate cast load.
    // Clear a key parameter to prevent deadly embrace
    if (this.castDnD) {
      this.castDnD.castSelected = false;
    }

    await this.performanceApi.cache.set(this.dataToPerformance());
    this.requestData();
    this.deleteWorkingCasts();
    this.resetState(true);
  };

  setDataLoaded = (value: boolean): void => {
    this.performancesLoaded = value;
    this.usersLoaded = value;
    this.segmentsLoaded = value;
    this.castsLoaded = value;
    this.unavsLoaded = value;
    this.dataLoaded = value;
  };

  resetState = (reloadData: boolean): void => {
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
    if (reloadData) {
      this.setDataLoaded(false);
      this.requestData();
    }
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
      this.initStep3Data(false);
    }
    if (this.stepper.currentStepIndex === 3) {
      this.initStep4();
    }
    this.lastStepperIndex = this.stepper.currentStepIndex;
  };

  // --------------------------------------------------------------

  // Step 0 -------------------------------------------------------

  onEditPerformance = async (
    skipInit: boolean = false,
  ): Promise<void> => {
    this.isEditing = true;
    if (!skipInit) {
      this.state = JSON.parse(JSON.stringify(this.selectedPerformance));
    }
    this.updateDateString();
    this.initStep2Data();
    this.updateStep2State();
    this.performanceSelected = true;
    this.canDelete = true;
    await this.initStep3Data(true);
    // initStep3Data reads in all casts. Calculate unvailabilities.
    if (!this.g.checkUnavs) {
      this.checkCastUnavs(this.state);
    }
    this.initStep4();
    this.updateUrl(this.state);
    this.selectedStatus = this.statusToString(this.state.status);
    this.currentStatusOpts = this.statusOpts.slice(0,
      this.state.status === PerformanceStatus.DRAFT ? 1
      : this.state.status === PerformanceStatus.PUBLISHED ? 2 : 3);
  };

  onDuplicatePerformance = async (): Promise<void> => {
    this.state = JSON.parse(JSON.stringify(this.selectedPerformance));
    this.state.uuid = 'performance' + Date.now();
    this.state.step_1.title = this.state.step_1.title + ' copy';
    this.state.status = PerformanceStatus.DRAFT;
    this.selectedStatus = this.statusOpts[0];
    this.stepper.firstStep();
    this.initCastsLoaded = false;
    this.onEditPerformance(true);
  };


  onNewPerformance = (): void => {
    this.resetPerformance();
    this.isEditing = true;
    this.performanceSelected = true;
    this.canDelete = false;
    this.updateUrl(this.state);
  };

  canDeletePerformance = (): boolean =>
    this.canDelete;


  onDeletePerformance = (): void => {
    this.performanceApi.cache.delete(this.selectedPerformance);
    this.resetState(true);
  };

  // --------------------------------------------------------------

  // Step 1 -------------------------------------------------------

  onSelectRecentPerformance = (perf: Performance): void => {
    this.selectedPerformance = perf;
    this.performanceDate = new Date(perf.step_1.date);
    this.checkUserUnavs(this.performanceDate);
    this.updateDateString();
    this.onEditPerformance();
  };

  updateDateString = (): void => {
    const perfOffs =
      new Date(this.state.step_1.date).getTimezoneOffset() * 60000;
    this.date = new Date(this.state.step_1.date - perfOffs);
    const iso = this.date.toISOString();
    const isoSplits = iso.slice(0, iso.length - 1).split(':');
    this.dateStr = isoSplits[0] + ':' + isoSplits[1];
  };

  statusFromString = (statusStr: string): PerformanceStatus => {
    switch (statusStr) {
      case 'Published': return PerformanceStatus.PUBLISHED;
      case 'Canceled': return PerformanceStatus.CANCELED;
      default: return PerformanceStatus.DRAFT;
    }
  };

  statusToString = (status: PerformanceStatus): string => {
    switch (status) {
      case PerformanceStatus.PUBLISHED: return 'Published';
      case PerformanceStatus.CANCELED: return 'Canceled';
      default: return 'Draft';
    }
  };

  onSelectStatus = (
    event: MatSelectChange,
  ): void => {
    this.selectedStatus = event.value;
    this.state.status = this.statusFromString(this.selectedStatus);
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
      // date receives change event rather than input event
      this.state.step_1.date = Date.parse(targetValue);
      this.updateDateString();
      this.syncData();
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

  deleteSegment = (segment: Segment, index: number): void => {
    this.step2Data = this.step2Data.filter(
        (val, ind) => val.uuid !== segment.uuid || ind !== index);
    this.updateStep2State();
  };

  initStep2Data = (): void => {
    if (!this.dataLoaded) {
      return;
    }
    this.step2Data = this.state.step_2.segments.map(segmentUUID =>
      this.step2AllSegments.find(segment =>
          segment.uuid === segmentUUID))
              .filter(val => val !== undefined);
  };

  updateStep2State = (): void => {
    this.state.step_2.segments = this.step2Data.map(val => val.uuid);
    this.hasSuper = !!this.step2Data.find(segment => segment.type === 'SUPER');
  };

  step2Drop = (event: CdkDragDrop<Segment[]>): void => {
    let draggedSegment: Segment;
    if (event.container.id === 'program-list' &&
        event.previousContainer.id === 'program-list') {
      draggedSegment = event.previousContainer.data[event.previousIndex];
      transferArrayItem(event.previousContainer.data, event.container.data,
          event.previousIndex, event.currentIndex);
    } else if (event.previousContainer.id === 'segment-list' &&
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

  temporarySaveCastChanges = async (): Promise<void> => {
    if (this.selectedSegment) {
      const prevCastUUID = this.state.uuid + 'cast' + this.selectedSegment.uuid;
      if (this.selectedSegment && this.castDnD && this.castDnD.cast &&
          this.castDnD.castSelected) {
        const exportedCast: Cast = this.castDnD.dataToCast();
        if (this.castApi.hasCast(exportedCast.uuid)) {
          this.castApi.deleteCast(exportedCast);
        }
        this.segmentToCast.set(exportedCast.uuid, [exportedCast,
          this.primaryGroupNum, this.segmentLength]);
        await this.castApi.setCast(exportedCast, true);
        await this.castApi.loadAllCasts();
      }
      if (this.selectedSegment && this.selectedSegment.type === 'SEGMENT') {
        await this.intermissions.set(this.selectedIndex, this.segmentLength);
      }
      this.castDnD?.setBoldedCast(this.segmentToCast.get(prevCastUUID)
          ? this.segmentToCast.get(prevCastUUID)[1] : undefined);
    }
  };

  onSelectStep3Segment = async (
    segment: Segment,
    segmentIx: number,
  ): Promise<void> => {
    await this.temporarySaveCastChanges();
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
    let castAndPrimLength: [Cast, number, number] =
      this.segmentToCast.get(castUUID);
    if (!castAndPrimLength ||
      castAndPrimLength[0].filled_positions.length === 0) {
      // The segment has no casts in the segmentToCast map or
      // no filled positions. Create filled posirions arrays.
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
            ],
            hasAbsence: false,
          }
        ))
      };
      await this.segmentToCast.set(newCast.uuid, [newCast, 0, 0]);
      await this.castApi.setCast(newCast, true);
      await this.castApi.loadAllCasts();
      castAndPrimLength = this.segmentToCast.get(castUUID);
    }
    this.primaryGroupNum = castAndPrimLength[1];
    this.castDnD?.selectCast({
      uuid: castUUID,
      saveDeleteEnabled: false,
      perfDate: this.state.dateTime,
    });
    this.checkCastUnavs(this.state);
    this.updateGroupIndices(castAndPrimLength[0]);
    this.updateCastsForSegment();
    this.segmentLength = castAndPrimLength[2];
    this.cdRef.detectChanges();
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

  onChangeCast = async (cast: Cast): Promise<void> => {
    this.updateGroupIndices(cast);
    // await below is perhaps not necessary right now but
    // is safer for later.
    await this.temporarySaveCastChanges();
    this.syncData();
  };

  syncData = async (): Promise<void> => {
    this.initStep4();
    // update absences
    this.checkCastUnavs(this.state);
    this.checkSegmentUnavs(this.state);
    let hasAbsence = false;
    if (this.castDnD?.castPositions) {
      this.castDnD.castPositions.forEach(cp =>
        cp.castRows.forEach(cr =>
          cr.subCastDancers.forEach(sd => {
              const user = this.userApi.lookup(sd.uuid);
              sd.hasAbsence = user.isAbsent;
              if (user.isAbsent) {
                hasAbsence = true;
              }
          })));
      this.state.step_3.perfSegments[this.selectedIndex].hasAbsence =
        hasAbsence;
    }
  };

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngAfterViewChecked(): void {
    // if cast has already been set, turn off auto set.
    if (this.castDnD?.cast) {
      this.shouldSelectFirstSegment = false;
    }
    if (this.selectedSegment && this.shouldSelectFirstSegment) {
      this.onSelectStep3Segment(this.selectedSegment, 0);
      this.shouldSelectFirstSegment = false;
    }
  }

  initStep3Data = async (
    waitForCastReturn: boolean,
  ): Promise<void> => {
    this.selectedSegment = this.step2Data[0];
    this.selectedIndex = 0;
    this.shouldSelectFirstSegment = true;
    const newInterms: Map<number, number> = new Map();
    for (const entry of this.intermissions.entries()) {
      if (this.step2Data.length > entry[0] &&
          this.step2Data[entry[0]].type === 'SEGMENT') {
        await newInterms.set(entry[0], entry[1]);
      }
    }
    this.intermissions = newInterms;
    if (!this.initCastsLoaded) {
      // Sort the positions (=custom_groups) of all ballets (=segments)
      // in the performance
      for (const segment of this.state.step_3.perfSegments) {
        segment.custom_groups.sort(
            (a, b) => a.position_order < b.position_order ? -1 : 1);
      }
      for (const [i, seg] of this.state.step_3.perfSegments.entries()) {
        const castUUID = this.state.uuid + 'cast' + seg.segment;
        if (this.segmentApi.lookup(seg.segment).type === 'SEGMENT') {
          await this.intermissions.set(i, seg.length ? seg.length : 0);
          await this.segmentToPerfSectionID.set(castUUID, seg.id);
        } else {
          const cast: Cast = {
            uuid: castUUID,
            name: 'Copied Cast',
            segment: seg.segment,
            castCount: CAST_COUNT,
            filled_positions: seg.custom_groups,
          };
          await this.segmentToCast.set(castUUID, [cast, seg.selected_group,
            seg.length ? seg.length : 0]);
          await this.segmentToPerfSectionID.set(castUUID, seg.id);
          this.castApi.setCast(cast, true);
        }
      }
      // moved here to cut down on data reads
      if (waitForCastReturn) {
        await this.castApi.loadAllCasts();
      } else {
        this.castApi.loadAllCasts();
      }
      this.initCastsLoaded = true;
    }
    if (this.selectedSegment) {
      this.onSelectStep3Segment(this.selectedSegment, 0);
    }
  };

  onChoosePrimaryCast = (event: MatSelectChange): void => {
    this.temporarySaveCastChanges();
    this.castDnD?.setBoldedCast(event.value);
  };

  onAutofillCast = async (cast: Cast): Promise<void> => {
    const newCast: Cast = JSON.parse(JSON.stringify(cast));
    newCast.uuid = this.state.uuid + 'cast' + this.selectedSegment.uuid;
    this.segmentToCast.set(newCast.uuid,
        [newCast, 0, this.segmentLength]);
    await this.castApi.setCast(newCast, true);
    await this.castApi.loadAllCasts();
    this.checkCastUnavs(this.state);
    this.updateGroupIndices(newCast);
  };

  onLengthChange = (event: Event): void => {
    const length = ( event.target as HTMLInputElement ).value;
    try {
      this.segmentLength = Number(length);
    } catch (err) {
      this.segmentLength = 0;
    }
    this.temporarySaveCastChanges();
  };

  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------

  onPublishPerformance = async (): Promise<void> => {
    const finishedPerf = this.dataToPerformance();
    finishedPerf.status = PerformanceStatus.PUBLISHED;
    await this.performanceApi.cache.set(finishedPerf).then(() => {
      this.submitted = true;
      this.initCastsLoaded = false;
      this.deleteWorkingCasts();
      this.resetState(true);
    }).catch(err => {
      alert('Unable to save performance: ' + err.error.status + ' ' +
          err.error.error);
    });
  };

  onCancelPerformance = async (): Promise<void> => {
    const finishedPerf = this.dataToPerformance();
    finishedPerf.status = PerformanceStatus.CANCELED;
    await this.performanceApi.cache.set(finishedPerf).then(() => {
      this.submitted = true;
      this.initCastsLoaded = false;
      this.deleteWorkingCasts();
      this.resetState(true);
    }).catch(err => {
      alert('Unable to save performance: ' + err.error.status + ' ' +
          err.error.error);
    });
  };


  deleteWorkingCasts = (): void => {
    for (const entry of this.segmentToCast.entries()) {
      if (this.castApi.workingCasts.has(entry[0])) {
        this.castApi.deleteCast(entry[1][0]);
      }
    }
    this.segmentToCast.clear();
  };

  initStep4 = (): void => {
    this.state = this.dataToPerformance();
    this.selectedPerformance = this.state;
  };

  exportPerformance = (): void => {
    this.csvGenerator.generateCSVFromPerformance(this.state);
  };

  exportPerformanceAsPDF = (): void => {
    const data = this.state.step_3.perfSegments;
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
    newState.step_3.perfSegments =
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
              hasAbsence: false,
              selected_group: undefined,
              length: this.intermissions.get(segmentIx)
                  ? this.intermissions.get(segmentIx) : 0,
              custom_groups: [],
            };
          }
          return {
            id: this.segmentToPerfSectionID.has(segUUID)
                ? this.segmentToPerfSectionID.get(segUUID) : undefined,
            segment: segment.uuid,
            name: segment.name,
            type: segment.type,
            hasAbsence: false,
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
                        mem => this.userApi.lookup(mem.uuid))
                            .map(usr => usr.first_name + ' ' +
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
    this.checkSegmentUnavs(newState);
    return newState;
  };

  onResetFromStart = (e: Event): void => {
    e.preventDefault();
    this.deleteWorkingCasts();
    this.stepper.navigate(0);
    this.resetPerformance();
    this.resetState(false);
  };

  // --------------------------------------------------------------

  // Private methods

  // Step 2 -------------------------------------------------------

  // Removes the Super Ballet children so every Super Ballet drag just inserts
  // its children right below it, regardless of where the dragging originated
  private removeSuperChildren = (draggedSegment: Segment): void => {
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
  private addSuperChildren = (draggedSegment: Segment): void => {
    for (let segmentIndex = 0; segmentIndex < this.step2Data.length;
         segmentIndex++) {
      const segment = this.step2Data[segmentIndex];
      if (segment.uuid === draggedSegment.uuid) {
        const childArr: Segment[] = [];
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


