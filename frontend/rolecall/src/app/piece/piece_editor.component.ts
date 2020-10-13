import {CdkDragDrop, transferArrayItem} from '@angular/cdk/drag-drop';
import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {ActivatedRoute} from '@angular/router';
import {COLORS} from 'src/constants';
import {Piece, PieceType, PieceApi, Position} from '../api/piece_api.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';
import {APITypes} from 'src/api_types';

type ValueName =
  'New Position' |
  'Existing Position' |
  'New Ballet' |
  'Existing Ballet';

type DraggablePosition = {
  index: number;
  pos: Position;
  valueName: ValueName;
  type: 'adding' | 'added' | 'editing';
  nameDisplay: string;
  sizeDisplay: string;
};

type WorkingPiece = Piece & {
  addingPositions: DraggablePosition[];
  originalName: string;
  isOpen: boolean;
};

type RenderingItem = {
  name: string;
  pieceIndex: number;
  siblingId: number;
  type: PieceType;
  isOpen: boolean;
  uuid: string
};

@Component({
  selector: 'app-piece-editor',
  templateUrl: './piece_editor.component.html',
  styleUrls: ['./piece_editor.component.scss']
})
export class PieceEditor implements OnInit {
  dragAndDropData: DraggablePosition[] = [];
  currentSelectedPiece: WorkingPiece;

  // All pieces or segments in the system ready to be edited.
  workingPieces: WorkingPiece[];
  // Displayed items (some children of Super Ballets may be hidden)
  displayedPieces: WorkingPiece[];
  // List of segments visible on the left side of the page.
  renderingItems: RenderingItem[];
  urlPointingUUID: string;

  sizeValueName = '# Dancers';

  prevWorkingState: WorkingPiece;
  workingPiece: WorkingPiece;
  pieceSaved = true;

  creatingPiece = false;
  piecesLoaded = false;

  offWhite: string = COLORS.offWhite;

  lastSelectedPieceName: string;

  currentTypeOffset = 0;

  segmentTypes = ['SEGMENT', 'PIECE', 'SUPER'];
  selectedSegmentType: PieceType;
  segmentPrettyNames = ['', 'Segment', 'Ballet', 'Super Ballet'];

  constructor(
      private route: ActivatedRoute,
      private pieceAPI: PieceApi,
      private location: Location,
      private respHandler: ResponseStatusHandlerService) { }

  ngOnInit(): void {
    const uuid = this.route.snapshot.params.uuid;
    if (uuid) {
      this.urlPointingUUID = uuid;
    }
    this.pieceAPI.pieceEmitter.subscribe(
        pieces => { this.onPieceLoad(pieces); });
    this.pieceAPI.getAllPieces();
  }

  private buildRenderingList() {
    // Remove Super Ballet children
    this.displayedPieces = this.workingPieces.filter(piece => !piece.siblingId);
    this.displayedPieces.sort((a, b) => a.name < b.name ? -1 : 1);
    for (let i = 0; i < this.displayedPieces.length; i++) {
      if (this.displayedPieces[i].isOpen) {
        // If Super Ballet is open, add children
        this.displayedPieces[i].positions.sort(
            (a, b) => a.order < b.order ? -1 : 1);
        const children: WorkingPiece[] = [];
        for (const position of this.displayedPieces[i].positions) {
          const uuid = String(position.siblingId);
          const child = this.workingPieces.find(wp => wp.uuid === uuid);
          children.push(child);
        }
        this.displayedPieces.splice(i + 1, 0, ...children);
      }
    }
    this.renderingItems = this.displayedPieces.map(
        (displayPiece, displayPieceIndex) =>
            this.buildRenderingItem(displayPiece, displayPieceIndex));
  }

  private buildRenderingItem(
      displayPiece: WorkingPiece,
      displayPieceIndex: number) {
    const hasNoChidren = displayPiece.type === 'SEGMENT'
        ? false : displayPiece.positions.length === 0;
    const name = hasNoChidren ? '*' + displayPiece.name : displayPiece.name;
    return {
      name,
      pieceIndex: displayPieceIndex,
      siblingId: displayPiece.siblingId,
      type: displayPiece.type,
      isOpen: displayPiece.isOpen,
      uuid: displayPiece.uuid,
    };
  }

  onPieceLoad(pieces: Piece[]) {
    if (pieces.length === 0) {
      this.workingPieces = [];
      this.piecesLoaded = true;
      return;
    }
    if (this.workingPieces) {
      const prevPieceUUIDS = new Set(this.workingPieces.map(
          piece => piece.uuid));
      const newPieces: Piece[] = [];
      for (const piece of pieces) {
        if (!prevPieceUUIDS.has(piece.uuid)) {
          newPieces.push(piece);
        }
      }
      if (newPieces.length > 0) {
        for (const newPiece of newPieces) {
          if (newPiece.name === this.lastSelectedPieceName) {
            this.urlPointingUUID = newPiece.uuid;
          }
        }
      }
    }

    const workPieces = pieces.map(piece => ({
      ...piece,
      addingPositions: [],
      originalName: String(piece.name),
      isOpen: false,
    }));
    this.workingPieces = workPieces;

    if (!this.urlPointingUUID) {
      this.setCurrentPiece(workPieces[0]);
    } else {
      const foundPiece = workPieces.find((
          workPiece) => workPiece.uuid === this.urlPointingUUID);
      if (!foundPiece) {
        this.setCurrentPiece(workPieces[0]);
      } else {
        this.setCurrentPiece(foundPiece);
      }
    }
    this.piecesLoaded = true;
    this.buildRenderingList();
  }

  setCurrentPieceFromIndex(pieceIndex: number) {
    this.setCurrentPiece(this.displayedPieces[pieceIndex]);
  }

  setCurrentPiece(piece: WorkingPiece) {
    if (piece && this.currentSelectedPiece &&
        piece.uuid !== this.currentSelectedPiece.uuid) {
      if (!this.pieceSaved) {
        this.currentSelectedPiece.name = this.currentSelectedPiece.originalName;
      }
      this.pieceSaved = true;
      this.creatingPiece = false;
      this.currentSelectedPiece.addingPositions = [];
    }
    if ((this.workingPiece && piece && piece.uuid !== this.workingPiece.uuid)) {
      this.workingPieces = this.workingPieces.filter(
          renderPiece => renderPiece.uuid !== this.workingPiece.uuid);
      if (this.prevWorkingState !== undefined) {
        this.currentSelectedPiece = this.prevWorkingState;
        this.workingPieces.push(this.currentSelectedPiece);
      }
      this.prevWorkingState = undefined;
      this.workingPiece = undefined;
    }
    this.currentSelectedPiece = piece;
    this.urlPointingUUID = piece ? piece.uuid : '';
    this.currentTypeOffset = piece ? this.getCurrentTypeCode(piece.type) : 0;
    if (this.location.path().startsWith('/segment') ||
        this.location.path().startsWith('/piece/')) {
      if (piece) {
        this.location.replaceState('/segment/' + this.urlPointingUUID);
      }
    }
    this.workingPieces.sort((a, b) => a.name < b.name ? -1 : 1);
    this.updateDragAndDropData();
    this.selectedSegmentType = this.currentSelectedPiece
        ? this.currentSelectedPiece.type : 'SEGMENT';
  }

  private calcNameDisplay({createPosition, name}: {
    createPosition: boolean,
    name: string,
  }) {
    return (createPosition ? '' : 'Ballet ') + name;
  }

  private calcSizeDisplay({createPosition, dancerCount}: {
    createPosition: boolean,
    dancerCount: number,
  }) {
    return (createPosition ? `# Dancers = ${dancerCount}` : '');
  }

  addPiece(pieceTpCd: number) {
    if (this.creatingPiece) {
      return;
    }
    let name = 'TEST';
    let type: PieceType = 'PIECE';
    let originalName = 'TEST';
    this.currentTypeOffset = pieceTpCd;
    switch (pieceTpCd) {
    case 1:
      name = 'New Break';
      type = 'SEGMENT';
      originalName = 'New Break';
      break;
    case 2:
      name = 'New Ballet';
      type = 'PIECE';
      originalName = 'New Ballet';
      break;
    case 3:
      name = 'New Super Ballet';
      type = 'SUPER';
      originalName = 'New Super Ballet';
      break;
    }
    this.creatingPiece = true;
    this.prevWorkingState = undefined;
    const newPiece: WorkingPiece = {
      uuid: 'segment:' + Date.now(),

      // A Super Ballet should initially show its children
      isOpen: type === 'SUPER' ? true : false,
      name,
      siblingId: null,
      positions: [],
      type,
      originalName,
      addingPositions: [],
      deletePositions: [],
    };
    this.selectedSegmentType = type;
    this.currentSelectedPiece = newPiece;
    this.workingPieces.push(newPiece);
    this.workingPiece = newPiece;
    this.pieceSaved = false;
    this.dragAndDropData = [];
    this.setCurrentPiece(this.workingPiece);
    this.buildRenderingList();
  }

  onSavePiece() {
    if (this.currentSelectedPiece && (!this.currentSelectedPiece.name ||
        this.currentSelectedPiece.name === '')) {
      this.respHandler.showError({
        url: 'Error occured while saving ballet',
        status: 400,
        statusText: 'No ballet name!',
        errorMessage: 'You must enter a ballet name!'
      });
      return;
    }
    this.lastSelectedPieceName = this.currentSelectedPiece.name;
    this.updateDragAndDropData(true);
    this.pieceAPI.setPiece(this.currentSelectedPiece).then(async result => {
      if (result.successful) {
        this.currentSelectedPiece.addingPositions = [];
        this.pieceSaved = true;
        this.creatingPiece = false;
        const prevUUID = this.currentSelectedPiece.uuid;
        this.prevWorkingState = undefined;
        this.workingPiece = undefined;
        await this.pieceAPI.getAllPieces();
        const foundSame = this.workingPieces.find(
            piece => piece.uuid === prevUUID);
        if (foundSame && this.location.path().startsWith('/segment')) {
          this.setCurrentPiece(foundSame);
        }
      }
    });
  }

  async deletePiece() {
    let successIndicator: APITypes.SuccessIndicator = {successful: false};
    if (!this.creatingPiece) {
      successIndicator =
          await this.pieceAPI.deletePiece(this.currentSelectedPiece);
    }
    if (successIndicator.successful === true) {
      this.workingPieces = this.workingPieces.filter(
          piece => piece.uuid !== this.currentSelectedPiece.uuid);
      this.buildRenderingList();
      this.workingPieces.length > 0
          ? this.setCurrentPiece(this.workingPieces[0])
          : this.setCurrentPiece(undefined);
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
    const createPosition = this.currentSelectedPiece.type === 'PIECE';
    this.creatingPiece = true;
    this.pieceSaved = false;
    const nextIndex = (this.currentSelectedPiece.positions.length +
        this.currentSelectedPiece.addingPositions.length);
    const name = createPosition ? 'New Position' : 'New Ballet';
    this.dragAndDropData.push({
      index: nextIndex,
      pos: {
        name,
        uuid: 'position:' + Date.now(),
        notes: '',
        order: nextIndex,
        siblingId: null,
        size: 1
      },
      valueName: createPosition ? 'New Position' : 'New Ballet',
      type: 'adding',
      nameDisplay: this.calcNameDisplay({createPosition, name}),
      sizeDisplay: this.calcSizeDisplay({createPosition, dancerCount: 1}),
    });
    this.updateDragAndDropData();
  }

  deleteAddingPosition(index: number) {
    this.dragAndDropData = this.dragAndDropData.filter(
        position => position.index !== index);
    this.pieceSaved = false;
    this.updateDragAndDropData();
  }

  deletePosition(index: number) {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    const foundPos = this.dragAndDropData.find(
        position => position.index === index);
    if (foundPos) {
      this.currentSelectedPiece.deletePositions.push(foundPos.pos);
    }
    this.dragAndDropData = this.dragAndDropData.filter(
        position => position.index !== index);
    this.pieceSaved = false;
    this.updateDragAndDropData();
  }

  editPosition(index: number) {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    const foundPos = this.dragAndDropData.find(
        position => position.index === index);
    if (foundPos) {
      foundPos.type = 'editing';
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

  onInputChange({change: [valueName, value], data}: {
    change: [string, any],
    data?: any,
  }) {
    if (!this.workingPiece) {
      this.prevWorkingState = this.currentSelectedPiece;
      this.workingPiece = this.currentSelectedPiece;
      this.setCurrentPiece(this.workingPiece);
    }
    if (this.workingPiece) {
      this.setWorkingPropertyByKey({key: valueName, name: value, data});
    }
  }

  setWorkingPropertyByKey({key, name, data}: {
    key: string,
    name: string,
    data?: any,
  }) {
      if (key === 'New Position' || key === 'New Ballet') {
      const found = this.currentSelectedPiece.addingPositions.find(
          draggablePosition => draggablePosition.index === data.index);
      if (found) {
        found.pos.name = name;
      }
    }
    else if (key === 'Existing Position' || key === 'Existing Ballet') {
      const found = this.currentSelectedPiece.positions.find(
          position => position.order === data.index);
      if (found) {
        found.name = name;
      }
    } else if (key === '# Dancers') {
      const found = this.currentSelectedPiece.positions.find(
          position => position.order === data.index);
      if (found) {
        found.size = Number(name);
      }
      if (!found) {
        const foundNew = this.currentSelectedPiece.addingPositions.find(
          draggablePosition => draggablePosition.index === data.index);
        if (foundNew) {
          foundNew.pos.size = Number(name);
        }
      }
    } else if (key === 'New Ballet Name') {
        this.currentSelectedPiece.name = name;
    }
  }

  updateDragAndDropData(writeThru?: boolean) {
    if (!this.currentSelectedPiece) {
      return;
    }
    const createPosition = this.currentSelectedPiece.type === 'PIECE';
    if (this.pieceSaved) {
      // after deletePiece()
      this.dragAndDropData = this.currentSelectedPiece.positions
          .map((position, positionIndex) => {
        return {
          index: positionIndex,
          pos: position,
          valueName: createPosition ? 'Existing Position' : 'Existing Ballet',
          type: 'added',
          nameDisplay: this.calcNameDisplay(
              {createPosition, name: position.name}),
          sizeDisplay: this.calcSizeDisplay(
              {createPosition, dancerCount: position.size}),
        };
      });
      return;
    }
    const newDDData = [];
    this.currentSelectedPiece.positions = [];
    this.currentSelectedPiece.addingPositions = [];
    for (let i = 0; i < this.dragAndDropData.length; i++) {
      const data = this.dragAndDropData[i];
      if (data.type === 'added' || data.type === 'editing') {
        const struct: DraggablePosition = {
          type: 'added',
          nameDisplay: this.calcNameDisplay(
              {createPosition, name: data.pos.name}),
          sizeDisplay: this.calcSizeDisplay(
              {createPosition, dancerCount: data.pos.size}),
          valueName: createPosition ? 'Existing Position' : 'Existing Ballet',
          index: i,
          pos: {...data.pos, order: i}
        };
        newDDData.push(struct);
        this.currentSelectedPiece.positions.push(struct.pos);
      } else {
        const struct: DraggablePosition = {
          type: 'adding',
          nameDisplay: this.calcNameDisplay(
              {createPosition, name: data.pos.name}),
          sizeDisplay: this.calcSizeDisplay(
              {createPosition, dancerCount: data.pos.size}),
          valueName: createPosition ? 'New Position' : 'New Ballet',
          index: i,
          pos: {...data.pos, order: i}
        };
        newDDData.push(struct);
        this.currentSelectedPiece.addingPositions.push(struct);
      }
    }
    this.dragAndDropData = newDDData;
    if (writeThru && writeThru) {
      this.currentSelectedPiece.positions = this.dragAndDropData.sort(
          (a, b) => a.index - b.index).map(val => val.pos);
      this.currentSelectedPiece.addingPositions = [];
    }
  }

  drop(event: CdkDragDrop<any>) {
    const largerInd = event.previousIndex > event.currentIndex
        ? event.previousIndex : event.currentIndex;
    const smallerInd = event.previousIndex <= event.currentIndex
        ? event.previousIndex : event.currentIndex;
    this.dragAndDropData[event.previousIndex].index = event.currentIndex;
    this.dragAndDropData[event.previousIndex].pos.order = event.currentIndex;
    const isToLargerInd = largerInd === event.currentIndex;
    if (isToLargerInd) {
      for (let i = smallerInd + 1; i <= largerInd; i++) {
        this.dragAndDropData[i].index--;
        this.dragAndDropData[i].pos.order--;
      }
    } else {
      for (let i = smallerInd; i <= largerInd - 1; i++) {
        this.dragAndDropData[i].index++;
        this.dragAndDropData[i].pos.order++;
      }
    }
    transferArrayItem(this.dragAndDropData, this.dragAndDropData,
        event.previousIndex, event.currentIndex);
    this.pieceSaved = false;
  }

  getCurrentTypeCode(type: PieceType): number {
    let code = 0;
    if (type === 'PIECE') {
      code = 2;
    } else if (type === 'SUPER') {
      code = 3;
    } else if (type === 'SEGMENT') {
      code = 1;
    }
    return code;
  }

  toggleOpen(index: number) {
    const superBallet = this.displayedPieces[index];
    if (superBallet.type === 'SUPER') {
      superBallet.isOpen = !superBallet.isOpen;
    }
    this.buildRenderingList();
  }
}
