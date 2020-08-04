import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { Cast, CastApi } from '../api/cast_api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
import { User, UserApi } from '../api/user_api.service';
import { NumberToPlacePipe } from '../common_components/number_to_place.pipe';
import { LoggingService } from '../services/logging.service';

@Component({
  selector: 'app-cast-drag-and-drop',
  templateUrl: './cast-drag-and-drop.component.html',
  styleUrls: ['./cast-drag-and-drop.component.scss']
})
export class CastDragAndDrop implements OnInit {

  data: User[][][];
  positionNames: string[];
  columnHeaders: string[][] = [];
  emptyCells: string[][][] = [];
  selectedCastUUID: APITypes.CastUUID;
  cast: Cast;
  allUsers: User[] = [];

  usersLoaded = false;
  castsLoaded = false;
  piecesLoaded = false;
  dataLoaded = false;
  castSelected = false;

  constructor(private userAPI: UserApi, private castAPI: CastApi,
    private pieceAPI: PieceApi, private logging: LoggingService) { }

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

  onTitleInput(inputEvent: InputEvent) {
    this.cast.name = inputEvent.srcElement['value'];
  }

  onPieceLoad(pieces: Piece[]) {
    this.piecesLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  checkAllLoaded() {
    if (this.usersLoaded && this.castsLoaded && this.piecesLoaded) {
      this.dataLoaded = true;
    }
    return this.dataLoaded;
  }

  onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.allUsers = users.sort((a, b) => a.last_name < b.last_name ? -1 : 1);
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  onCastLoad(casts: Cast[]) {
    this.castsLoaded = true;
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  selectCast(uuid: APITypes.CastUUID) {
    this.castSelected = true;
    this.selectedCastUUID = uuid;
    if (this.dataLoaded) {
      this.setupData();
    }
  }

  dataToCast(): Cast {
    let newCast: Cast = {
      uuid: this.selectedCastUUID,
      segment: this.cast.segment,
      name: this.cast.name,
      filled_positions: this.data.map((val, posInd) => {
        let groupArr = Array(this.getMaxNumberInDancerPositionForData(posInd)).fill({ group_index: 0, members: [] });
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
            )
          });
        });
        return {
          position_uuid: this.positionNames[posInd],
          groups: groupArr
        }
      })
    };
    return newCast;
  }

  getMaxNumberInDancerPositionForCast(positionIndex: number): number {
    let numSubCasts = 0;
    this.cast.filled_positions[positionIndex].groups.forEach((val, ind) => {
      if (val.group_index + 1 > numSubCasts) {
        numSubCasts = val.group_index + 1;
      }
    });
    return numSubCasts;
  }

  getMaxDancerIndexForCast(positionIndex: number): number {
    let numBackups = 0;
    this.cast.filled_positions[positionIndex].groups.forEach((val, ind) => {
      if (val.members.length > numBackups) {
        numBackups = val.members.length;
      }
    });
    return numBackups;
  }

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
    let pipe = new NumberToPlacePipe();
    this.columnHeaders[positionIndex] = Array(this.getMaxNumberInDancerPositionForData(positionIndex) + 1).fill(0).map((x, i) => pipe.transform(i + 1) + " Cast");
  }

  ensureEmptyArrayAtEnd(positionIndex: number) {
    this.data[positionIndex] = this.data[positionIndex].filter(row => row.length != 0);
    this.data[positionIndex].push([]);
  }

  updateEmptyRows(positionIndex: number) {
    let posData = this.data[positionIndex];
    this.emptyCells[positionIndex] = Array(posData.length);
    let numHeaders = this.columnHeaders[positionIndex].length;
    for (let i = 0; i < posData.length; i++) {
      this.emptyCells[positionIndex][i] = Array(numHeaders - posData[i].length).map((x, ind) => "Empty Cell " + (ind + 1));
    }
  }

  ensureAllPositionsMet(cast: Cast) {
    this.positionNames = this.pieceAPI.pieces.get(this.cast.segment).positions;
    for (let posName of this.positionNames) {
      if (!cast.filled_positions.find(val => val.position_uuid == posName)) {
        cast.filled_positions.push({
          position_uuid: posName,
          groups: [
            {
              group_index: 0,
              members: []
            }
          ]
        });
      }
    }
  }

  setupData() {
    if (!this.castSelected) {
      // if (this.cast)
      //   this.cast.filled_positions = this.cast.filled_positions.sort((a, b) => { return this.positionNames.findIndex(val => val == a.position_uuid) - this.positionNames.findIndex(val => val == b.position_uuid) })
      return;
    }
    if (!this.castAPI.hasCast(this.selectedCastUUID)) {
      // if (this.cast)
      //   this.cast.filled_positions = this.cast.filled_positions.sort((a, b) => { return this.positionNames.findIndex(val => val == a.position_uuid) - this.positionNames.findIndex(val => val == b.position_uuid) })
      this.data = [[]];
      this.castSelected = false;
      this.logging.logError("Couldn't find cast: " + this.selectedCastUUID);
      return;
    }
    this.data = [[]];
    this.cast = this.castAPI.castFromUUID(this.selectedCastUUID);
    // this.cast.filled_positions = this.cast.filled_positions.sort((a, b) => { return this.positionNames.findIndex(val => val == a.position_uuid) - this.positionNames.findIndex(val => val == b.position_uuid) })
    this.ensureAllPositionsMet(this.cast);
    this.positionNames = this.positionNames.sort((a, b) => this.cast.filled_positions.findIndex(val => val.position_uuid == a) - this.cast.filled_positions.findIndex(val => val.position_uuid == b));
    let filledPoses = this.cast.filled_positions;
    let tempData = filledPoses.map((val, posInd) => {
      let colObs = val.groups.sort((a, b) => a.group_index < b.group_index ? -1 : 1);
      let maxInd = this.getMaxDancerIndexForCast(posInd);
      let subcastStrs: string[][] = [];
      for (let i = 0; i < maxInd; i++) {
        subcastStrs.push([]);
      }
      for (let col of colObs) {
        for (let i = 0; i < col.members.length; i++) {
          let member = col.members[i];
          subcastStrs[member.position_number].push(member.uuid);
        }
      }
      let subcasts = subcastStrs.map(val => val.map(val2 => this.userAPI.users.get(val2)));
      return subcasts;
    });
    this.data = tempData;
    for (let posInd = 0; posInd < this.positionNames.length; posInd++) {
      this.setColumnHeaders(posInd);
      this.ensureEmptyArrayAtEnd(posInd);
      this.updateEmptyRows(posInd);
    }
    console.log(this.positionNames);
  }

  drop(event: CdkDragDrop<User[]>) {
    let prevContainerID = event.previousContainer.id;
    if (prevContainerID == "user-pool" && event.container.id == "user-pool") {
      return;
    }
    if (prevContainerID == "user-pool" && event.container.id) {
      let arr = [event.item.data];
      copyArrayItem(arr, event.container.data, 0, event.currentIndex);
      let currentContainerID = event.container.id;
      let currentIdSplits = currentContainerID.split(':');
      let currentPosRowInd: [number, number] = [Number(currentIdSplits[0]), Number(currentIdSplits[1])];
      this.setColumnHeaders(currentPosRowInd[0]);
      this.ensureEmptyArrayAtEnd(currentPosRowInd[0]);
      this.updateEmptyRows(currentPosRowInd[0]);
      return;
    }
    let prevIdSplits = prevContainerID.split(':');
    let prevPosRowInd: [number, number] = [Number(prevIdSplits[0]), Number(prevIdSplits[1])];
    if (event.container.id == "user-pool") {
      this.data[prevPosRowInd[0]][prevPosRowInd[1]] =
        this.data[prevPosRowInd[0]][prevPosRowInd[1]].filter((val, ind) => (val.uuid != event.item.data.uuid || ind != event.previousIndex));
      this.setColumnHeaders(prevPosRowInd[0]);
      this.ensureEmptyArrayAtEnd(prevPosRowInd[0]);
      this.updateEmptyRows(prevPosRowInd[0]);
      return;
    }
    let currentContainerID = event.container.id;
    let currentIdSplits = currentContainerID.split(':');
    let currentPosRowInd: [number, number] = [Number(currentIdSplits[0]), Number(currentIdSplits[1])];
    if (!event.isPointerOverContainer) {
      // Remove person from the cast
      this.data[prevPosRowInd[0]][prevPosRowInd[1]] =
        this.data[prevPosRowInd[0]][prevPosRowInd[1]].filter((val, ind) => (val.uuid != event.item.data.uuid || ind != event.previousIndex));
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
  }

  async saveCast() {
    this.cast = this.dataToCast();
    return this.castAPI.setCast(this.cast).then(val => {
      if (!val.successful) {
        alert(val.error);
      }
    });
  }

  async deleteCast() {
    this.dataLoaded = false;
    this.castsLoaded = false;
    this.castSelected = false;
    this.selectedCastUUID = undefined;
    return this.castAPI.deleteCast(this.cast).then(val => {
      if (!val.successful) {
        alert(val.error);
      }
    });
  }

}
