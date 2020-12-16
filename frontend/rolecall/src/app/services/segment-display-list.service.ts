import {Injectable} from '@angular/core';
import {Piece, PieceType} from '../api/piece_api.service';
// import {WorkingPiece} from '../piece/piece_editor.component';
import {SuperBalletDisplayService} from './super-ballet-display.service';

// export type DisplaySegment = Piece & {
//   isOpen: boolean;
// };

export type DisplayItem = {
  name: string;
  pieceIndex: number;
  siblingId: number;
  type: PieceType;
  isOpen: boolean;
  uuid: string
};

@Injectable({providedIn: 'root'})
export class SegmentDisplayListService {
  public topLevelSegments: Piece[];
  public visibleItems: DisplayItem[];

  constructor(
    private superBalletDisplay: SuperBalletDisplayService,
  ) { }

  public buildDisplayList(allSegments: Piece[]): void {
    // Remove Super Ballet children
    this.topLevelSegments = allSegments.filter(segment => !segment.siblingId);
    this.topLevelSegments.sort((a, b) => a.name < b.name ? -1 : 1);
    for (let i = 0; i < this.topLevelSegments.length; i++) {
      const displayPiece = this.topLevelSegments[i];
      if (displayPiece.type === 'SUPER' &&
          this.superBalletDisplay.isOpen(displayPiece.uuid)) {
        displayPiece.isOpen = true;
        // If Super Ballet is open, add children
        displayPiece.positions.sort((a, b) => a.order < b.order ? -1 : 1);
        const children: Piece[] = [];
        for (const position of displayPiece.positions) {
          const uuid = String(position.siblingId);
          const child = allSegments.find(wp => wp.uuid === uuid);
          children.push(child);
        }
        this.topLevelSegments.splice(i + 1, 0, ...children);
      }
    }
    this.visibleItems = this.topLevelSegments.map(
        (displayPiece, displayPieceIndex) =>
            this.buildDisplayItem(displayPiece, displayPieceIndex));
  }

  private buildDisplayItem(
      displayPiece: Piece,
      displayPieceIndex: number): DisplayItem {
    const hasNoChildren = displayPiece.type === 'SEGMENT'
        ? false : displayPiece.positions.length === 0;
    const name = hasNoChildren ? '*' + displayPiece.name : displayPiece.name;
    console.log('buildDisplayItem for', name, 'index =', displayPieceIndex);
    return {
      name,
      pieceIndex: displayPieceIndex,
      siblingId: displayPiece.siblingId,
      type: displayPiece.type,
      isOpen: displayPiece.isOpen,
      uuid: displayPiece.uuid,
    } as DisplayItem;
  }
}
