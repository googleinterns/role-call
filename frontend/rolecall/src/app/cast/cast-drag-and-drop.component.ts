import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { Cast, CastApi } from '../api/cast_api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
import { User, UserApi } from '../api/user_api.service';
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

  constructor(private userAPI: UserApi, private castAPI: CastApi, private pieceAPI: PieceApi, private logging: LoggingService, private route: ActivatedRoute) { }

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
    let uuid = this.route.snapshot.params.uuid;
    if (!isNullOrUndefined(uuid)) {
      this.selectCast(uuid);
    }
    this.castAPI.getAllCasts();
    this.userAPI.getAllUsers();
    this.pieceAPI.getAllPieces();
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
    this.allUsers = users;
    this.allUsers.push(...users);
    this.allUsers.push(...users);
    if (this.checkAllLoaded()) {
      this.setupData();
    }
  }

  onCastLoad(casts: Cast[]) {
    this.castsLoaded = true;
    if (!this.castSelected) {
      this.selectCast(casts[0].uuid);
    }
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

  dataToCast() {
    // let newCast: Cast = {
    //   uuid: this.selectedCastUUID,
    //   segment: this.cast.segment,
    //   name: this.cast.name,
    //   filled_positions: this.data.map((val, ind) => {
    //     return {
    //       position_uuid: this.positionNames[ind],

    //     }
    //   })
    // };
  }

  getMaxNumberInSubcastForCast(positionIndex: number): number {
    let numSubCasts = 0;
    this.cast.filled_positions[positionIndex].groups.forEach((val, ind) => {
      if (val.group_index + 1 > numSubCasts) {
        numSubCasts = val.group_index + 1;
      }
    });
    return numSubCasts;
  }

  getMaxNumberInSubcastForData(positionIndex: number): number {
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
    this.columnHeaders[positionIndex] = Array(this.getMaxNumberInSubcastForData(positionIndex) + 1).fill(0).map((x, i) => "Subcast " + (i + 1));
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

  setupData(setCast?: boolean) {
    if (!isNullOrUndefined(setCast) && setCast && this.data) {
      // this.castAPI.setCast();
    }
    if (!this.castAPI.casts.has(this.selectedCastUUID)) {
      this.data = [[]];
      this.logging.logError("Couldn't find cast: " + this.selectedCastUUID);
    }
    this.cast = this.castAPI.casts.get(this.selectedCastUUID)
    this.positionNames = this.pieceAPI.pieces.get(this.cast.segment).positions;
    let filledPoses = this.cast.filled_positions;
    let tempData = filledPoses.map((val, posInd) => {
      let colObs = val.groups.sort((a, b) => a.group_index < b.group_index ? -1 : 1);
      let numSubCasts = this.getMaxNumberInSubcastForCast(posInd);
      let subcastStrs: string[][] = [];
      for (let i = 0; i < numSubCasts; i++) {
        subcastStrs.push([]);
      }
      for (let col of colObs) {
        for (let i = 0; i < col.members.length; i++) {
          subcastStrs[i].push(col.members[i]);
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
  }

  drop(event: CdkDragDrop<User[]>) {
    let prevContainerID = event.previousContainer.id;
    if (prevContainerID == "user-pool" && event.container.id == "user-pool") {
      return;
    }
    if (prevContainerID == "user-pool") {
      copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
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
        this.data[prevPosRowInd[0]][prevPosRowInd[1]].filter((val, ind) => (val.uuid != event.item.data.uuid || ind != event.previousIndex - 1));
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
        this.data[prevPosRowInd[0]][prevPosRowInd[1]].filter((val, ind) => (val.uuid != event.item.data.uuid || ind != event.previousIndex - 1));
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
    console.log(this.data);
  }

}
