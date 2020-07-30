import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { Cast, CastApi } from '../api/cast_api.service';
import { CastDragAndDrop } from './cast-drag-and-drop.component';

@Component({
  selector: 'app-cast-editor-v2',
  templateUrl: './cast-editor-v2.component.html',
  styleUrls: ['./cast-editor-v2.component.scss']
})
export class CastEditorV2 implements OnInit {

  selectedCast: Cast;
  allCasts: Cast[] = [];
  @ViewChild('castDragAndDrop') dragAndDrop: CastDragAndDrop;

  constructor(private castAPI: CastApi, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    let uuid = this.route.snapshot.params.uuid;
    if (!isNullOrUndefined(uuid)) {
      this.dragAndDrop.selectCast(uuid);
    }
    this.castAPI.castEmitter.subscribe((val) => {
      this.onCastLoad(val);
    });
    this.castAPI.getAllCasts();
  }

  onCastLoad(casts: Cast[]) {
    this.allCasts = casts;
    if (casts.length == 0) {
      this.selectedCast = undefined;
      return;
    }
    if (!this.dragAndDrop.castSelected) {
      this.selectedCast = casts[0];
      this.dragAndDrop.selectCast(this.selectedCast.uuid);
    } else {
      this.selectedCast = this.dragAndDrop.cast;
    }
  }

  setCastURL() {
    if (this.location.path().endsWith("cast") || this.location.path().endsWith("cast/")) {
      this.location.replaceState(this.location.path() + "/" + this.selectedCast.uuid);
    } else {
      let splits: string[] = this.location.path().split('/');
      let baseURL = "";
      for (let i = 0; i < splits.length - 1; i++) {
        baseURL += (splits[i] + "/");
      }
      this.location.replaceState(baseURL + this.selectedCast.uuid);
    }
  }

  setCurrentCast(cast: Cast) {
    this.selectedCast = cast;
    this.dragAndDrop.selectCast(cast.uuid);
  }

  addCast() {
    let newCast: Cast = {
      uuid: "cast:" + Date.now(),
      name: "New Cast",
      segment: "PIECE1UUID",
      filled_positions: [
        {
          position_uuid: "piece1pos1",
          groups: [
            {
              group_index: 0,
              members: []
            }
          ]
        },
        {
          position_uuid: "piece1pos2",
          groups: [
            {
              group_index: 0,
              members: []
            }
          ]
        }
      ]
    }
    this.castAPI.setCast(newCast, true);
    this.selectedCast = newCast;
    this.dragAndDrop.selectCast(this.selectedCast.uuid);
  }

}
