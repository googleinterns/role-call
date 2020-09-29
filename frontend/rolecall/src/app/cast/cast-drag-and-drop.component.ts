import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {APITypes} from 'src/api_types';
import {Cast, CastGroup, CastApi } from '../api/cast_api.service';
import {Piece, PieceApi, Position} from '../api/piece_api.service';
import {User, UserApi} from '../api/user_api.service';
import {CsvGenerator} from '../services/csv-generator.service';
import {LoggingService} from '../services/logging.service';
import {CAST_COUNT} from 'src/constants';

type UICastDancer = {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
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
export class CastDragAndDrop implements OnInit {
  /** Base URL of images in cloud storage. */
  baseImageUrl = 'https://storage.googleapis.com/absolute-water-286821.appspot.com/headshots/';

  /** The current cast we're editing, as well as the UUID of it. */
  selectedCastUUID: APITypes.CastUUID;
  cast: Cast;

  /** All users to display in user pool. */
  allUsers: User[] = [];

  /** Output by which other components can listen to cast changes. */
  @Output() castChangeEmitter: EventEmitter<Cast> = new EventEmitter();

  /** Whether or not the save/delete buttons should be rendered. */
  buttonsEnabled = true;

  /** The cast that should be bolded, or undefined if none should be. */
  boldedCast: number;

  // The display support data structures
  castPositions: UICastPosition[];
  subCastHeaders: string[];

  defaulCastCount = CAST_COUNT;
  castCount = CAST_COUNT;

  usersLoaded = false;
  castsLoaded = false;
  piecesLoaded = false;
  dataLoaded = false;
  castSelected = false;

  constructor(
      private userAPI: UserApi,
      private castAPI: CastApi,
      private pieceAPI: PieceApi,
      private logging: LoggingService,
      private csvGenerator: CsvGenerator
  ) {
    this.buildSubCastHeader();
  }

  ngOnInit(): void {
    this.userAPI.userEmitter.subscribe((users) => {
      this.onUserLoad(users);
    });
    this.castAPI.castEmitter.subscribe((casts) => {
      this.onCastLoad(casts);
    });
    this.pieceAPI.pieceEmitter.subscribe((pieces) => {
      this.onPieceLoad(pieces);
    });
    this.castAPI.getAllCasts();
    this.userAPI.getAllUsers();
    this.pieceAPI.getAllPieces();
  }

  /** Setter to set the bolded cast number. */
  setBoldedCast(num: number) {
    this.boldedCast = num;
  }

  /** Called when the title input is changed. */
  onTitleInput(inputEvent: InputEvent) {
    // typescript doesn't know all InputEvent.target fieds
    this.cast.name = (inputEvent.target as any).value;
    this.castChangeEmitter.emit(this.cast);
  }

  private buildSubCastHeader() {
    this.subCastHeaders = [];
    this.subCastHeaders.push("1st Cast");
    if (2 <= this.castCount) { this.subCastHeaders.push("2nd Cast"); }
    if (3 <= this.castCount) { this.subCastHeaders.push("3rd Cast"); }
    for (let i = 4; i <= this.castCount; i++) {
      this.subCastHeaders.push(`${i}th Cast`);
    }
  }

  /** Checks that all the required data is loaded to begin
   * rendering.
   */
  private checkAllLoaded() {
    if (this.usersLoaded && this.castsLoaded && this.piecesLoaded) {
      this.dataLoaded = true;
    }
    return this.dataLoaded;
  }

  /** Called when pieces are loaded from the Piece API. */
  private onPieceLoad(pieces: Piece[]) {
    this.piecesLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }

  }

  /** Called when users are loaded from the User API. */
  private onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.allUsers = users.filter(user => user.has_roles.isDancer);
    this.allUsers = this.allUsers.sort(
        (a, b) => a.last_name < b.last_name ? -1 : 1);
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  /** Called when casts are loaded from the Cast API. */
  private onCastLoad(casts: Cast[]) {
    this.castsLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  /** Selects the current cast from the Cast API to copy and render
   * in the drag and drop.
   */
  selectCast({uuid, saveDeleteEnabled = true}: {
    uuid: APITypes.CastUUID;
    saveDeleteEnabled?: boolean;
  }) {
    this.buttonsEnabled = saveDeleteEnabled;
    this.castSelected = true;
    this.selectedCastUUID = uuid;
    if (this.dataLoaded) {
      this.setupData();
    }
  }

  /** Output the drag and drop data as a cast object. */
  dataToCast(): Cast {
    const newCast: Cast = {
      uuid: this.selectedCastUUID,
      segment: this.cast.segment,
      castCount: this.castCount,
      name: this.cast.name,
      filled_positions: this.castPositions.map(
          (uiPos: UICastPosition, uiPosIndex: number) => {
        let subCasts: CastGroup[] = new Array(this.castCount).fill([]);
        subCasts = subCasts.map((subCast, subCastIndex) => {
          return {
            group_index: subCastIndex,
            members: []
          };
        });
        for (let subCastIndex = 0; subCastIndex < subCasts.length;
            subCastIndex++) {
          for (let dancerIndex = 0; dancerIndex < uiPos.dancerCount;
              dancerIndex++) {
            const dancer = uiPos.castRows[dancerIndex]
                .subCastDancers[subCastIndex];
            if (dancer) {
              subCasts[subCastIndex].members.push({
                uuid: dancer.uuid,
                position_number: dancerIndex,
              });
            }
          }
        }
        return {
          position_uuid: uiPos.pos.uuid,
          groups: subCasts,
        };
      })
    };
    return newCast;
  }

  private setupData() {
    if (!this.castSelected) {
      return;
    }
    this.castPositions = [];
    if (!this.castAPI.hasCast(this.selectedCastUUID)) {
      this.castSelected = false;
      // TODO: After any save the system loses track the uuid of the saved cast.
      // It would be nice to fix [YHE].
      return;
    }
    this.cast = this.castAPI.castFromUUID(this.selectedCastUUID);
    this.castCount = this.cast.castCount;
    this.buildSubCastHeader();
    const positions = this.pieceAPI.pieces.get(this.cast.segment).positions;
    for (const position of positions) {
      const castPosition: UICastPosition =
          { pos: position, dancerCount: position.size, castRows: [] };
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
        (a, b) => a.pos.order < b.pos.order ? -1 : 1 );
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
          uiPos.castRows[member.position_number]
              .subCastDancers[group.group_index] = {
            uuid: dancer.uuid,
            firstName: dancer.first_name,
            lastName: dancer.last_name,
            email: dancer.contact_info.email,
          };
        }
      }
      uiPos.dancerCount = Math.max(maxDancerIndex + 1, uiPos.pos.size);
    }
  }

  drop(event: CdkDragDrop<User[]>) {
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
          firstName: fromUser.first_name,
          lastName: fromUser.last_name,
          email: fromUser.contact_info.email,
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
  }

  async saveCast() {
    this.cast = this.dataToCast();
    return this.castAPI.setCast(this.cast).then(result => {
      if (!result.successful) {
        alert(result.error);
      }
    });
  }

  async exportCast() {
    return this.csvGenerator.generateCSVFromCast(this.cast);
  }

  async deleteCast() {
    this.dataLoaded = false;
    this.castsLoaded = false;
    this.castSelected = false;
    this.selectedCastUUID = undefined;
    this.castAPI.deleteCast(this.cast);
  }

  decrementDancerCount(positionIndex: number) {
    this.castPositions[positionIndex].castRows.pop();
    this.castPositions[positionIndex].dancerCount -= 1;
  }

  incrementDancerCount(positionIndex: number) {
    this.castPositions[positionIndex].castRows.push({
      subCastDancers: new Array(this.castCount),
    });
    this.castPositions[positionIndex].dancerCount += 1;
  }
  
  private changeCastCount(change: number) {
    const oldCastCount = this.castCount;
    this.castCount += change;
    const oldCastPositions = this.castPositions;
    this.castPositions = [];
    for (let positionIndex = 0; positionIndex < oldCastPositions.length; positionIndex++) {
      const oldPosition = oldCastPositions[positionIndex];
      const newPosition: UICastPosition = {
        pos: oldPosition.pos,
        dancerCount: oldPosition.dancerCount,
        castRows: [],
      };
      for(let dancerIndex = 0; dancerIndex < oldPosition.castRows.length; dancerIndex++) {
        const oldCastRow = oldPosition.castRows[dancerIndex];
        const transferCount = Math.min(this.castCount, oldCastCount)
        const castRow: UICastRow = {
          subCastDancers: new Array(this.castCount) as UICastDancer[],
        };
        for (let castIndex = 0; castIndex < transferCount; castIndex++) {
          castRow.subCastDancers[castIndex] = oldCastRow.subCastDancers[castIndex];
        }
        newPosition.castRows.push(castRow);
      }
      this.castPositions.push(newPosition);
    }
    this.buildSubCastHeader();
  }

  decrementCastCount() {
    this.changeCastCount(-1);
  }

  incrementCastCount() {
    this.changeCastCount(1);
  }
}
