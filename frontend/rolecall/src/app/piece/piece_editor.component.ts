import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Colors } from 'src/constants';
import { isNullOrUndefined } from 'util';
import { Piece, PieceApi } from '../api/piece_api.service';

type WorkingPiece = Piece & {
  addingPositions: Map<number, string>,
  addingPositionsIndexes: number[],
  nameSaved: boolean
}

@Component({
  selector: 'app-piece-editor',
  templateUrl: './piece_editor.component.html',
  styleUrls: ['./piece_editor.component.scss']
})
export class PieceEditor implements OnInit {

  currentSelectedPiece: WorkingPiece;
  renderingPieces: WorkingPiece[];
  urlPointingUUID: string;

  privilegeClasses: string[] = [];

  prevWorkingState: WorkingPiece;
  workingPiece: WorkingPiece;
  pieceSaved: boolean = false;

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
      val['addingPositionsIndexes'] = [];
      val['addingPositions'] = new Map<number, string>();
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
      this.pieceSaved = false;
      this.creatingPiece = false;
      this.currentSelectedPiece.addingPositions.clear();
      this.currentSelectedPiece.addingPositionsIndexes = [];
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
    if (this.location.path().endsWith("piece") || this.location.path().endsWith("piece/")) {
      this.location.replaceState(this.location.path() + "/" + piece.uuid);
    } else {
      let splits: string[] = this.location.path().split('/');
      let baseURL = "";
      for (let i = 0; i < splits.length - 1; i++) {
        baseURL += (splits[i] + "/");
      }
      this.location.replaceState(baseURL + piece.uuid);
    }
    this.urlPointingUUID = piece.uuid;
    this.renderingPieces.sort((a, b) => a.uuid < b.uuid ? -1 : 1);
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
      addingPositions: new Map<number, string>(),
      addingPositionsIndexes: []
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
    this.pieceAPI.setPiece(this.currentSelectedPiece).then(async val => {
      if (val.successful) {
        this.currentSelectedPiece.positions.push(...this.currentSelectedPiece.addingPositions.values());
        this.currentSelectedPiece.addingPositions.clear();
        this.currentSelectedPiece.addingPositionsIndexes = [];
        let prevUUID = this.currentSelectedPiece.uuid;
        this.prevWorkingState = undefined;
        this.workingPiece = undefined;
        await this.pieceAPI.getAllPieces();
        let foundSame = this.renderingPieces.find(val => val.uuid == prevUUID);
        if (foundSame) {
          this.setCurrentPiece(foundSame);
        }
      } else {
        alert("Piece save failed! Try again.");
      }
    });
  }

  addPosition() {
    this.creatingPiece = true;
    this.pieceSaved = false;
    let nextInd = (this.currentSelectedPiece.positions.length + this.currentSelectedPiece.addingPositions.size + 1);
    this.currentSelectedPiece.addingPositions.set(nextInd, "Position " + nextInd);
    this.currentSelectedPiece.addingPositionsIndexes.push(nextInd);
  }

  deleteAddingPosition(index: number) {
    let realInd = this.currentSelectedPiece.positions.length + index + 1;
    this.currentSelectedPiece.addingPositionsIndexes =
      this.currentSelectedPiece.addingPositionsIndexes.filter((val) => val != realInd);
    this.currentSelectedPiece.addingPositions.delete(realInd);
  }
  deletePosition(index: number) {
    this.currentSelectedPiece.positions = this.currentSelectedPiece.positions.filter((val, ind) => ind != index);
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
      this.currentSelectedPiece.addingPositions.set(index, val);
    }
    if (key == "New Piece Name") {
      this.currentSelectedPiece.name = val;
    }
  }
}
