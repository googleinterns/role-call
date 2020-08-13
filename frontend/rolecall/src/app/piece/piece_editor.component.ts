import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Colors } from 'src/constants';
import { isNullOrUndefined } from 'util';
import { Piece, PieceApi, Position } from '../api/piece_api.service';
import { ResponseStatusHandlerService } from '../services/response-status-handler.service';

type WorkingPiece = Piece & {
  addingPositions: { index: number, value: Position, type: "adding" | "added" }[],
  originalName: string
}

@Component({
  selector: 'app-piece-editor',
  templateUrl: './piece_editor.component.html',
  styleUrls: ['./piece_editor.component.scss']
})
export class PieceEditor implements OnInit {

  dragAndDropData: { type: "adding" | "added", index: number, value: Position }[] = [];
  currentSelectedPiece: WorkingPiece;
  renderingPieces: WorkingPiece[];
  urlPointingUUID: string;

  privilegeClasses: string[] = [];

  prevWorkingState: WorkingPiece;
  workingPiece: WorkingPiece;
  pieceSaved: boolean = true;

  creatingPiece: boolean = false;
  piecesLoaded: boolean = false;

  offWhite: string = Colors.offWhite;

  lastSelectedPieceName: string;

  constructor(private route: ActivatedRoute, private pieceAPI: PieceApi,
    private location: Location, private respHandler: ResponseStatusHandlerService) { }

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
      this.piecesLoaded = true;
      return;
    }
    if (this.renderingPieces) {
      let prevPieceUUIDS = new Set(this.renderingPieces.map(piece => piece.uuid));
      let newPieces: Piece[] = [];
      for (let piece of pieces) {
        if (!prevPieceUUIDS.has(piece.uuid)) {
          newPieces.push(piece);
        }
      }
      if (newPieces.length > 0) {
        for (let newPiece of newPieces) {
          if (newPiece.name == this.lastSelectedPieceName) {
            this.lastSelectedPieceName == newPiece.uuid;
            this.urlPointingUUID = newPiece.uuid;
          }
        }
      }
    }
    let workPieces = pieces.map(val => {
      val['addingPositions'] = [];
      val['originalName'] = String(val.name);
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
    this.piecesLoaded = true;
  }

  setCurrentPiece(piece: WorkingPiece) {
    if (piece && this.currentSelectedPiece && piece.uuid !== this.currentSelectedPiece.uuid) {
      if (!this.pieceSaved) {
        this.currentSelectedPiece.name = this.currentSelectedPiece.originalName;
      }
      this.pieceSaved = true;
      this.creatingPiece = false;
      this.currentSelectedPiece.addingPositions = [];
    }
    if ((this.workingPiece && piece && piece.uuid != this.workingPiece.uuid)) {
      this.renderingPieces = this.renderingPieces.filter(val => val.uuid != this.workingPiece.uuid);
      if (this.prevWorkingState != undefined) {
        this.currentSelectedPiece = this.prevWorkingState;
        this.renderingPieces.push(this.currentSelectedPiece);
      }
      this.prevWorkingState = undefined;
      this.workingPiece = undefined;
    }
    this.currentSelectedPiece = piece;
    this.urlPointingUUID = piece ? piece.uuid : "";
    if (this.location.path().startsWith("/piece") || this.location.path().startsWith("/piece/")) {
      if (piece) {
        this.location.replaceState("/piece/" + this.urlPointingUUID);
      }
    }
    this.renderingPieces.sort((a, b) => a.uuid < b.uuid ? -1 : 1);
    this.updateDragAndDropData();
    this.selectedSegmentType = this.currentSelectedPiece ? this.currentSelectedPiece.type : "SEGMENT";
  }

  addPiece() {
    if (this.creatingPiece) {
      return;
    }
    this.creatingPiece = true;
    this.prevWorkingState = undefined;
    let newPiece: WorkingPiece = {
      uuid: "piece:" + Date.now(),
      name: "New Piece",
      positions: [],
      type: "PIECE",
      originalName: "New Piece",
      addingPositions: [],
      deletePositions: []
    }
    this.selectedSegmentType = "PIECE";
    this.currentSelectedPiece = newPiece;
    this.renderingPieces.push(newPiece);
    this.workingPiece = newPiece;
    this.pieceSaved = false;
    this.dragAndDropData = [];
    this.setCurrentPiece(this.workingPiece);
  }


  onSavePiece() {
    if (this.currentSelectedPiece && (!this.currentSelectedPiece.name || this.currentSelectedPiece.name == "")) {
      this.respHandler.showError({
        url: "Error occured while saving ballet",
        status: 400,
        statusText: "No ballet name!",
        errorMessage: "You must enter a ballet name!"
      });
      return;
    }
    this.lastSelectedPieceName = this.currentSelectedPiece.name;
    this.updateDragAndDropData(true);
    this.pieceAPI.setPiece(this.currentSelectedPiece).then(async val => {
      if (val.successful) {
        this.currentSelectedPiece.addingPositions = [];
        this.pieceSaved = true;
        this.creatingPiece = false;
        let prevUUID = this.currentSelectedPiece.uuid;
        this.prevWorkingState = undefined;
        this.workingPiece = undefined;
        await this.pieceAPI.getAllPieces();
        let foundSame = this.renderingPieces.find(val => val.uuid == prevUUID);
        if (foundSame && this.location.path().startsWith("/piece")) {
          this.setCurrentPiece(foundSame);
        }
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
    this.dragAndDropData.push({
      index: nextInd, value: {
        name: "New Position",
        uuid: "position:" + Date.now(),
        notes: "",
        order: nextInd,
        size: 1
      }, type: "adding"
    });
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
    let position = this.dragAndDropData.find((val) => val.index == index);
    if (position)
      this.currentSelectedPiece.deletePositions.push(position.value);
    this.dragAndDropData = this.dragAndDropData.filter((val, ind) => val.index != index);
    this.pieceSaved = false;
    this.updateDragAndDropData();
  }

  onTitleInput(event) {
    this.pieceSaved = false;
    this.currentSelectedPiece.name = event.target.value;
  }

  segmentTypes = ["PIECE", "SEGMENT"];
  segmentPrettyNames = ["Piece", "Segment"]
  selectedSegmentType: "SEGMENT" | "PIECE";

  onSelectSegmentType(event: MatSelectChange) {
    this.selectedSegmentType = event.value;
    this.currentSelectedPiece.type = event.value;
  }

  deletePiece() {
    this.prevWorkingState = undefined;
    this.renderingPieces = this.renderingPieces.filter(val => val.uuid != this.currentSelectedPiece.uuid);
    if (!this.creatingPiece) {
      this.pieceAPI.deletePiece(this.currentSelectedPiece);
    }
    this.renderingPieces.length > 0 ? this.setCurrentPiece(this.renderingPieces[0]) : this.setCurrentPiece(undefined);
    this.pieceSaved = true;
    this.creatingPiece = false;
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
        found.value.name = val;
    }
    if (key == "New Piece Name") {
      this.currentSelectedPiece.name = val;
    }
  }

  updateDragAndDropData(writeThru?: boolean) {
    if (!this.currentSelectedPiece)
      return;
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
          value: { ...data.value, order: i }
        };
        newDDData.push(struct);
        this.currentSelectedPiece.positions.push(struct.value);
      } else {
        let struct: { type: "adding" | "added", index: number, value: Position } = {
          type: "adding",
          index: i,
          value: { ...data.value, order: i }
        };
        newDDData.push(struct);
        this.currentSelectedPiece.addingPositions.push(struct);
      }
    }
    this.dragAndDropData = newDDData;
    if (writeThru && writeThru) {
      this.currentSelectedPiece.positions = this.dragAndDropData.sort((a, b) => a.index - b.index).map(val => val.value);
      this.currentSelectedPiece.addingPositions = [];
    }
  }

  drop(event: CdkDragDrop<any>) {
    let largerInd = event.previousIndex > event.currentIndex ? event.previousIndex : event.currentIndex;
    let smallerInd = event.previousIndex <= event.currentIndex ? event.previousIndex : event.currentIndex;
    this.dragAndDropData[event.previousIndex].index = event.currentIndex;
    this.dragAndDropData[event.previousIndex].value.order = event.currentIndex;
    let isToLargerInd = largerInd == event.currentIndex;
    if (isToLargerInd) {
      for (let i = smallerInd + 1; i <= largerInd; i++) {
        this.dragAndDropData[i].index--;
        this.dragAndDropData[i].value.order--;
      }
    } else {
      for (let i = smallerInd; i <= largerInd - 1; i++) {
        this.dragAndDropData[i].index++;
        this.dragAndDropData[i].value.order++;
      }
    }
    transferArrayItem(this.dragAndDropData, this.dragAndDropData, event.previousIndex, event.currentIndex);
    this.pieceSaved = false;
  }
}
