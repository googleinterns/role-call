import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as APITypes from 'src/api_types';
import {CAST_COUNT} from 'src/constants';

import {Cast, CastApi} from '../api/cast_api.service';
import {Piece, PieceApi} from '../api/piece_api.service';
import {CastDragAndDrop} from './cast-drag-and-drop.component';
import {SuperBalletDisplayService} from '../services/super-ballet-display.service';
import {SegmentDisplayListService} from '../services/segment-display-list.service';


@Component({
  selector: 'app-cast-editor-v2',
  templateUrl: './cast-editor-v2.component.html',
  styleUrls: ['./cast-editor-v2.component.scss']
})
export class CastEditorV2 implements OnInit {

  selectedCast: Cast;
  selectedPiece: Piece;
  urlUUID: APITypes.CastUUID;
  allCasts: Cast[] = [];
  selectedPieceCasts: Cast[] = [];
  expandedCode: number = 0;

  lastSelectedCastIndex: number;
  lastSelectedCast: Cast;
  dataLoaded = false;
  piecesLoaded = false;
  castsLoaded = false;
  @ViewChild('castDragAndDrop') dragAndDrop: CastDragAndDrop;

  private allPieces: Piece[] = [];
 
  constructor(
      private castAPI: CastApi,
      private pieceAPI: PieceApi,
      private route: ActivatedRoute,
      private location: Location,
      private superBalletDisplay: SuperBalletDisplayService,
      public leftList: SegmentDisplayListService,
  ) { }

  ngOnInit() {
    const uuid = this.route.snapshot.params.uuid;
    if (uuid) {
      this.urlUUID = uuid;
    }
    this.castAPI.castEmitter.subscribe(cast => {
      this.onCastLoad(cast);
    });
    this.castAPI.getAllCasts();
    this.pieceAPI.pieceEmitter.subscribe(piece => {
      this.onPieceLoad(piece);
    });
    this.pieceAPI.getAllPieces();
  }

  private checkDataLoaded(): boolean {
    this.dataLoaded = this.piecesLoaded && this.castsLoaded;
    return this.dataLoaded;
  }

  private updateFilteredCasts() {
    if (this.selectedPiece) {
      this.selectedPieceCasts = this.allCasts.filter(
          cast => cast.segment === this.selectedPiece.uuid);
      this.selectedPieceCasts.sort((a, b) => a.name < b.name ? -1 : 1);
    }
  }

  // Select from screen
  selectSegment(pieceIndex: number) {
    // add extra screen logic here
    this.selectPiece(pieceIndex);
  }

  selectPiece(pieceIndex: number) {
    this.setPiece(this.leftList.topLevelSegments[pieceIndex]);
  }

  private setPiece(piece: Piece) {
    if (this.selectedPiece && piece.uuid === this.selectedPiece.uuid) {
      return;
    }
    let autoSelectFirst = false;
    this.selectedPiece = piece;
    this.updateFilteredCasts();
    if (this.selectedPiece) {
      autoSelectFirst = this.selectedPieceCasts.length > 0;
    }
    if (autoSelectFirst) {
      this.setCurrentCast({cast: this.selectedPieceCasts[0]});
    }
  }

  private checkForUrlCompliance() {
    if (this.selectedPiece) {
      this.updateFilteredCasts();
    }
    if (this.urlUUID) {
      if (!this.selectedCast) {
        return;
      }
      const foundPiece = this.allPieces.find(
          piece => piece.uuid === this.selectedCast.segment);
      if (foundPiece) {
        this.setPiece(foundPiece);
      }
    }
    if (this.selectedPiece && !this.selectedPieceCasts.find(
        cast => cast.uuid === this.urlUUID)) {
      if (this.selectedPieceCasts.length > 0) {
        this.setCurrentCast({cast: this.selectedPieceCasts[0]});
      }
    }
  }

  private starTest = (segment: Piece): boolean => {
    if (segment.type !== 'BALLET') {
      return false;
    }
    const existingCasts = this.allCasts.filter(
      cast => cast.segment === segment.uuid);
    return existingCasts.length === 0;
  }

  private buildLeftList() {
    this.leftList.buildDisplayList(this.allPieces, this.starTest);
  }

  private onPieceLoad(pieces: Piece[]) {
    this.allPieces = pieces.filter(piece => piece.type !== 'SEGMENT');
    this.buildLeftList();
    if (!this.selectedPiece && this.allPieces.length > 0) {
      this.selectPiece(0);
    }
    this.checkForUrlCompliance();
    this.piecesLoaded = true;
    this.checkDataLoaded();
  }

  private onCastLoad(casts: Cast[]) {
    if (this.castAPI.hasCast(this.urlUUID)) {
      this.dragAndDrop.selectCast({uuid: this.urlUUID});
      this.setCastURL();
    }
    // The first load, the casts may not have been loaded,
    // causing all ballets to get stars. This statement prevents all stars.
    this.buildLeftList();
    this.allCasts = casts;
    this.updateFilteredCasts();
    if (casts.length === 0) {
      this.selectedCast = undefined;
      this.castsLoaded = true;
      this.checkDataLoaded();
      return;
    }
    if (!this.dragAndDrop.castSelected) {
      if (this.lastSelectedCast) {
        const foundCast = casts.find(
            c => c.name === this.lastSelectedCast.name);
        if (foundCast) {
          this.lastSelectedCast = foundCast;
          this.selectedCast = foundCast;
        } else {
          if (this.selectedPieceCasts.length > 0) {
            this.selectedCast = this.selectedPieceCasts[
                this.lastSelectedCastIndex
                    ? this.lastSelectedCastIndex - 1
                    : 0];
          } else {
            this.selectedCast = casts[0];
          }
        }
      } else {
        if (this.selectedPieceCasts.length > 0) {
          this.selectedCast = this.selectedPieceCasts[
              this.lastSelectedCastIndex ? this.lastSelectedCastIndex - 1 : 0];
        } else {
          this.selectedCast = casts[0];
        }
      }
      this.setCurrentCast({cast: this.selectedCast});
    } else {
      this.urlUUID = this.dragAndDrop.selectedCastUUID;
      this.setCurrentCast({cast: this.castAPI.castFromUUID(this.urlUUID)});
    }
    this.checkForUrlCompliance();
    this.castsLoaded = true;
    this.checkDataLoaded();
  }

  private setCastURL() {
    if (this.location.path().startsWith('/cast') ||
        this.location.path().startsWith('/cast/')) {
      this.location.replaceState('/cast/' + this.urlUUID);
    }
  }

  onEditCast(cast: Cast) {
    this.lastSelectedCast = cast;
  }

  setCurrentCast({cast, index}: {
    cast: Cast | undefined,
    index?: number,
  }) {
    if (index === undefined && cast) {
      index = this.selectedPieceCasts.findIndex(
          findCast => cast.uuid === findCast.uuid);
    }
    if (index >= 0) {
      this.lastSelectedCastIndex = index;
    } else {
      this.lastSelectedCastIndex = undefined;
    }
    this.lastSelectedCast = cast ? cast : this.lastSelectedCast;
    this.selectedCast = cast;
    this.dragAndDrop.selectCast({uuid: cast ? cast.uuid : undefined});
    this.urlUUID = cast ? cast.uuid : '';
    this.setCastURL();
  }

  async addCast() {
    const newCast: Cast = {
      uuid: 'cast:' + Date.now(),
      name: 'New Cast',
      segment: this.selectedPiece.uuid,
      castCount: CAST_COUNT,
      filled_positions: this.selectedPiece.positions.map(pos => {
        return {
          position_uuid: pos.uuid,
          groups: [{
            group_index: 0,
            members: []
          }],
        };
      })
    };
    this.allCasts.push(newCast);
    this.selectedPieceCasts.push(newCast);
    await this.castAPI.setCast(newCast, true);
    this.setCurrentCast({cast: newCast});
    await this.castAPI.getAllCasts();
  }

  toggleExpanded() {
    this.expandedCode += (this.expandedCode == 2) ? -2 : 1;
  }

  toggleOpen(index: number) {
    const superBallet = this.leftList.topLevelSegments[index];
    if (superBallet.type === 'SUPER') {
      superBallet.isOpen = !superBallet.isOpen;
      this.superBalletDisplay.setOpenState(
          superBallet.uuid, superBallet.isOpen);
    }
    this.buildLeftList();
  }
}
