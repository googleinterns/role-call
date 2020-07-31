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
    this.setCurrentPiece(this.workingPiece);
  }


  onSavePiece() {
    if (this.currentSelectedPiece && (!this.currentSelectedPiece.name || this.currentSelectedPiece.name == "")) {
      alert("You must enter a piece name!");
      return;
    }
    this.pieceSaved = true;
    this.currentSelectedPiece.positions.push(...this.currentSelectedPiece.addingPositions.map(val => val.value));
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
    this.currentSelectedPiece.addingPositions.push({ index: nextInd, value: "New Position" });
    this.updateDragAndDropData();
  }

  deleteAddingPosition(index: number) {
    let realInd = index;
    this.currentSelectedPiece.addingPositions = this.currentSelectedPiece.addingPositions.filter((val, ind) => val.index != realInd);
    this.updateDragAndDropData();
  }
  deletePosition(index: number) {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    this.currentSelectedPiece.positions = this.currentSelectedPiece.positions.filter((val, ind) => ind != index);
    this.updateDragAndDropData();
    this.pieceSaved = false;
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

  onInputChange(change: [string, any]) {
    let valueName = change[0];
    let value = change[1];
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    if (this.workingPiece) {
      this.setWorkingPropertyByKey(valueName, value);
    }
  }

  setWorkingPropertyByKey(key: string, val: string) {
    if (key.startsWith("Position")) {
      let index = Number(key.split(" ")[1]);
      let found = this.currentSelectedPiece.addingPositions.find(val => val.index == index);
      console.log(found);
      if (found)
        found.value = val;
    }
    if (key == "New Piece Name") {
      this.currentSelectedPiece.name = val;
    }
  }

  updateDragAndDropData() {
    console.log(this.dragAndDropData)
    console.log(this.currentSelectedPiece.addingPositions, this.currentSelectedPiece.positions);
    this.dragAndDropData = [];
    for (let i = 0; i < this.currentSelectedPiece.positions.length; i++) {
      this.dragAndDropData.push({
        type: "added",
        index: i,
        value: this.currentSelectedPiece.positions[i]
      });
    }
    for (let i = 0; i < this.currentSelectedPiece.addingPositions.length; i++) {
      this.dragAndDropData.push({
        type: "adding",
        index: this.currentSelectedPiece.addingPositions[i].index,
        value: this.currentSelectedPiece.addingPositions[i].value
      });
    }
  }

  drop(event: CdkDragDrop<any>) {
    transferArrayItem(this.dragAndDropData, this.dragAndDropData, event.previousIndex, event.currentIndex);
    this.pieceSaved = false;
  }
}
