/* eslint-disable @typescript-eslint/naming-convention */

import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as APITypes from 'src/api-types';
import {CAST_COUNT} from 'src/constants';

import {Cast, CastApi, CastGroup} from '../api/cast-api.service';
import {SegmentApi, Position} from '../api/segment-api.service';
import {User, UserApi} from '../api/user-api.service';
import {CsvGenerator} from '../services/csv-generator.service';

type UICastDancer = {
  uuid: string;
  user: User;
  pictureFile: string;
  hasAbsence?: boolean;
};

type UICastRow = {
  subCastDancers: UICastDancer[];
};

type UICastPosition = {
  pos: Position;
  dancerCount: number;
  castRows: UICastRow[];
};

@Component({
  selector: 'app-cast-drag-and-drop',
  templateUrl: './cast-drag-and-drop.component.html',
  styleUrls: ['./cast-drag-and-drop.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CastDragAndDrop implements OnInit {

  /** Output by which other components can listen to cast changes. */
  @Output() castChangeEmitter: EventEmitter<Cast> = new EventEmitter();

  /** Base URL of images in cloud storage. */
  // eslint-disable-next-line max-len
  baseImageUrl = 'https://storage.googleapis.com/absolute-water-286821.appspot.com/headshots/';

  /** The current cast we're editing, as well as the UUID of it. */
  selectedCastUUID: APITypes.CastUUID;
  cast: Cast;

  /** All users to display in user pool. */
  allUsers: User[] = [];


  /** Whether or not the save/delete buttons should be rendered. */
  buttonsEnabled = true;

  /** The cast that should be bolded, or undefined if none should be. */
  boldedCast: number;

  // The display support data structures
  castPositions: UICastPosition[];
  subCastHeaders: string[];

  castCount = CAST_COUNT;

  usersLoaded = false;
  castsLoaded = false;
  dataLoaded = false;
  castSelected = false;
  perfDate = 0;

  constructor(
      private userAPI: UserApi,
      private castAPI: CastApi,
      private segmentApi: SegmentApi,
      private csvGenerator: CsvGenerator
  ) {
    this.buildSubCastHeader();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.userAPI.userEmitter.subscribe(users => {
      this.onUserLoad(users);
    });
    this.castAPI.castEmitter.subscribe(() => {
      this.onCastLoad();
    });
    if (this.perfDate) {
      this.castAPI.getAllCasts(this.perfDate);
    } else {
      this.castAPI.getAllCasts(0);
    }
    this.userAPI.getAllUsers();
  }

  /** Setter to set the bolded cast number. */
  setBoldedCast = (num: number): void => {
    this.boldedCast = num;
  };

  /** Called when the title input is changed. */
  onTitleInput = (inputEvent: InputEvent): void => {
    // typescript doesn't know all InputEvent.target fields
    this.cast.name = (inputEvent.target as any).value;
    this.castChangeEmitter.emit(this.cast);
  };

  /**
   * Selects the current cast from the Cast API to copy and render
   * in the drag and drop.
   */
  selectCast = ({uuid, saveDeleteEnabled = true, perfDate = 0}: {
    uuid: APITypes.CastUUID | undefined;
    saveDeleteEnabled?: boolean;
    perfDate?: number;
  }): void => {
    if (perfDate > 0) {
      this.perfDate = perfDate;
      this.castAPI.getAllCasts(this.perfDate);
    }
    if (uuid) {
      this.buttonsEnabled = saveDeleteEnabled;
      this.castSelected = true;
      this.selectedCastUUID = uuid;
      if (this.dataLoaded) {
        this.setupData();
      }
    }
  };

  /** Output the drag and drop data as a cast object. */
  dataToCast = (): Cast => ({
      uuid: this.selectedCastUUID,
      segment: this.cast.segment,
      name: this.cast.name,
      castCount: this.castCount,
      filled_positions: this.castPositions.map(
          (uiPos: UICastPosition) => {
            let subCasts: CastGroup[] = new Array(this.castCount).fill([]);
            subCasts = subCasts.map((_, subCastIndex) => ({
                group_index: subCastIndex,
                members: []
              })
            );
            for (let subCastIndex = 0; subCastIndex < subCasts.length;
                 subCastIndex++) {
              for (let dancerIndex = 0; dancerIndex < uiPos.dancerCount;
                   dancerIndex++) {
                const castRow = uiPos.castRows[dancerIndex];
                if (castRow) {
                  const dancer = castRow.subCastDancers[subCastIndex];
                  if (dancer) {
                    subCasts[subCastIndex].members.push({
                      uuid: dancer.uuid,
                      position_number: dancerIndex,
                    });
                  }
                }
              }
            }
            return {
              position_uuid: uiPos.pos.uuid,
              groups: subCasts,
            };
          })
    });


  drop = (event: CdkDragDrop<User[]>): void => {
    const fromContainer = event.previousContainer.id;
    const toContainer = event.container.id;
    const fromIndexs = fromContainer.split(':');
    const toIndexs = toContainer.split(':');
    const fromCastIndex = event.previousIndex;
    const toCastIndex = event.currentIndex;

    const prevContainerID = event.previousContainer.id;
    if (fromContainer === 'user-pool' && toContainer === 'user-pool') {
      return;
    }

    if (!event.isPointerOverContainer || toContainer === 'user-pool') {
      // Dropped over no table or over User table
      if (fromIndexs[1]) {
        // Drag started in Cast table: remove user
        this.castPositions[fromIndexs[0]].castRows[fromIndexs[1]]
            .subCastDancers[fromCastIndex] = undefined;
        this.castChangeEmitter.emit(this.dataToCast());
      }
      return;
    }

    if (prevContainerID === 'user-pool' && event.container.id) {
      // From user table to Cast table
      if (toCastIndex < this.castCount) {
        // Dropped inside Cast table
        const fromUser = event.item.data as User;
        this.castPositions[toIndexs[0]].castRows[toIndexs[1]]
            .subCastDancers[toCastIndex] = {
          uuid: fromUser.uuid,
          user: fromUser,
          pictureFile: fromUser.picture_file,
        };
        this.castChangeEmitter.emit(this.dataToCast());
      }
      return;
    }
    if (fromIndexs[1] !== undefined && toIndexs[1] !== undefined) {
      // Drag started over Cast table and ended over Cast table
      const fromDancer = this.castPositions[fromIndexs[0]]
          .castRows[fromIndexs[1]].subCastDancers[fromCastIndex];

      if (fromDancer !== undefined) {
        this.castPositions[toIndexs[0]].castRows[toIndexs[1]]
            .subCastDancers[toCastIndex] = fromDancer;
        this.castPositions[fromIndexs[0]].castRows[fromIndexs[1]]
            .subCastDancers[fromCastIndex] = undefined;
        this.castChangeEmitter.emit(this.dataToCast());
      }
      return;
    }
  };

  saveCast = async (): Promise<void> => {
    this.cast = this.dataToCast();
    return this.castAPI.setCast(this.cast).then(result => {
      if (!result.successful) {
        alert(result.error);
      }
      this.selectedCastUUID = String(this.castAPI.lastSavedCastId);
    });
  };

  exportCast = async (): Promise<void> =>
    this.csvGenerator.generateCSVFromCast(this.cast);


  deleteCast = async (): Promise<void> => {
    this.dataLoaded = false;
    this.castsLoaded = false;
    this.castSelected = false;
    this.selectedCastUUID = undefined;
    this.castAPI.deleteCast(this.cast);
  };

  decrementDancerCount = (positionIndex: number): void => {
    this.castPositions[positionIndex].castRows.pop();
    this.castPositions[positionIndex].dancerCount -= 1;
  };

  incrementDancerCount = (positionIndex: number): void => {
    this.castPositions[positionIndex].castRows.push({
      subCastDancers: new Array(this.castCount),
    });
    this.castPositions[positionIndex].dancerCount += 1;
  };

  decrementCastCount = (): void => {
    this.incrementCastCountUtil(-1);
  };

  incrementCastCount = (): void => {
    this.incrementCastCountUtil(1);
  };

  // Private methods

  private buildSubCastHeader = (): void => {
    this.subCastHeaders = [];
    this.subCastHeaders.push('1st Cast');
    if (2 <= this.castCount) {
      this.subCastHeaders.push('2nd Cast');
    }
    if (3 <= this.castCount) {
      this.subCastHeaders.push('3rd Cast');
    }
    for (let i = 4; i <= this.castCount; i++) {
      this.subCastHeaders.push(`${i}th Cast`);
    }
  };

  /** Checks that all the required data is loaded to begin rendering. */
  private checkAllLoaded = (): boolean => {
    if (this.usersLoaded && this.castsLoaded) {
      this.dataLoaded = true;
    }
    return this.dataLoaded;
  };

  /** Called when users are loaded from the User API. */
  private onUserLoad = (users: User[]): void => {
    this.usersLoaded = true;
    this.allUsers = users.filter(user => user.has_roles.isDancer);
    this.allUsers = this.allUsers.sort(
        (a, b) => a.last_name < b.last_name ? -1 : 1);
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  };

  /** Called when casts are loaded from the Cast API. */
  private onCastLoad = (): void => {
    this.castsLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  };

  private getPosIndex = (cast: Cast, uuid: string): number => {
    const positions = this.segmentApi.segments.get(cast.segment).positions;
    for (let i = 0; i < positions.length; i++) {
      if (positions[i].uuid === uuid) {
        return i;
      }
    }
    return -1;
  };

  private setupData = (): void => {
    if (!this.castSelected) {
      return;
    }
    this.castPositions = [];
    if (!this.castAPI.hasCast(this.selectedCastUUID)) {
      // In performances, casts are specified in section 3 and there is
      // a pointer to 'this' there. This pointer is not available
      // in section 4, so if the performance is saved in section 4
      // 'this.castSelected' can't be set to false there. Hence this logic.
      this.castSelected = false;
      return;
    }
    this.cast = this.castAPI.castFromUUID(this.selectedCastUUID);
    this.castCount = this.cast.castCount;
    this.buildSubCastHeader();
    const positions = this.segmentApi.segments.get(this.cast.segment).positions;
    const dancerCounts = new Array(positions.length);
    for (const filledPosition of this.cast.filled_positions) {
      let dancerCount = 0;
      for (const group of filledPosition.groups) {
        for (const member of group.members) {
          if (member.position_number >= dancerCount) {
            dancerCount = member.position_number + 1;
          }
        }
      }
      const pos = this.getPosIndex(this.cast, filledPosition.position_uuid);
      dancerCounts[pos] = dancerCount;
    }
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const dancerCount = Math.max(position.size, dancerCounts[i]);
      const castPosition: UICastPosition = {
        pos: position,
        dancerCount,
        castRows: []
      };
      this.castPositions.push(castPosition);
      for (let dancerIndex = 0; dancerIndex < castPosition.dancerCount;
           dancerIndex++) {
        castPosition.castRows.push({
          subCastDancers: new Array(this.castCount),
        });
      }
    }

    // Sort positions by position order
    this.castPositions = this.castPositions.sort(
        (a, b) => a.pos.order < b.pos.order ? -1 : 1);
    // Sort positions inside cast
    this.cast.filled_positions = this.cast.filled_positions
        .filter(filledPos => this.castPositions.find(
            castPos => castPos.pos.uuid === filledPos.position_uuid))
        .sort((a, b) => {
          const castPositionOrderA = this.castPositions.find(
              castPos => castPos.pos.uuid === a.position_uuid).pos.order;
          const castPositionOrderB = this.castPositions.find(
              castPos => castPos.pos.uuid === b.position_uuid).pos.order;
          return castPositionOrderA < castPositionOrderB ? -1 : 1;
        });

    for (let posIndex = 0; posIndex < this.cast.filled_positions.length;
         posIndex++) {
      const filledPos = this.cast.filled_positions[posIndex];
      const uiPos = this.castPositions[posIndex];
      let maxDancerIndex = 0;
      for (const group of filledPos.groups) {
        for (const member of group.members) {
          if (member.position_number >= maxDancerIndex) {
            maxDancerIndex = member.position_number;
            if (maxDancerIndex >= uiPos.castRows.length) {
              uiPos.castRows.push({
                subCastDancers: new Array(this.castCount),
              });
            }
          }
          const dancer = this.userAPI.users.get(member.uuid);
          const castRow = uiPos.castRows[member.position_number];
          if (castRow) {
            castRow.subCastDancers[group.group_index] = {
              uuid: dancer.uuid,
              user: dancer,
              pictureFile: dancer.picture_file,
              hasAbsence: member.hasAbsence,
            };
          }
        }
      }
      uiPos.dancerCount = Math.max(maxDancerIndex + 1, uiPos.pos.size);
    }
  };

  /**
   * Increments cast count by given amount,
   * pass in negative value to decrement.
   */
  private incrementCastCountUtil = (amount: number): void => {
    const oldCastCount = this.castCount;
    this.castCount += amount;
    const oldCastPositions = this.castPositions;
    this.castPositions = [];
    for (const oldPosition of oldCastPositions) {
      const newPosition: UICastPosition = {
        pos: oldPosition.pos,
        dancerCount: oldPosition.dancerCount,
        castRows: [],
      };
      for (const oldCastRow of oldPosition.castRows) {
        const transferCount = Math.min(this.castCount, oldCastCount);
        const castRow: UICastRow = {
          subCastDancers: Array.from<UICastDancer>({length: this.castCount}),
        };
        for (let castIndex = 0; castIndex < transferCount; castIndex++) {
          castRow.subCastDancers[castIndex] =
              oldCastRow.subCastDancers[castIndex];
        }
        newPosition.castRows.push(castRow);
      }
      this.castPositions.push(newPosition);
    }
    this.buildSubCastHeader();
  };

}
