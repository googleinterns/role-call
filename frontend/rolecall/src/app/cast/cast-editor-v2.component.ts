import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { Cast, CastApi } from '../api/cast_api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
import { CastDragAndDrop } from './cast-drag-and-drop.component';
import { HelpModalService } from '../app/help/help_modal.service';

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
  filteredCasts: Cast[] = [];
  allPieces: Piece[] = [];
  lastSelectedCastIndex: number;
  lastSelectedCast: Cast;
  @ViewChild('castDragAndDrop') dragAndDrop: CastDragAndDrop;

  constructor(private castAPI: CastApi, private pieceAPI: PieceApi, 
    private route: ActivatedRoute, private location: Location,
    private dialogService: HelpModalService) { }

  //Help Modal Text
  openDialog(): void {
    const options = {
      title: 'Casts Creator Page',
      sections: [`Viewing Casts`, `Creating a new Cast`, `Editing a Cast`, `Saving/Deleting a Cast`],
      messages: [`First, click on the Piece Selector field to open up the piece dropdown menu and select which 
      ballet you created the cast for. Click on the name of the premade cast on the left panel to open the cast editor page.`,
      `Make sure to have the ballet which you want to create the cast for selected up at the top left. When you've done that,
      click the plus button on the bottom left to open a new cast editor page.`,
      `Drag and drop dancers from the dancer table at the bottom of the page into each position. Once a dancer has been placed in
      the first cast, the second cast column will appear for that position and so on.`,
      `On the right of the dancer table are a trash icon and a save icon. To delete a cast and remove it from the left panel, hit 
      the delete button. Likewise, to save your changes to a cast or add a new cast to the left panel, hit the save button.`,
    ],
      confirmText: 'Exit',
    };
    this.dialogService.open(options);
  }
  
  ngOnInit() {
    let uuid = this.route.snapshot.params.uuid;
    if (!isNullOrUndefined(uuid)) {
      this.urlUUID = uuid;
    }
    this.castAPI.castEmitter.subscribe((val) => {
      this.onCastLoad(val);
    });
    this.castAPI.getAllCasts();
    this.pieceAPI.pieceEmitter.subscribe((val) => {
      this.onPieceLoad(val);
    });
    this.pieceAPI.getAllPieces();
  }

  updateFilteredCasts() {
    if (this.selectedPiece) {
      this.filteredCasts = this.allCasts.filter((val) => val.segment == this.selectedPiece.uuid);
    }
  }

  onSelectPiece(piece: Piece) {
    this.setPiece(piece);
  }

  setPiece(piece: Piece) {
    if (this.selectedPiece && piece.uuid == this.selectedPiece.uuid) {
      return;
    }
    let autoSelectFirst = false;
    if (this.selectedPiece && this.selectedPiece.uuid != piece.uuid) {
      autoSelectFirst = true;
    }
    this.selectedPiece = piece;
    this.updateFilteredCasts();
    if (autoSelectFirst) {
      this.setCurrentCast(this.filteredCasts[0]);
    }
  }

  checkForUrlCompliance() {
    if (this.selectedPiece) {
      this.updateFilteredCasts();
    }
    if (this.urlUUID) {
      if (!this.selectedCast) {
        return;
      }
      let foundPiece = this.allPieces.find(val => val.uuid == this.selectedCast.segment);
      if (foundPiece) {
        this.setPiece(foundPiece);
      }
    }
    if (this.selectedPiece && !this.filteredCasts.find(val => val.uuid == this.urlUUID)) {
      if (this.filteredCasts.length > 0) {
        this.setCurrentCast(this.filteredCasts[0]);
      }
    }
  }

  onPieceLoad(pieces: Piece[]) {
    this.allPieces = pieces.filter(val => val.type == "PIECE");
    if (!this.selectedPiece && this.allPieces.length > 0) {
      this.onSelectPiece(this.allPieces[0]);
    }
    this.checkForUrlCompliance();
  }

  onCastLoad(casts: Cast[]) {
    if (this.castAPI.hasCast(this.urlUUID)) {
      this.dragAndDrop.selectCast(this.urlUUID);
      this.setCastURL();
    }
    this.allCasts = casts;
    this.updateFilteredCasts();
    if (casts.length == 0) {
      this.selectedCast = undefined;
      return;
    }
    if (!this.dragAndDrop.castSelected) {
      if (this.lastSelectedCast) {
        let foundCast = casts.find(c => c.name == this.lastSelectedCast.name);
        if (foundCast) {
          this.lastSelectedCast = foundCast;
          this.selectedCast = foundCast;
        } else {
          if (this.filteredCasts.length > 0) {
            this.selectedCast = this.filteredCasts[this.lastSelectedCastIndex ? this.lastSelectedCastIndex - 1 : 0];
          } else {
            this.selectedCast = casts[0];
          }
        }
      } else {
        if (this.filteredCasts.length > 0) {
          this.selectedCast = this.filteredCasts[this.lastSelectedCastIndex ? this.lastSelectedCastIndex - 1 : 0];
        } else {
          this.selectedCast = casts[0];
        }
      }
      this.setCurrentCast(this.selectedCast);
    } else {
      this.urlUUID = this.dragAndDrop.selectedCastUUID;
      this.setCurrentCast(this.castAPI.castFromUUID(this.urlUUID));
    }
    this.checkForUrlCompliance();
  }

  setCastURL() {
    if (this.location.path().startsWith("/cast") || this.location.path().startsWith("/cast/")) {
      this.location.replaceState("/cast/" + this.urlUUID);
    }
  }

  onEditCast(cast: Cast) {
    this.lastSelectedCast = cast;
  }

  setCurrentCast(cast: Cast, index?: number) {
    if (isNullOrUndefined(index) && cast) {
      index = this.filteredCasts.findIndex((val) => val.uuid == cast.uuid);
    }
    if (isNullOrUndefined(index) || index == -1) {
      this.lastSelectedCastIndex = undefined;
    } else {
      this.lastSelectedCastIndex = index;
    }
    this.lastSelectedCast = cast ? cast : this.lastSelectedCast;
    this.selectedCast = cast;
    this.dragAndDrop.selectCast(cast ? cast.uuid : undefined);
    this.urlUUID = cast ? cast.uuid : "";
    this.setCastURL();
  }

  async addCast() {
    let newCast: Cast = {
      uuid: "cast:" + Date.now(),
      name: "New Cast",
      segment: this.selectedPiece.uuid,
      filled_positions: this.selectedPiece.positions.map(val => {
        return {
          position_uuid: val.uuid,
          groups: [
            {
              group_index: 0,
              members: []
            }
          ]
        }
      })
    };
    this.castAPI.setCast(newCast, true);
    await this.castAPI.getAllCasts();
    this.setCurrentCast(newCast);
  }
}
