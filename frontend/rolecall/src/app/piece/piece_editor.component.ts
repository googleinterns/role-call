import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { Piece, PieceApi } from '../api/piece_api.service';

@Component({
  selector: 'app-piece-editor',
  templateUrl: './piece_editor.component.html',
  styleUrls: ['./piece_editor.component.scss']
})
export class PieceEditor implements OnInit {

  currentSelectedPiece: Piece;
  renderingPieces: Piece[];
  urlPointingUUID: string;

  privilegeClasses: string[] = [];

  prevWorkingState: Piece;
  workingPiece: Piece;
  pieceSaved: boolean = false;

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

  ngOnDestroy(): void {
    this.pieceAPI.pieceEmitter.unsubscribe();
  }

  onPieceLoad(pieces: Piece[]) {
    if (pieces.length == 0) {
      this.renderingPieces = [];
      return;
    }
    this.renderingPieces = pieces;
    if (isNullOrUndefined(this.urlPointingUUID)) {
      this.setCurrentPiece(pieces[0]);
    } else {
      let foundPiece = pieces.find((val) => val.uuid == this.urlPointingUUID);
      if (isNullOrUndefined(foundPiece)) {
        this.setCurrentPiece(pieces[0]);
      } else {
        this.setCurrentPiece(foundPiece);
      }
    }
  }

  setCurrentPiece(piece: Piece) {
    if (piece && this.currentSelectedPiece && piece.uuid !== this.currentSelectedPiece.uuid) {
      this.pieceSaved = false;
    }
    if (this.workingPiece && piece.uuid != this.workingPiece.uuid) {
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
    this.prevWorkingState = undefined;
    let newPiece: Piece = {
      uuid: "piece:" + Date.now(),
      name: undefined,
      positions: []
    }
    this.currentSelectedPiece = newPiece;
    this.renderingPieces.push(newPiece);
    this.workingPiece = newPiece;
    this.setCurrentPiece(this.workingPiece);
  }

  newPieceNameSaved = true;


  onSavePiece() {
    this.pieceSaved = true;
    this.pieceAPI.setPiece(this.workingPiece).then(async val => {
      if (val.successful) {
        let prevUUID = this.workingPiece.uuid;
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

  onSaveNewPieceName() {

  }

  onInputChange(change: [string, any]) {
    let valueName = change[0];
    let value = change[1];
    if (!this.workingPiece) {
      this.prevWorkingState = JSON.parse(JSON.stringify(this.currentSelectedPiece));
      this.workingPiece = JSON.parse(JSON.stringify(this.currentSelectedPiece));
      this.setCurrentPiece(this.workingPiece);
    }
    if (this.workingPiece) {
      this.setWorkingPropertyByKey(valueName, value);
    }
  }

  setWorkingPropertyByKey(key: string, val: string) {

  }
}
