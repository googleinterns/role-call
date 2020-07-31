import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Colors } from 'src/constants';
import { isNullOrUndefined } from 'util';
import { Piece, PieceApi } from '../api/piece_api.service';

type WorkingPiece = Piece & {
  addingPositions: { index: number, value: string }[],
  nameSaved: boolean
}

@Component({
  selector: 'app-piece-editor',
  templateUrl: './piece_editor.component.html',
  styleUrls: ['./piece_editor.component.scss']
})
export class PieceEditor implements OnInit {

  dragAndDropData: { type: "adding" | "added", index: number, value: string }[] = [];
  currentSelectedPiece: WorkingPiece;
  renderingPieces: WorkingPiece[];
  urlPointingUUID: string;

  privilegeClasses: string[] = [];

  prevWorkingState: WorkingPiece;
  workingPiece: WorkingPiece;
  pieceSaved: boolean = true;

  creatingPiece: boolean = false;

  offWhite: string = Colors.offWhite;

  constructor(private route: ActivatedRoute, private pieceAPI: PieceApi,
    private location: Location) { }

  ngOnInit(): void {
    let uuid = this.route.snapshot.params.uuid;
    if (!isNullOrUndefined(uuid)) {
      this.urlPointingUUID = uuid;
    }
    this.pieceAPI.pieceEmitter.subscribe((val) => { this.onPieceLoad(val) });
    this.pieceAPI.getAllPieces();
  }

  onPieceLoad(pieces: Piece[]) {
    if (pieces.length == 0) {
      this.renderingPieces = [];
      return;
    }
    let workPieces = pieces.map(val => {
      val['addingPositions'] = [];
      val['nameSaved'] = true;
      return val as WorkingPiece;
    });
    this.renderingPieces = workPieces;
    if (isNullOrUndefined(this.urlPointingUUID)) {
      this.setCurrentPiece(workPieces[0]);
    } else {
      let foundPiece = workPieces.find((val) => val.uuid == this.urlPointingUUID);
      if (isNullOrUndefined(foundPiece)) {
        this.setCurrentPiece(workPieces[0]);
      } else {
        this.setCurrentPiece(foundPiece);
      }
    }
  }

  setCurrentPiece(piece: WorkingPiece) {
    if (piece && this.currentSelectedPiece && piece.uuid !== this.currentSelectedPiece.uuid) {
      this.pieceSaved = true;
      this.creatingPiece = false;
      this.currentSelectedPiece.addingPositions = [];
    }
    if ((this.workingPiece && piece.uuid != this.workingPiece.uuid)) {
      this.renderingPieces = this.renderingPieces.filter(val => val.uuid != this.workingPiece.uuid);
      if (this.prevWorkingState != undefined) {
        this.currentSelectedPiece = this.prevWorkingState;
        this.renderingPieces.push(this.currentSelectedPiece);
      }
      this.prevWorkingState = undefined;
      this.workingPiece = undefined;
    }
    this.currentSelectedPiece = piece;
    if (this.location.path().startsWith("/piece") || this.location.path().startsWith("/piece/")) {
      this.location.replaceState("/piece/" + piece.uuid);
    }
    this.urlPointingUUID = piece.uuid;
    this.renderingPieces.sort((a, b) => a.uuid < b.uuid ? -1 : 1);
    this.updateDragAndDropData();
  }

  addPiece() {
    if (this.creatingPiece) {
      return;
    }
    this.creatingPiece = true;
    this.prevWorkingState = undefined;
    let newPiece: WorkingPiece = {
      uuid: "piece:" + Date.now(),
      name: undefined,
      positions: [],
      nameSaved: false,
      addingPositions: []
    }
    this.currentSelectedPiece = newPiece;
    this.renderingPieces.push(newPiece);
    this.workingPiece = newPiece;
    this.pieceSaved = false;
    this.dragAndDropData = [];
    this.setCurrentPiece(this.workingPiece);
  }


  onSavePiece() {
    if (this.currentSelectedPiece && (!this.currentSelectedPiece.name || this.currentSelectedPiece.name == "")) {
      alert("You must enter a piece name!");
      return;
    }
    this.updateDragAndDropData(true);
    this.pieceSaved = true;
    this.pieceAPI.setPiece(this.currentSelectedPiece).then(async val => {
      if (val.successful) {
        this.currentSelectedPiece.addingPositions = [];
        let prevUUID = this.currentSelectedPiece.uuid;
        this.prevWorkingState = undefined;
        this.workingPiece = undefined;
        await this.pieceAPI.getAllPieces();
        let foundSame = this.renderingPieces.find(val => val.uuid == prevUUID);
        if (foundSame && this.location.path().startsWith("/piece")) {
          this.setCurrentPiece(foundSame);
        }
      } else {
        alert("Piece save failed! Try again.");
      }
    });
  }

  addPosition() {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    this.creatingPiece = true;
    this.pieceSaved = false;
    let nextInd = (this.currentSelectedPiece.positions.length + this.currentSelectedPiece.addingPositions.length);
    this.dragAndDropData.push({ index: nextInd, value: "New Position", type: "adding" });
    this.updateDragAndDropData();
  }

  deleteAddingPosition(index: number) {
    this.dragAndDropData = this.dragAndDropData.filter((val, ind) => val.index != index);
    this.pieceSaved = false;
    this.updateDragAndDropData();
  }
  deletePosition(index: number) {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    this.dragAndDropData = this.dragAndDropData.filter((val, ind) => val.index != index);
    this.pieceSaved = false;
    this.updateDragAndDropData();
  }

  editTitle() {
    this.pieceSaved = false;
    this.currentSelectedPiece.name = undefined;
    this.currentSelectedPiece.nameSaved = false;
    this.renderingPieces = this.renderingPieces.filter(val => val.uuid != this.currentSelectedPiece.uuid);
    this.renderingPieces.push(this.currentSelectedPiece);
  }

  deletePiece() {
    this.prevWorkingState = undefined;
    this.renderingPieces = this.renderingPieces.filter(val => val.uuid != this.currentSelectedPiece.uuid);
    this.pieceAPI.deletePiece(this.currentSelectedPiece);
    this.renderingPieces.length > 0 ? this.setCurrentPiece(this.renderingPieces[0]) : this.setCurrentPiece(undefined);
    this.pieceSaved = false;
  }

  onInputChange(change: [string, any], data?: any) {
    let valueName = change[0];
    let value = change[1];
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    if (this.workingPiece) {
      this.setWorkingPropertyByKey(valueName, value, data);
    }
  }

  setWorkingPropertyByKey(key: string, val: string, data?: any) {
    if (key.startsWith("New Position")) {
      let found = this.currentSelectedPiece.addingPositions.find(val => val.index == data.index);
      if (found)
        found.value = val;
    }
    if (key == "New Piece Name") {
      this.currentSelectedPiece.name = val;
    }
  }

  updateDragAndDropData(writeThru?: boolean) {
    if (this.pieceSaved) {
      this.dragAndDropData = this.currentSelectedPiece.positions.map((val, ind) => {
        return {
          index: ind,
          value: val,
          type: "added"
        };
      });
      return;
    }
    let newDDData = [];
    this.currentSelectedPiece.positions = [];
    this.currentSelectedPiece.addingPositions = [];
    for (let i = 0; i < this.dragAndDropData.length; i++) {
      let data = this.dragAndDropData[i];
      if (data.type == "added") {
        let struct = {
          type: "added",
          index: i,
          value: data.value
        };
        newDDData.push(struct);
        this.currentSelectedPiece.positions.push(struct.value);
      } else {
        let struct = {
          type: "adding",
          index: i,
          value: data.value
        };
        newDDData.push(struct);
        this.currentSelectedPiece.addingPositions.push(struct);
      }
    }
    this.dragAndDropData = newDDData;
    if (writeThru && writeThru) {
      console.log(this.dragAndDropData);
      this.currentSelectedPiece.positions = this.dragAndDropData.sort((a, b) => a.index - b.index).map(val => val.value);
      this.currentSelectedPiece.addingPositions = [];
    }
  }

  drop(event: CdkDragDrop<any>) {
    this.dragAndDropData[event.previousIndex].index = event.currentIndex;
    this.dragAndDropData[event.currentIndex].index = event.previousIndex;
    transferArrayItem(this.dragAndDropData, this.dragAndDropData, event.previousIndex, event.currentIndex);
    this.pieceSaved = false;
  }
}
