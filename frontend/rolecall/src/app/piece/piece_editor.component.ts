import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { COLORS } from 'src/constants';
import { isNullOrUndefined } from 'util';
import { Piece, PieceType, PieceApi, Position } from '../api/piece_api.service';
import { ResponseStatusHandlerService } from '../services/response-status-handler.service';
import { APITypes } from 'src/api_types';


type DraggablePosition = {
  index: number,
  value: Position,
  valueName: "New Position" | "Existing Position" | "New Ballet" | "Existing Ballet",
  type: "adding" | "added" | "editing",
  nameDisplay: string,
  sizeDisplay: string,
}

type WorkingPiece = Piece & {
  addingPositions: DraggablePosition[],
  originalName: string,
}


@Component({
  selector: 'app-piece-editor',
  templateUrl: './piece_editor.component.html',
  styleUrls: ['./piece_editor.component.scss']
})
export class PieceEditor implements OnInit {

  dragAndDropData: DraggablePosition[] = [];
  currentSelectedPiece: WorkingPiece;
  renderingPieces: WorkingPiece[];
  urlPointingUUID: string;

  sizeValueName = "# Dancers";

  prevWorkingState: WorkingPiece;
  workingPiece: WorkingPiece;
  pieceSaved: boolean = true;

  creatingPiece: boolean = false;
  piecesLoaded: boolean = false;

  offWhite: string = COLORS.offWhite;

  lastSelectedPieceName: string;

  currentType = 0;

  segmentTypes = ["SEGMENT", "PIECE", "REVELATION"];
  selectedSegmentType: PieceType;
  segmentPrettyNames = ["", "Segment", "Ballet", "Uber Ballet"]


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
    let workPieces = pieces.map((val: WorkingPiece) => {
      val.addingPositions = [];
      val.originalName = String(val.name);
      return val;
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
    this.currentType = this.getCurrentTypeCode(piece.type);
    if (this.location.path().startsWith("/segment") || this.location.path().startsWith("/piece/")) {
      if (piece) {
        this.location.replaceState("/segment/" + this.urlPointingUUID);
      }
    }
    this.renderingPieces.sort((a, b) => a.name < b.name ? -1 : 1);
    this.updateDragAndDropData();
    this.selectedSegmentType = this.currentSelectedPiece ? this.currentSelectedPiece.type : "SEGMENT";
  }

  calcNameDisplay(createPosition: boolean, name: string) {
    return (createPosition ? "" : "Ballet ") + name;
  }

  calcSizeDisplay(createPosition: boolean, dancerCount: number) {
    return (createPosition ? `# Dancers = ${dancerCount}` : "");
  }

  addPiece(pieceTpCd: number) {
    if (this.creatingPiece) {
      return;
    }
    let name: string = "TEST";
    let type: PieceType = "PIECE";
    let originalName: string = "TEST";
    this.currentType = pieceTpCd;
    switch (pieceTpCd) {
    case 1:
      name = "New Break";
      type = "SEGMENT";
      originalName = "New Break";
      break;
    case 2:
      name = "New Ballet";
      type = "PIECE";
      originalName = "New Ballet";
      break;
    case 3:
      name = "New Uber Ballet";
      type = "REVELATION";
      originalName = "New Uber Ballet";
      break;
    }
    this.creatingPiece = true;
    this.prevWorkingState = undefined;
    let newPiece: WorkingPiece = {
      uuid: "segment:" + Date.now(),
      name: name,
      siblingId: null, 
      positions: [],
      type: type,
      originalName: originalName,
      addingPositions: [],
      deletePositions: [],
    }
    this.selectedSegmentType = type;
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
        if (foundSame && this.location.path().startsWith("/segment")) {
          this.setCurrentPiece(foundSame);
        }
      }
    });
  }

  async deletePiece() {
    let successIndicator: APITypes.SuccessIndicator = {successful: false};
    if (!this.creatingPiece) {
      successIndicator = await this.pieceAPI.deletePiece(this.currentSelectedPiece);
    }
    if (successIndicator.successful === true) {
      this.renderingPieces = this.renderingPieces.filter(val => val.uuid != this.currentSelectedPiece.uuid);
      this.renderingPieces.length > 0 ? this.setCurrentPiece(this.renderingPieces[0]) : this.setCurrentPiece(undefined);
    }
    this.prevWorkingState = undefined;
    this.pieceSaved = true;
    this.creatingPiece = false;
  }

  addPosition() {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    const createPosition = this.currentSelectedPiece.type === "PIECE";
    this.creatingPiece = true;
    this.pieceSaved = false;
    const nextInd = (this.currentSelectedPiece.positions.length + this.currentSelectedPiece.addingPositions.length);
    const name = createPosition ? "New Position" : "New Ballet";
    this.dragAndDropData.push({
      index: nextInd, value: {
        name: name,
        uuid: "position:" + Date.now(),
        notes: "",
        order: nextInd,
        siblingId: null, 
        size: 1
      },
      valueName: createPosition ? "New Position" : "New Ballet",
      type: "adding",
      nameDisplay: this.calcNameDisplay(createPosition, name),
      sizeDisplay: this.calcSizeDisplay(createPosition, 1),
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
    if (position) {
      this.currentSelectedPiece.deletePositions.push(position.value);
    }
    this.dragAndDropData = this.dragAndDropData.filter((val, ind) => val.index != index);
    this.pieceSaved = false;
    this.updateDragAndDropData();
  }
  
  editPosition(index: number) {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    let position = this.dragAndDropData.find((val) => val.index == index);
    if (position) {
      position.type = "editing";
    }
    this.pieceSaved = false;
  }

  onTitleInput(event) {
    this.pieceSaved = false;
    this.currentSelectedPiece.name = event.target.value;
  }

  onSelectSegmentType(event: MatSelectChange) {
    this.selectedSegmentType = event.value;
    this.currentSelectedPiece.type = event.value;
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

  setWorkingPropertyByKey(key: string, name: string, data?: any) {
    if (key === "New Position" || key === "New Ballet") {
      const found = this.currentSelectedPiece.addingPositions.find(val => val.index == data.index);
      if (found) {
        found.value.name = name;
      }
    }
    else if (key === "Existing Position" || key === "Existing Ballet") {
      const found = this.currentSelectedPiece.positions.find(val => val.order == data.index);
      if (found) {
        found.name = name;
      }
    } else if (key == "# Dancers") {
      const found = this.currentSelectedPiece.positions.find(val => val.order == data.index);
      if (found) {
        found.size = Number(name);
      }
      if(!found) {
        const foundNew = this.currentSelectedPiece.addingPositions.find(val => val.index == data.index);
        if (foundNew) {
          foundNew.value.size = Number(name);
        }
      }
    } else if (key == "New Ballet Name") {
        this.currentSelectedPiece.name = name;
    }
  }

  updateDragAndDropData(writeThru?: boolean) {
    const createPosition = this.currentSelectedPiece.type === "PIECE";
    if (!this.currentSelectedPiece) {
      return;
    }
    if (this.pieceSaved) {
      // after deletePiece()
      this.dragAndDropData = this.currentSelectedPiece.positions.map((val, ind) => {
        return {
          index: ind,
          value: val,
          valueName: createPosition ? "Existing Position" : "Existing Ballet",
          type: "added",
          nameDisplay: this.calcNameDisplay(createPosition, val.name),
          sizeDisplay: this.calcSizeDisplay(createPosition, val.size),
        };
      });
      return;
    }
    let newDDData = [];
    this.currentSelectedPiece.positions = [];
    this.currentSelectedPiece.addingPositions = [];
    for (let i = 0; i < this.dragAndDropData.length; i++) {
      const data = this.dragAndDropData[i];
      if (data.type === "added" || data.type === "editing") {
        let struct: DraggablePosition = {
          type: "added",
          nameDisplay: this.calcNameDisplay(createPosition, data.value.name),
          sizeDisplay: this.calcSizeDisplay(createPosition, data.value.size),
          valueName: createPosition ? "Existing Position" : "Existing Ballet",
          index: i,
          value: { ...data.value, order: i }
        };
        newDDData.push(struct);
        this.currentSelectedPiece.positions.push(struct.value);
      } else {
        const struct: DraggablePosition = {
          type: "adding",
          nameDisplay: this.calcNameDisplay(createPosition, data.value.name),
          sizeDisplay: this.calcSizeDisplay(createPosition, data.value.size),
          valueName: createPosition ? "New Position" : "New Ballet",
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

  getCurrentTypeCode(type: PieceType): number {
    let code = 0;
    if (type === "PIECE") {
      code = 2;
    } else if (type === "REVELATION") {
      code = 3;
    } else if (type === "SEGMENT") {
      code = 1;
    }
    return code;
  }
}
