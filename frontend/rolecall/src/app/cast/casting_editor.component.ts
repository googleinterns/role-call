import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APITypes } from 'src/api_types';
import { Colors } from 'src/constants';
import { isNullOrUndefined } from 'util';
import { Cast, CastApi } from '../api/cast_api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
import { User, UserApi } from '../api/user_api.service';
import { LoggingService } from '../services/logging.service';


type CastOrder = {
  position_uuid: string,
  group_index: number,
  adding_index: number
};

type WorkingCast = Cast & {
  addingMembers: Map<CastOrder, APITypes.UserUUID>,
  addingMembersIndexes: CastOrder[],
  nameSaved: boolean,
  currentPositionUUID: string,
  currentGroupIndex: number
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

  userNameAutocompleteOptions: string[] = [];

  constructor(private route: ActivatedRoute, private castAPI: CastApi, private pieceAPI: PieceApi, private userAPI: UserApi,
    private location: Location, private logging: LoggingService) { }

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

  getUserName(userUUID: string) {
    let user = this.userAPI.users.get(userUUID);
    return user.first_name + " " + user.last_name;
  }

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
    let posCasting = this.currentSelectedCast.filled_positions.find(val => val.position_uuid == this.currentSelectedCast.currentPositionUUID);
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

  getAddingMembers() {
    return this.currentSelectedCast.addingMembersIndexes.filter(val => {
      return val.group_index == this.currentSelectedCast.currentGroupIndex && val.position_uuid == this.currentSelectedCast.currentPositionUUID;
    });
  }

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
    this.userNameAutocompleteOptions = [];
    this.userNameAutocompleteOptions = users.map((val) => val.first_name + " " + val.last_name);
  }

  selectPosition() {
    this.currentSelectedCast.currentGroupIndex = 0;
  }

  selectPiece(pieceUUID: string) {
    if (!this.checkIfResourcesLoaded())
      return;
    if (this.creatingCast) {
      let pieceObj = this.pieceAPI.pieces.get(pieceUUID);
      for (let pos of pieceObj.positions) {
        this.currentSelectedCast.filled_positions.push({
          position_uuid: pos.uuid,
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
    this.currentSelectedCast.currentGroupIndex = 0;
  }

  getFilledPosition(currentPosUUID: string) {
    if (!this.checkIfResourcesLoaded() || this.creatingCast)
      return [];
    if (!this.currentSelectedCast.currentGroupIndex)
      this.currentSelectedCast.currentGroupIndex = 0;
    let filledPos = this.currentSelectedCast.filled_positions.find((val) => {
      return val.position_uuid == currentPosUUID;
    });
    if (!filledPos) {
      let groupsArr = [];
      for (let i = 0; i <= this.currentSelectedCast.currentGroupIndex; i++) {
        groupsArr.push({
          group_index: i,
          members: []
        });
      }
      filledPos = {
        position_uuid: currentPosUUID,
        groups: groupsArr
      };
      this.currentSelectedCast.filled_positions.push(filledPos);
    }
    let members = filledPos.groups.find(val => val.group_index == this.currentSelectedCast.currentGroupIndex).members;
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
    if (this.currentSelectedCast && this.currentSelectedCast.uuid != cast.uuid) {
      let piece = this.pieceAPI.pieces.get(cast.segment);
      piece ? cast.currentPositionUUID = piece.positions[0].uuid : cast.currentPositionUUID = undefined;
    }
    this.currentSelectedCast = cast;
    this.lastPieceUUID = this.currentSelectedCast.segment;
    if (this.location.path().endsWith("castv1") || this.location.path().endsWith("castv1/")) {
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
    let filledPos = this.currentSelectedCast.filled_positions.find((val) => val.position_uuid == this.currentSelectedCast.currentPositionUUID);
    let nextInd = filledPos.groups.length;
    filledPos.groups.push({
      group_index: nextInd,
      members: []
    });
    this.currentSelectedCast.currentGroupIndex = nextInd;
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
      currentGroupIndex: undefined,
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
              let findUser = Array.from(this.userAPI.users.values()).find(val => val.first_name.toLowerCase() + " " + val.last_name.toLowerCase() == member[1].toLowerCase());
              if (!findUser) {
                alert("No user with that name!")
              } else {
                group.members.push({ uuid: findUser.uuid, position_number: group.members.length });
              }
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
    this.castSaved = false;
    let nextInd = this.currentSelectedCast.addingMembersIndexes.filter((val) => {
      return val.group_index == this.currentSelectedCast.currentGroupIndex && val.position_uuid == this.currentSelectedCast.currentPositionUUID;
    }).length;
    let co = {
      group_index: this.currentSelectedCast.currentGroupIndex,
      position_uuid: this.currentSelectedCast.currentPositionUUID,
      adding_index: nextInd
    };
    this.currentSelectedCast.addingMembers.set(co, "New Cast Member " + this.currentSelectedCast.addingMembersIndexes.length);
    this.currentSelectedCast.addingMembersIndexes.push(co);
  }

  deleteAddingPositionIndex(index: number) {
    let co = Array.from(this.currentSelectedCast.addingMembers.keys()).find(val => {
      return val.adding_index == index && val.group_index == this.currentSelectedCast.currentGroupIndex && val.position_uuid == this.currentSelectedCast.currentPositionUUID
    });
    Array.from(this.currentSelectedCast.addingMembers.keys()).forEach((val) => {
      if (val.group_index == co.group_index && val.position_uuid == co.position_uuid && val.adding_index > index) {
        this.currentSelectedCast.addingMembers.delete(val);
        val.adding_index = val.adding_index - 1;
        this.currentSelectedCast.addingMembers.set(val, "New Cast Member " + val.adding_index);
      }
    })
    this.currentSelectedCast.addingMembers.delete(co);
    this.currentSelectedCast.addingMembersIndexes = this.currentSelectedCast.addingMembersIndexes.filter(val => val != co);
  }
  deletePositionIndex(index: number) {
    let filledPos = this.currentSelectedCast.filled_positions.find(val => val.position_uuid == this.currentSelectedCast.currentPositionUUID);
    let group = filledPos.groups.find(val => val.group_index == this.currentSelectedCast.currentGroupIndex);
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
    "New Cast Member": {
      key: "filled_positions",
      type: "cast member"
    }
  }

  onAddingCastMemberInput([key, value]: [string, string], index: number) {
    let co = Array.from(this.currentSelectedCast.addingMembers.keys()).find(val => {
      return val.adding_index == index && val.group_index == this.currentSelectedCast.currentGroupIndex && val.position_uuid == this.currentSelectedCast.currentPositionUUID
    });
    if (!co) {
      // this.logging.logError("Not able to find new cast member input CO");
      co = {
        group_index: this.currentSelectedCast.currentGroupIndex,
        position_uuid: this.currentSelectedCast.currentPositionUUID,
        adding_index: index
      };
    }
    this.currentSelectedCast.addingMembers.set(co, value);

  }

  onInputChange(change: [string, any]) {
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
