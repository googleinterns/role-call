import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { APITypes } from 'src/api_types';
import { isNullOrUndefined } from 'util';
import { Cast, CastPosition, CastSubCast, CastMember, CastApi } from '../api/cast_api.service';
import { Piece, PieceApi, Position } from '../api/piece_api.service';
import { User, UserApi } from '../api/user_api.service';
import { CsvGenerator } from '../services/csv-generator.service';
import { LoggingService } from '../services/logging.service';

const CAST_COUNT = 3;

type UICastDancer = {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
}

type UICastRow = {
  subCastDancers: UICastDancer[];
}

type UICastPosition = {
  pos: Position;
  castSize: number;
  castRows: UICastRow[];
}

@Component({
  selector: 'app-cast-drag-and-drop',
  templateUrl: './cast-drag-and-drop.component.html',
  styleUrls: ['./cast-drag-and-drop.component.scss']
})
export class CastDragAndDrop implements OnInit {
  /** Base URL of images in cloud storage. */
  baseImageUrl = 'https://storage.googleapis.com/absolute-water-286821.appspot.com/headshots/';

  /** The current cast we're editing, as well as the UUID of it */
  selectedCastUUID: APITypes.CastUUID;
  cast: Cast;

  /** All users to display in user pool */
  allUsers: User[] = [];

  /** Output by which other components can listen to cast changes */
  @Output() castChangeEmitter: EventEmitter<Cast> = new EventEmitter();

  /** Whether or not the save/delete buttons should be rendered */
  buttonsEnabled = true;

  /** The cast that should be bolded, or undefined if none should be */
  boldedCast: number;

  // The display support data structures
  castPositions: UICastPosition[];
  subCastHeaders: string[];

  usersLoaded = false;
  castsLoaded = false;
  piecesLoaded = false;
  dataLoaded = false;
  castSelected = false;

  constructor(private userAPI: UserApi, private castAPI: CastApi,
      private pieceAPI: PieceApi, private logging: LoggingService,
      private csvGenerator: CsvGenerator) {
    this.subCastHeaders = [];
    this.subCastHeaders.push("1st Cast");
    if (2 <= CAST_COUNT) this.subCastHeaders.push("2nd Cast");
    if (3 <= CAST_COUNT) this.subCastHeaders.push("3rd Cast");
    for (let i = 4; i <= CAST_COUNT; i++) {
      this.subCastHeaders.push(`${i}th Cast`);
    }
  }

  ngOnInit(): void {
    this.userAPI.userEmitter.subscribe((val) => {
      this.onUserLoad(val);
    });
    this.castAPI.castEmitter.subscribe((val) => {
      this.onCastLoad(val);
    });
    this.pieceAPI.pieceEmitter.subscribe((val) => {
      this.onPieceLoad(val);
    });
    this.castAPI.getAllCasts();
    this.userAPI.getAllUsers();
    this.pieceAPI.getAllPieces();
  }

  /** Setter to set the bolded cast number */
  setBoldedCast(num: number) {
    this.boldedCast = num;
  }

  /** Called when the title input is changed */
  onTitleInput(inputEvent: InputEvent) {
    this.cast.name = inputEvent.srcElement['value'];
    this.castChangeEmitter.emit(this.cast);
  }

  /** Checks that all the required data is loaded to begin
   * rendering
   */
  checkAllLoaded() {
    if (this.usersLoaded && this.castsLoaded && this.piecesLoaded) {
      this.dataLoaded = true;
    }
    return this.dataLoaded;
  }

  /** Called when pieces are loaded from the Piece API */
  onPieceLoad(pieces: Piece[]) {
    this.piecesLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  
  }

  /** Called when users are loaded from the User API */
  onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.allUsers = users.filter(user => user.has_roles.isDancer);
    this.allUsers = this.allUsers.sort((a, b) => a.last_name < b.last_name ? -1 : 1);
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  /** Called when casts are loaded from the Cast API */
  onCastLoad(casts: Cast[]) {
    this.castsLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  /** Selects the current cast from the Cast API to copy and render in the drag and
   * drop
   */
  selectCast(uuid: APITypes.CastUUID, saveDeleteEnabled?: boolean) {
    this.buttonsEnabled = saveDeleteEnabled ? true : (isNullOrUndefined(saveDeleteEnabled) ? true : false);
    this.castSelected = true;
    this.selectedCastUUID = uuid;
    if (this.dataLoaded) {
      this.setupData();
    }
  }

  /** Output the drag and drop data as a cast object */
  dataToCast(): Cast {
    let newCast: Cast = {
      uuid: this.selectedCastUUID,
      segment: this.cast.segment,
      name: this.cast.name,
      filled_positions: this.castPositions.map((uiPos: UICastPosition, uiPosIx: number) => {
        let subCasts: CastSubCast[] = new Array(CAST_COUNT).fill([]);
        subCasts = subCasts.map((subCast, subCastIx) => {
          return {
            group_index: subCastIx,
            members: []
          };
        });
        for (let subCastIx = 0; subCastIx < subCasts.length; subCastIx++) {
          for (let dancerIx = 0; dancerIx < uiPos.castSize; dancerIx++) {
            const dancer = uiPos.castRows[dancerIx].subCastDancers[subCastIx];
            if (dancer) {
              subCasts[subCastIx].members.push({
                uuid: dancer.uuid,
                position_number: dancerIx,
              })
            }
          }
        }
        return {
          position_uuid: uiPos.pos.uuid,
          groups: subCasts,
        }
      })
    };
    return newCast;
  }
  
  setupData() {
    if (!this.castSelected) {
      return;
    }
    this.castPositions = [];
    if (!this.castAPI.hasCast(this.selectedCastUUID)) {
      this.castSelected = false;
      // TODO: After any save the system loses track the uuid of the saved cast. It would be nice to fix [YHE].
      return;
    }
    this.cast = this.castAPI.castFromUUID(this.selectedCastUUID);
    const positions = this.pieceAPI.pieces.get(this.cast.segment).positions;
    for (let positionIx = 0; positionIx < positions.length; positionIx++) {
      const position = positions[positionIx];
      const castPosition: UICastPosition = { pos: position, castSize: position.size, castRows: [] };
      this.castPositions.push(castPosition);
      for (let dancerIx = 0; dancerIx < castPosition.castSize; dancerIx++) {
        castPosition.castRows.push({
          subCastDancers: new Array(CAST_COUNT),
        });
      }
    }

    // Sort positions by position order
    this.castPositions = this.castPositions.sort((a, b) => a.pos.order < b.pos.order ? -1 : 1 );
    // Sort positions inside cast
    this.cast.filled_positions = this.cast.filled_positions
      .filter(val => this.castPositions.find(castPos => castPos.pos.uuid == val.position_uuid))
      .sort((a, b) => {
        const castPositionOrderA = this.castPositions.find(castPos => castPos.pos.uuid == a.position_uuid).pos.order;
        const castPositionOrderB = this.castPositions.find(castPos => castPos.pos.uuid == b.position_uuid).pos.order;
        return castPositionOrderA < castPositionOrderB ? -1 : 1
      });

    for (let posIx = 0; posIx < this.cast.filled_positions.length; posIx++) {
      const filledPos = this.cast.filled_positions[posIx];
      const uiPos = this.castPositions[posIx];
      let maxDancerIx = 0;
      for (let groupIx = 0; groupIx < filledPos.groups.length; groupIx++) {
        const group = filledPos.groups[groupIx];
        for (let memberIx = 0; memberIx < group.members.length; memberIx++) {
          const member = group.members[memberIx];
          if (member.position_number >= maxDancerIx) {
            maxDancerIx = member.position_number;
            if (maxDancerIx >= uiPos.castRows.length) {
              uiPos.castRows.push({
                subCastDancers: new Array(CAST_COUNT),
              });
            }
          }
          const dancer = this.userAPI.users.get(member.uuid);
          uiPos.castRows[member.position_number].subCastDancers[group.group_index] = {
            uuid: dancer.uuid,
            firstName: dancer.first_name,
            lastName: dancer.last_name,
            email: dancer.contact_info.email,
          };
        }
      }
      uiPos.castSize = Math.max(maxDancerIx + 1, uiPos.pos.size);
    }
  }

  drop(event: CdkDragDrop<User[]>) {
    const fromContainer = event.previousContainer.id;
    const toContainer = event.container.id;
    const fromIxs = fromContainer.split(':');
    const toIxs = toContainer.split(':');
    const fromCastIx = event.previousIndex;
    const toCastIx = event.currentIndex;

    let prevContainerID = event.previousContainer.id;
    if (fromContainer === "user-pool" && toContainer === "user-pool") {
      return;
    }

    if (!event.isPointerOverContainer || toContainer === "user-pool") {
      // Dropped over no table or over User table
      if (fromIxs[1]) {
        // Drag started in Cast table: remove user
        this.castPositions[fromIxs[0]].castRows[fromIxs[1]].subCastDancers[fromCastIx] = undefined;
        this.castChangeEmitter.emit(this.dataToCast());
      }
      return;
    }

    if (prevContainerID == "user-pool" && event.container.id) {
      // From user table to Cast table
      if (toCastIx < CAST_COUNT) {
        // Dropped inside Cast table
        const fromUser = event.item.data as User;
        this.castPositions[toIxs[0]].castRows[toIxs[1]].subCastDancers[toCastIx] = {
          uuid: fromUser.uuid,
          firstName: fromUser.first_name,
          lastName: fromUser.last_name,
          email: fromUser.contact_info.email,
        };
        this.castChangeEmitter.emit(this.dataToCast());
      }
      return;
    }
    if (fromIxs[1] !== undefined && toIxs[1] !== undefined) {
      // Drag started over Cast table and ended over Cast table
      const fromDancer = this.castPositions[fromIxs[0]].castRows[fromIxs[1]].subCastDancers[fromCastIx];

      if (fromDancer !== undefined) {
        this.castPositions[toIxs[0]].castRows[toIxs[1]].subCastDancers[toCastIx] = fromDancer;
        this.castPositions[fromIxs[0]].castRows[fromIxs[1]].subCastDancers[fromCastIx] = undefined;
        this.castChangeEmitter.emit(this.dataToCast());
      }
      return;
    }
  }

  async saveCast() {
    this.cast = this.dataToCast();
    return this.castAPI.setCast(this.cast).then(val => {
      if (!val.successful) {
        alert(val.error);
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

  decrementDancerCount(positionIx: number) {
    this.castPositions[positionIx].castRows.pop();
    this.castPositions[positionIx].castSize -= 1;
  }

  incrementDancerCount(positionIx: number) {
    this.castPositions[positionIx].castRows.push({
      subCastDancers: new Array(CAST_COUNT),
    });
    this.castPositions[positionIx].castSize += 1;
  }
}
