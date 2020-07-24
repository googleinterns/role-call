import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Colors } from 'src/constants';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { Cast, CastApi } from '../api/cast_api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
import { User, UserApi } from '../api/user_api.service';


type CastOrder = {
  position_uuid: string,
  group_index: number,
  cast_index: number
};

type WorkingCast = Cast & {
  addingMembers: Map<CastOrder, APITypes.UserUUID>,
  addingMembersIndexes: CastOrder[],
  nameSaved: boolean,
  currentPositionUUID: string,
  currentCastIndex: number
}

@Component({
  selector: 'app-casting-editor',
  templateUrl: './casting_editor.component.html',
  styleUrls: ['./casting_editor.component.scss']
})
export class CastingEditor implements OnInit {

  currentSelectedCast: WorkingCast;
  renderingCasts: WorkingCast[];
  urlPointingUUID: string;

  privilegeClasses: string[] = [];

  prevWorkingState: WorkingCast;
  workingCast: WorkingCast;
  castSaved: boolean = false;

  creatingCast: boolean = false;

  offWhite: string = Colors.offWhite;

  allResourcesLoaded: boolean = false;
  castsLoaded = false;
  piecesLoaded = false;
  usersLoaded = false;

  lastPieceUUID: string;

  constructor(private route: ActivatedRoute, private castAPI: CastApi, private pieceAPI: PieceApi, private userAPI: UserApi,
    private location: Location) { }

  ngOnInit(): void {
    let uuid = this.route.snapshot.params.uuid;
    if (!isNullOrUndefined(uuid)) {
      this.urlPointingUUID = uuid;
    }
    this.castAPI.castEmitter.subscribe((val) => { this.onCastLoad(val) });
    this.castAPI.getAllCasts();
    this.pieceAPI.pieceEmitter.subscribe((val) => { this.onPieceLoad(val) });
    this.pieceAPI.getAllPieces();
    this.userAPI.userEmitter.subscribe((val) => { this.onUserLoad(val) });
    this.userAPI.getAllUsers();
  }

  getPieceOptions() {
    if (!this.piecesLoaded) {
      return [];
    }
    return Array.from(this.pieceAPI.pieces.values());
  }

  // castOption = [{
  //   index: 0,
  //   name: "1st"
  // }];

  // generateCastOptions() {
  //   let maxIndex = -1;
  //   let filledCast = this.currentSelectedCast.filled_positions.find(val => val.position_uuid == this.currentSelectedCast.currentPositionUUID);
  //   filledCast.groups.forEach((val) => {
  //     if (val.group_index > maxIndex) {
  //       maxIndex = val.group_index;
  //     }
  //   });
  //   for (let i = 0; i < maxIndex + 1; i++) {
  //     this.castOptions.push({
  //       index: i,
  //       name: "i + end"
  //     });
  //   }
  // }

  getCastOptions() {
    let cast = this.castAPI.casts.get(this.currentSelectedCast.uuid);
    let posCasting = cast.filled_positions.find(val => val.position_uuid == this.currentSelectedCast.currentPositionUUID);
    if (!posCasting)
      return [];
    return posCasting.groups;
  }


  // getCastOptions(): { index: number, name: string }[] {
  //   if (!this.piecesLoaded) {
  //     return [];
  //   }
  //   let filledCast = this.currentSelectedCast.filled_positions.find(val => val.position_uuid == this.currentSelectedCast.currentPositionUUID);
  //   if (!filledCast)
  //     return [];
  //   return this.castOptions.copyWithin(0, 0, 1);
  // }

  checkIfResourcesLoaded() {
    if (this.castsLoaded && this.piecesLoaded && this.usersLoaded) {
      this.allResourcesLoaded = true;
    }
    return this.allResourcesLoaded;
  }

  onPieceLoad(pieces: Piece[]) {
    this.piecesLoaded = true;
    this.checkIfResourcesLoaded();
  }

  onUserLoad(users: User[]) {
    this.usersLoaded = true;
    this.checkIfResourcesLoaded();
  }

  selectPiece(pieceUUID: string) {
    if (!this.checkIfResourcesLoaded())
      return;
    if (this.creatingCast) {
      let pieceObj = this.pieceAPI.pieces.get(pieceUUID);
      for (let pos of pieceObj.positions) {
        this.currentSelectedCast.filled_positions.push({
          position_uuid: pos,
          groups: [
            {
              group_index: 0,
              members: []
            }
          ]
        });
      }
    } else {
      alert('Can\'t change cast piece! Instead, create a new cast');
      this.currentSelectedCast.segment = this.lastPieceUUID;
    }
    this.currentSelectedCast.currentCastIndex = 0;
  }

  getFilledPosition(currentPosUUID: string) {
    if (!this.checkIfResourcesLoaded() || this.creatingCast)
      return [];
    if (!this.currentSelectedCast.currentCastIndex)
      this.currentSelectedCast.currentCastIndex = 0;
    let members = this.currentSelectedCast.filled_positions.find((val) => {
      return val.position_uuid == currentPosUUID;
    }).groups.find(val => val.group_index == this.currentSelectedCast.currentCastIndex).members;
    return members;
  }

  getPositionOptions() {
    if (!this.checkIfResourcesLoaded() || isNullOrUndefined(this.currentSelectedCast.segment))
      return [];
    let pieceObj = this.pieceAPI.pieces.get(this.currentSelectedCast.segment);
    return pieceObj.positions;
  }

  onCastLoad(casts: Cast[]) {
    if (casts.length == 0) {
      this.renderingCasts = [];
      this.castsLoaded = true;
      this.checkIfResourcesLoaded();
      return;
    }
    let workCasts = casts.map(val => {
      val['addingMembersIndexes'] = [];
      val['addingMembers'] = new Map<CastOrder, string>();
      val['nameSaved'] = true;
      val['currentPositionUUID'] = val.filled_positions[0].position_uuid;
      val['curentCastIndex'] = undefined;
      return val as WorkingCast;
    });
    this.renderingCasts = workCasts;
    if (isNullOrUndefined(this.urlPointingUUID)) {
      this.setCurrentCast(workCasts[0]);
    } else {
      let foundCast = workCasts.find((val) => val.uuid == this.urlPointingUUID);
      if (isNullOrUndefined(foundCast)) {
        this.setCurrentCast(workCasts[0]);
      } else {
        this.setCurrentCast(foundCast);
      }
    }
    this.castsLoaded = true;
    this.checkIfResourcesLoaded();
  }

  setCurrentCast(cast: WorkingCast) {
    if (cast && this.currentSelectedCast && cast.uuid !== this.currentSelectedCast.uuid) {
      this.castSaved = false;
      this.creatingCast = false;
      this.currentSelectedCast.addingMembers.clear();
      this.currentSelectedCast.addingMembersIndexes = [];
    }
    if ((this.workingCast && cast.uuid != this.workingCast.uuid)) {
      this.renderingCasts = this.renderingCasts.filter(val => val.uuid != this.workingCast.uuid);
      if (this.prevWorkingState != undefined) {
        this.currentSelectedCast = this.prevWorkingState;
        this.renderingCasts.push(this.currentSelectedCast);
      }
      this.prevWorkingState = undefined;
      this.workingCast = undefined;
    }
    this.currentSelectedCast = cast;
    this.lastPieceUUID = this.currentSelectedCast.segment;
    let piece = this.pieceAPI.pieces.get(this.currentSelectedCast.segment);
    piece ? this.currentSelectedCast.currentPositionUUID = piece.positions[0] : this.currentSelectedCast.currentPositionUUID = undefined;
    if (this.location.path().endsWith("cast") || this.location.path().endsWith("cast/")) {
      this.location.replaceState(this.location.path() + "/" + cast.uuid);
    } else {
      let splits: string[] = this.location.path().split('/');
      let baseURL = "";
      for (let i = 0; i < splits.length - 1; i++) {
        baseURL += (splits[i] + "/");
      }
      this.location.replaceState(baseURL + cast.uuid);
    }
    this.urlPointingUUID = cast.uuid;
    this.renderingCasts.sort((a, b) => a.uuid < b.uuid ? -1 : 1);
  }

  addNthCast() {
    let filledPos = this.currentSelectedCast.filled_positions.find((val) => this.currentSelectedCast.currentPositionUUID);
    let nextInd = filledPos.groups.length;
    filledPos.groups.push({
      group_index: nextInd,
      members: []
    });
    this.currentSelectedCast.currentCastIndex = nextInd;
  }

  addCast() {
    if (this.creatingCast || !this.checkIfResourcesLoaded()) {
      return;
    }
    this.creatingCast = true;
    this.prevWorkingState = undefined;
    let newCast: WorkingCast = {
      uuid: "cast:" + Date.now(),
      name: undefined,
      segment: undefined,
      currentPositionUUID: undefined,
      currentCastIndex: undefined,
      filled_positions: [],
      nameSaved: false,
      addingMembers: new Map(),
      addingMembersIndexes: []
    }
    this.currentSelectedCast = newCast;
    this.renderingCasts.push(newCast);
    this.workingCast = newCast;
    this.setCurrentCast(this.workingCast);
  }


  onSaveCast() {
    if (this.currentSelectedCast && (!this.currentSelectedCast.name || this.currentSelectedCast.name == "")) {
      alert("You must enter a cast name!");
      return;
    }
    this.creatingCast = false;
    this.castSaved = true;
    this.castAPI.setCast(this.currentSelectedCast).then(async val => {
      if (val.successful) {
        for (let member of this.currentSelectedCast.addingMembers.entries()) {
          let filled_cast = this.currentSelectedCast.filled_positions.find((val) => {
            return val.position_uuid == member[0].position_uuid;
          });
          if (filled_cast) {
            let group = filled_cast.groups.find((val2) => val2.group_index == member[0].group_index);
            if (group) {
              group.members.push(member[1]);
            }
          }
        }
        // this.currentSelectedCast.positions.push(...this.currentSelectedCast.addingMembers.values());
        this.currentSelectedCast.addingMembers.clear();
        this.currentSelectedCast.addingMembersIndexes = [];
        let prevUUID = this.currentSelectedCast.uuid;
        this.prevWorkingState = undefined;
        this.workingCast = undefined;
        await this.castAPI.getAllCasts();
        let foundSame = this.renderingCasts.find(val => val.uuid == prevUUID);
        if (foundSame) {
          this.setCurrentCast(foundSame);
        }
      } else {
        alert("Cast save failed! Try again.");
      }
    });
  }

  addPositionIndex() {
    // this.creatingCast = true;
    // this.castSaved = false;
    // let nextInd = (this.currentSelectedCast.positions.length + this.currentSelectedCast.addingMembers.size + 1);
    // this.currentSelectedCast.addingMembers.set(nextInd, "Position " + nextInd);
    // this.currentSelectedCast.addingMembersIndexes.push(nextInd);
  }

  deleteAddingPositionIndex(index: number) {
    // let realInd = this.currentSelectedCast.positions.length + index + 1;
    // this.currentSelectedCast.addingMembersIndexes =
    //   this.currentSelectedCast.addingMembersIndexes.filter((val) => val != realInd);
    // this.currentSelectedCast.addingMembers.delete(realInd);
  }
  deletePositionIndex(index: number) {
    let filledPos = this.currentSelectedCast.filled_positions.find(val => val.position_uuid == this.currentSelectedCast.currentPositionUUID);
    let group = filledPos.groups.find(val => val.group_index == this.currentSelectedCast.currentCastIndex);
    group.members = group.members.filter((val, ind) => ind != index);
    // this.currentSelectedCast.positions = this.currentSelectedCast.positions.filter((val, ind) => ind != index);
  }

  editTitle() {
    this.castSaved = false;
    this.currentSelectedCast.name = undefined;
    this.currentSelectedCast.nameSaved = false;
    this.renderingCasts = this.renderingCasts.filter(val => val.uuid != this.currentSelectedCast.uuid);
    this.renderingCasts.push(this.currentSelectedCast);
  }

  deleteCast() {
    this.prevWorkingState = undefined;
    this.renderingCasts = this.renderingCasts.filter(val => val.uuid != this.currentSelectedCast.uuid);
    this.castAPI.deleteCast(this.currentSelectedCast);
    this.renderingCasts.length > 0 ? this.setCurrentCast(this.renderingCasts[0]) : this.setCurrentCast(undefined);
  }

  nameToPropertyMap = {
    "New Cast Name": {
      key: "name",
      type: "string"
    },
    "Last Name": {
      key: "last_name",
      type: "string"
    },
    "Date of Birth": {
      key: "date_of_birth",
      type: "date"
    },
    "Email": {
      key: "contact_info.email",
      type: "string"
    },
    "Permissions": {
      key: "has_permissions",
      type: "permissions"
    },
    "Phone": {
      key: "contact_info.phone_number",
      type: "string"
    },
    "Privilege Classes": {
      key: "has_privilege_classes",
      type: "string list"
    }
  }

  onInputChange(change: [string, any]) {
    console.log(change);
    let valueName = change[0];
    let value = change[1];
    if (!this.workingCast) {
      this.prevWorkingState = this.currentSelectedCast;
      this.workingCast = this.currentSelectedCast;
      this.setCurrentCast(this.workingCast);
    }
    if (this.workingCast) {
      this.setWorkingPropertyByKey(valueName, value);
    }
  }

  setWorkingPropertyByKey(key: string, val: any) {
    let info = this.nameToPropertyMap[key];
    let splits = info.key.split(".");
    let objInQuestion = this.workingCast;
    for (let i = 0; i < splits.length - 1; i++) {
      objInQuestion = objInQuestion[splits[i]];
    }
    objInQuestion[splits[splits.length - 1]] = val;
  }
}
