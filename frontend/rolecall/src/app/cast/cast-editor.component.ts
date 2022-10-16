/* eslint-disable @typescript-eslint/naming-convention */

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit,
  ViewChildren, QueryList, ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as APITypes from 'src/api-types';
import { CAST_COUNT } from 'src/constants';

import { Cast, CastApi } from '../api/cast-api.service';
import { Segment, SegmentApi } from '../api/segment-api.service';
import { User, UserApi } from '../api/user-api.service';
import { CastDragAndDrop } from './cast-drag-and-drop.component';
import { SuperBalletDisplayService,
} from '../services/super-ballet-display.service';
import { SegmentDisplayListService,
} from '../services/segment-display-list.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-cast-editor',
  templateUrl: './cast-editor.component.html',
  styleUrls: ['./cast-editor.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CastEditor implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('castDragAndDrop') dragAndDropQ?: QueryList<CastDragAndDrop>;

  dragAndDrop?: CastDragAndDrop;

  selectedCast: Cast;
  selectedSegment: Segment;
  urlUUID: APITypes.CastUUID;
  users: User[] = [];
  allCasts: Cast[] = [];
  selectedSegmentCasts: Cast[] = [];
  expandedCode= 0;

  lastSelectedCastIndex: number;
  lastSelectedCast: Cast;

  segmentSubscription: Subscription;
  castSubscription: Subscription;
  userSubscription: Subscription;

  dataLoaded = false;
  usersLoads = false;
  segmentsLoaded = false;
  castsLoaded = false;
  usersLoaded = false;
  dragAndDropSetup = false;

  canDelete = false;

  private allSegments: Segment[] = [];

  private subscriptions = new Subscription();

  constructor(
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location: Location,
    private castApi: CastApi,
    private segmentApi: SegmentApi,
    private userApi: UserApi,

    private superBalletDisplay: SuperBalletDisplayService,
    public leftList: SegmentDisplayListService,
  ) { }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  async ngOnInit(): Promise<void> {
    const uuid = this.route.snapshot.params.uuid;
    if (uuid) {
      this.urlUUID = uuid;
    }
    this.userSubscription = this.userApi.cache.loadedAll.subscribe(users => {
      this.onUserLoad(users as User[]);
    });
    this.userApi.loadAllUsers();
    this.segmentSubscription =
    this.segmentApi.cache.loadedAll.subscribe(items => {
      this.onSegmentLoad(items as Segment[]);
    });
    // await below guarantees that segment db load doesn't happen twice.
    await this.segmentApi.loadAllSegments();
    this.castSubscription = this.castApi.cache.loadedAll.subscribe(casts => {
      this.onCastLoad(casts as Cast[]);
    });
    this.castApi.loadAllCasts();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngAfterViewInit(): void {
    if (this.dragAndDropQ!.first) {
      this.setupDragAndDropView();
      this.cdRef.detectChanges();
    }
    this.subscriptions.add(this.dragAndDropQ!.changes.subscribe(() => {
      this.setupDragAndDropView();
    }));
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.castSubscription.unsubscribe();
    this.segmentSubscription.unsubscribe();

    this.subscriptions.unsubscribe();
  }

  setupDragAndDropView = (): void => {
    this.dragAndDrop = this.dragAndDropQ.first;
    this.checkDataLoaded();
  };

  // Select from screen
  selectSegment = (segmentIndex: number): void => {
    // add extra screen logic here
    this.doSelectSegment(segmentIndex);
  };

  doSelectSegment = (segmentIndex: number): void => {
    this.setSegment(this.leftList.topLevelSegments[segmentIndex]);
  };

  onEditCast = (cast: Cast): void => {
    this.lastSelectedCast = cast;
  };

  onSetCurrentCast = (cast: Cast): void => {
    this.setCurrentCast({cast});
    this.canDelete = true;
  };

  setCurrentCast = ({cast, index}: {
    cast: Cast | undefined;
    index?: number;
  }): void => {
    if (!this.dragAndDrop) {
      return;
    }
    if (index === undefined && cast) {
      index = this.selectedSegmentCasts.findIndex(
          findCast => cast.uuid === findCast.uuid);
    }
    if (index >= 0) {
      this.lastSelectedCastIndex = index;
    } else {
      this.lastSelectedCastIndex = undefined;
    }
    this.lastSelectedCast = cast ? cast : this.lastSelectedCast;
    this.selectedCast = cast;
    this.dragAndDrop.selectCast({uuid: cast ? cast.uuid : undefined});
    this.urlUUID = cast ? cast.uuid : '';
    this.setCastURL();
  };

  addCast = async (): Promise<void> => {
    if (!this.selectedSegment) {
      return;
    }
    const newCast: Cast = {
      uuid: 'cast:' + Date.now(),
      name: 'New Cast',
      segment: this.selectedSegment.uuid,
      castCount: CAST_COUNT,
      filled_positions: this.selectedSegment.positions.map(pos => ({
          position_uuid: pos.uuid,
          groups: [{
            group_index: 0,
            members: []
          }],
          hasAbsence: false,
        }),
      )
    };
    this.canDelete = false;
    this.allCasts.push(newCast);
    this.selectedSegmentCasts.push(newCast);
    await this.castApi.setCast(newCast, true);
    this.setCurrentCast({cast: newCast});
    await this.castApi.loadAllCasts();
  };

  toggleExpanded = (): void => {
    this.expandedCode += (this.expandedCode === 2) ? -2 : 1;
  };

  toggleOpen = (index: number): void => {
    const superBallet = this.leftList.topLevelSegments[index];
    if (superBallet.type === 'SUPER') {
      superBallet.isOpen = !superBallet.isOpen;
      this.superBalletDisplay.setOpenState(
          superBallet.uuid, superBallet.isOpen);
    }
    this.buildLeftList();
  };

  refreshData = async (): Promise<void> => {
    this.usersLoaded = false;
    this.segmentsLoaded = false;
    this.castsLoaded = false;
    this.userApi.loadAllUsers(true);
    // await below guarantees that segment db load doesn't happen twice.
    await this.segmentApi.loadAllSegments(true);
    this.castApi.loadAllCasts(true);
  };

  // Private functions

  private checkDataLoaded = (): boolean => {
    this.dataLoaded = this.usersLoaded && this.segmentsLoaded
        && this.castsLoaded;
    if (this.dataLoaded && this.dragAndDrop && !this.dragAndDropSetup) {
      this.setupDragAndDrop(this.castApi.cache.arr as Cast[]);
    }
    return this.dataLoaded;
  };

  private updateFilteredCasts = (): void => {
    if (this.selectedSegment) {
      this.selectedSegmentCasts = this.allCasts.filter(
          cast => cast.segment === this.selectedSegment.uuid);
      this.selectedSegmentCasts.sort((a, b) => a.name < b.name ? -1 : 1);
    }
  };

  private setSegment = (segment: Segment): void => {
    if (this.selectedSegment && segment.uuid === this.selectedSegment.uuid) {
      return;
    }
    let autoSelectFirst = false;
    this.selectedSegment = segment;
    this.updateFilteredCasts();
    if (this.selectedSegment) {
      autoSelectFirst = this.selectedSegmentCasts.length > 0;
    }
    if (autoSelectFirst) {
      this.onSetCurrentCast(this.selectedSegmentCasts[0]);
    }
  };

  private checkForUrlCompliance = (): void => {
    if (this.selectedSegment) {
      this.updateFilteredCasts();
    }
    if (this.urlUUID) {
      if (!this.selectedCast) {
        return;
      }
      const foundSegment = this.allSegments.find(
          segment => segment.uuid === this.selectedCast.segment);
      if (foundSegment) {
        this.setSegment(foundSegment);
      }
    }
    if (this.selectedSegment && !this.selectedSegmentCasts.find(
        cast => cast.uuid === this.urlUUID)) {
      if (this.selectedSegmentCasts.length > 0) {
        this.onSetCurrentCast(this.selectedSegmentCasts[0]);
      }
    }
  };

  private starTest = (segment: Segment): boolean => {
    if (segment.type !== 'BALLET') {
      return false;
    }
    const existingCasts = this.allCasts.filter(
      cast => cast.segment === segment.uuid);
    return existingCasts.length === 0;
  };

  private buildLeftList = (): void => {
    this.leftList.buildDisplayList(this.allSegments, this.starTest);
  };

  /** Called when users are loaded from the User API. */
  private onUserLoad = (users: User[]): void => {
    this.usersLoaded = true;
    this.users = users.filter(user => user.has_roles.isDancer);
    this.users = this.users.sort(
        (a, b) => a.last_name.toLocaleLowerCase() <
        b.last_name.toLocaleLowerCase() ? -1 : 1);
    // clear unavailibility data, if present
    this.users.forEach(u => u.isAbsent = false);
    this.checkDataLoaded();
  };

  private onSegmentLoad = (segments: Segment[]): void => {
    this.allSegments = segments.filter(segment => segment.type !== 'SEGMENT');
    this.buildLeftList();
    if (!this.selectedSegment && this.allSegments.length > 0) {
      this.selectSegment(0);
    }
    this.checkForUrlCompliance();
    this.segmentsLoaded = true;
    this.checkDataLoaded();
  };

  private onCastLoad = (casts: Cast[]): void => {
    if (this.castApi.hasCast(this.urlUUID)) {
      this.dragAndDrop.selectCast({uuid: this.urlUUID});
      this.setCastURL();
    }
    // The first load, the casts may not have been loaded,
    // causing all ballets to get stars. This statement prevents all stars.
    this.buildLeftList();
    this.allCasts = casts;
    this.updateFilteredCasts();
    if (casts.length === 0) {
      this.selectedCast = undefined;
      this.castsLoaded = true;
      this.checkDataLoaded();
      return;
    }
    if (this.dragAndDrop && this.usersLoaded) {
      this.setupDragAndDrop(casts);
    }
    this.checkForUrlCompliance();
    this.castsLoaded = true;
    this.checkDataLoaded();
  };

  private setupDragAndDrop = (casts: Cast[]): void => {
    if (!this.dragAndDrop?.castSelected) {
      if (this.lastSelectedCast) {
        const foundCast = casts.find(
            c => c.name === this.lastSelectedCast.name);
        if (foundCast) {
          this.lastSelectedCast = foundCast;
          this.selectedCast = foundCast;
        } else {
          if (this.selectedSegmentCasts.length > 0) {
            this.selectedCast = this.selectedSegmentCasts[
                this.lastSelectedCastIndex
                    ? this.lastSelectedCastIndex - 1
                    : 0];
          } else {
            this.selectedCast = casts[0];
          }
        }
      } else {
        if (this.selectedSegmentCasts.length > 0) {
          this.selectedCast = this.selectedSegmentCasts[
              this.lastSelectedCastIndex ? this.lastSelectedCastIndex - 1 : 0];
        } else {
          this.selectedCast = casts[0];
        }
      }
      this.onSetCurrentCast(this.selectedCast);
    } else {
      this.urlUUID = this.dragAndDrop.selectedCastUUID;
      this.setCurrentCast({cast: this.castApi.castFromUUID(this.urlUUID)});
    }
    this.dragAndDropSetup = true;
  };

  private setCastURL = (): void => {
    if (this.location.path().startsWith('/cast') ||
        this.location.path().startsWith('/cast/')) {
      this.location.replaceState('/cast/' + this.urlUUID);
    }
  };

}
