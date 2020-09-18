import {CdkDragDrop, copyArrayItem, transferArrayItem} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {APITypes} from 'src/api_types';
import {isNullOrUndefined} from 'util';
import {Cast, CastApi} from '../api/cast_api.service';
import {Piece, PieceApi, Position} from '../api/piece_api.service';
import {User, UserApi} from '../api/user_api.service';
import {NumberToPlacePipe} from '../common_components/number_to_place.pipe';
import {CsvGenerator} from '../services/csv-generator.service';
import {LoggingService} from '../services/logging.service';

@Component({
  selector: 'app-cast-drag-and-drop',
  templateUrl: './cast-drag-and-drop.component.html',
  styleUrls: ['./cast-drag-and-drop.component.scss']
})
export class CastDragAndDrop implements OnInit {

  /** Output by which other components can listen to cast changes */
  @Output() castChangeEmitter: EventEmitter<Cast> = new EventEmitter();

  /** Base URL of images in cloud storage. */
  baseImageUrl = 'https://storage.googleapis.com/absolute-water-286821.appspot.com/headshots/';

  /** The drag and drop data */
  data: User[][][];
  positionVals: Position[];
  columnHeaders: string[][] = [];
  emptyCells: string[][][] = [];

  /** The current cast we're editing, as well as the UUID of it */
  selectedCastUUID: APITypes.CastUUID;
  cast: Cast;

  /** All users to display in user pool */
  allUsers: User[] = [];

  /** Whether or not the save/delete buttons should be rendered */
  buttonsEnabled = true;

  /** The cast that should be bolded, or undefined if none should be */
  boldedCast: number;

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
    private csvGenerator: CsvGenerator,
  ) {
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

  /** Called when pieces are loaded from the Piece API */
  onPieceLoad(pieces: Piece[]) {
    this.piecesLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  /**
   * Checks that all the required data is loaded to begin rendering
   */
  checkAllLoaded() {
    if (this.usersLoaded && this.castsLoaded && this.piecesLoaded) {
      this.dataLoaded = true;
    }
    return this.dataLoaded;
  }

  /** Called when users are loaded from the User API */
  onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.allUsers = users.sort((a, b) => a.last_name < b.last_name ? -1 : 1);
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

  /**
   * Selects the current cast from the Cast API to copy and render in the
   * drag and drop
   */
  selectCast(uuid: APITypes.CastUUID, saveDeleteEnabled?: boolean) {
    this.buttonsEnabled = saveDeleteEnabled ? true : (!!isNullOrUndefined(saveDeleteEnabled));
    this.castSelected = true;
    this.selectedCastUUID = uuid;
    if (this.dataLoaded) {
      this.setupData();
    }
  }

  /** Output the drag and drop data as a cast object */
  dataToCast(): Cast {
    const newCast: Cast = {
      uuid: this.selectedCastUUID,
      segment: this.cast.segment,
      name: this.cast.name,
      filled_positions: this.data.map((val, posInd) => {
        let groupArr = Array(this.getMaxNumberInDancerPositionForData(posInd))
          .fill({
            group_index: 0,
            members: []
          });
        groupArr = groupArr.map((val, ind) => {
          return {
            group_index: ind,
            members: []
          };
        });
        this.data[posInd].forEach((val, dancerPosIndex) => {
          val.forEach((val2, subcastInd) => {
            groupArr[subcastInd].members.push(
              {
                uuid: val2.uuid,
                position_number: dancerPosIndex
              }
            );
          });
        });
        return {
          position_uuid: this.positionVals[posInd].uuid,
          groups: groupArr
        };
      })
    };
    return newCast;
  }

  /**
   * Gets the max number of dancers in any specific position (i.e. max number
   * of subcasts [the columns]) for the position in the cast
   */
  getMaxNumberInDancerPositionForCast(positionIndex: number): number {
    let numSubCasts = 0;
    this.cast.filled_positions[positionIndex].groups.forEach((val) => {
      if (val.group_index + 1 > numSubCasts) {
        numSubCasts = val.group_index + 1;
      }
    });
    return numSubCasts;
  }

  /**
   * Gets the largest number of individual dancers in a position (the max rows)
   */
  getMaxDancerIndexForCast(positionIndex: number): number {
    let numBackups = 0;
    this.cast.filled_positions[positionIndex].groups.forEach((val) => {
      if (val.members.length > numBackups) {
        numBackups = val.members.length;
      }
    });
    return numBackups;
  }

  /**
   * Gets the max number of dancers in any specific position (i.e. max number
   * of subcasts [the columns]) for the position in the drag and drop data
   */
  getMaxNumberInDancerPositionForData(positionIndex: number): number {
    let numSubCasts = 0;
    if (isNullOrUndefined(this.data[positionIndex])) {
      return 0;
    }
    this.data[positionIndex].forEach(val => {
      if (val.length > numSubCasts) {
        numSubCasts = val.length;
      }
    });
    return numSubCasts;
  }

  setColumnHeaders(positionIndex: number) {
    this.columnHeaders[positionIndex] = [];
    const pipe = new NumberToPlacePipe();
    this.columnHeaders[positionIndex] =
      Array(this.getMaxNumberInDancerPositionForData(positionIndex) + 1)
        .fill(0).map((x, i) => pipe.transform(i + 1) + ' Cast');
  }

  ensureEmptyArrayAtEnd(positionIndex: number) {
    this.data[positionIndex] = this.data[positionIndex].filter(row => row.length !== 0);
    this.data[positionIndex].push([]);
  }

  updateEmptyRows(positionIndex: number) {
    const posData = this.data[positionIndex];
    this.emptyCells[positionIndex] = Array(posData.length);
    const numHeaders = this.columnHeaders[positionIndex].length;
    for (let i = 0; i < posData.length; i++) {
      this.emptyCells[positionIndex][i] =
        Array(numHeaders - posData[i].length)
          .map((x, ind) => 'Empty Cell ' + (ind + 1));
    }
  }

  ensureAllPositionsMet(cast: Cast) {
    this.positionVals = this.pieceAPI.pieces.get(this.cast.segment).positions;
    for (const pos of this.positionVals) {
      if (!cast.filled_positions.find(val => val.position_uuid === pos.uuid)) {
        cast.filled_positions.push({
          position_uuid: pos.uuid,
          groups: [{
            group_index: 0,
            members: []
          }]
        });
      }
    }
  }

  setupData() {
    if (!this.castSelected) {
      return;
    }
    if (!this.castAPI.hasCast(this.selectedCastUUID)) {
      this.data = [[]];
      this.castSelected = false;
      this.logging.logError(`Couldn't find cast: ${this.selectedCastUUID}`);
      return;
    }
    this.data = [[]];
    this.cast = this.castAPI.castFromUUID(this.selectedCastUUID);
    this.ensureAllPositionsMet(this.cast);
    // Sort positions by position order
    this.positionVals = this.positionVals.sort((a, b) => {
      return a.order < b.order ? -1 : 1;
    });
    // Sort cast members by position order
    this.cast.filled_positions = this.cast.filled_positions
      .filter(val => this.positionVals.find(val2 => val2.uuid === val.position_uuid))
      .sort((a, b) => {
        const castPositionOrerA = this.positionVals.find(val => val.uuid === a.position_uuid).order;
        const castPositionOrerB = this.positionVals.find(val => val.uuid === b.position_uuid).order;
        return castPositionOrerA < castPositionOrerB ? -1 : 1;
      });
    const filledPoses = this.cast.filled_positions;
    const tempData = filledPoses.map((val, posInd) => {
      const colObs = val.groups.sort((a, b) => a.group_index < b.group_index ? -1 : 1);
      const maxInd = this.getMaxDancerIndexForCast(posInd);
      const subcastStrs: string[][] = [];
      for (let i = 0; i < maxInd; i++) {
        subcastStrs.push([]);
      }
      for (const col of colObs) {
        for (const member of col.members) {
          subcastStrs[member.position_number].push(member.uuid);
        }
      }
      const subcasts = subcastStrs.map(val => val.map(val2 => this.userAPI.users.get(val2)));
      return subcasts;
    });
    this.data = tempData;
    for (let posInd = 0; posInd < this.positionVals.length; posInd++) {
      this.setColumnHeaders(posInd);
      this.ensureEmptyArrayAtEnd(posInd);
      this.updateEmptyRows(posInd);
    }
  }

  drop(event: CdkDragDrop<User[]>) {
    const prevContainerID = event.previousContainer.id;
    if (prevContainerID === 'user-pool' && event.container.id === 'user-pool') {
      return;
    }
    if (prevContainerID === 'user-pool' && event.container.id) {
      const arr = [event.item.data];
      copyArrayItem(arr, event.container.data, 0, event.currentIndex);
      const currentContainerID = event.container.id;
      const currentIdSplits = currentContainerID.split(':');
      const currentPosRowInd: [number, number] = [Number(currentIdSplits[0]), Number(currentIdSplits[1])];
      this.setColumnHeaders(currentPosRowInd[0]);
      this.ensureEmptyArrayAtEnd(currentPosRowInd[0]);
      this.updateEmptyRows(currentPosRowInd[0]);
      this.castChangeEmitter.emit(this.dataToCast());
      return;
    }
    const prevIdSplits = prevContainerID.split(':');
    const prevPosRowInd: [number, number] = [Number(prevIdSplits[0]), Number(prevIdSplits[1])];
    if (event.container.id === 'user-pool') {
      this.data[prevPosRowInd[0]][prevPosRowInd[1]] =
        this.data[prevPosRowInd[0]][prevPosRowInd[1]]
          .filter((val, ind) => (val.uuid !== event.item.data.uuid || ind !== event.previousIndex));
      this.setColumnHeaders(prevPosRowInd[0]);
      this.ensureEmptyArrayAtEnd(prevPosRowInd[0]);
      this.updateEmptyRows(prevPosRowInd[0]);
      this.castChangeEmitter.emit(this.dataToCast());
      return;
    }
    const currentContainerID = event.container.id;
    const currentIdSplits = currentContainerID.split(':');
    const currentPosRowInd: [number, number] = [Number(currentIdSplits[0]), Number(currentIdSplits[1])];
    if (!event.isPointerOverContainer) {
      // Remove person from the cast
      this.data[prevPosRowInd[0]][prevPosRowInd[1]] =
        this.data[prevPosRowInd[0]][prevPosRowInd[1]]
          .filter((val, ind) => (val.uuid !== event.item.data.uuid || ind !== event.previousIndex));
    } else {
      // Move person
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    if (event.previousContainer) {
      this.setColumnHeaders(prevPosRowInd[0]);
      this.ensureEmptyArrayAtEnd(prevPosRowInd[0]);
      this.updateEmptyRows(prevPosRowInd[0]);
    }
    if (event.container && event.isPointerOverContainer) {
      this.setColumnHeaders(currentPosRowInd[0]);
      this.ensureEmptyArrayAtEnd(currentPosRowInd[0]);
      this.updateEmptyRows(currentPosRowInd[0]);
    }
    this.castChangeEmitter.emit(this.dataToCast());
  }

  async saveCast() {
    this.cast = this.dataToCast();
    await this.castAPI.setCast(this.cast).then(val => {
      if (!val.successful) {
        alert(val.error);
      }
    });
  }

  async exportCast() {
    await this.csvGenerator.generateCSVFromCast(this.cast);
  }

  async deleteCast() {
    this.dataLoaded = false;
    this.castsLoaded = false;
    this.castSelected = false;
    this.selectedCastUUID = undefined;
    await this.castAPI.deleteCast(this.cast);
  }
}
