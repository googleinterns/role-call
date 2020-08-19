import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Cast } from '../api/cast_api.service';
import { Performance } from '../api/performance-api.service';
import { PieceApi } from '../api/piece_api.service';
import { UserApi } from '../api/user_api.service';

@Injectable({
  providedIn: 'root'
})
export class CsvGenerator {

  constructor(private userAPI: UserApi, private pieceAPI: PieceApi) { }

  async generateCSVFromCast(cast: Cast) {
    await this.userAPI.getAllUsers();
    await this.pieceAPI.getAllPieces();
    let headers = ['Cast Name', 'Piece', 'Position', 'Cast Number', 'Dancer Number',
      'Dancer First', 'Dancer Last'];
    let objs: any[][][] = cast.filled_positions.map(filledPos => {
      return filledPos.groups.map(g => {
        return g.members.sort((a, b) => a.position_number < b.position_number ? -1 : 1).map(m => {
          let piece = this.pieceAPI.pieces.get(cast.segment);
          let position = piece.positions.find(pos => pos.uuid == filledPos.position_uuid);
          let dancer = this.userAPI.users.get(m.uuid);
          return {
            'Cast Name': cast.name,
            'Piece': piece.name,
            'Position': position.name,
            'Cast Number': g.group_index + 1,
            'Dancer Number': m.position_number + 1,
            'Dancer First': dancer.first_name,
            'Dancer Last': dancer.last_name
          };
        })
      })
    });
    let allVals = [];
    for (let i = 0; i < objs.length; i++) {
      for (let n = 0; n < objs[i].length; n++) {
        for (let z = 0; z < objs[i][n].length; z++) {
          allVals.push(objs[i][n][z]);
        }
      }
    }
    this.downloadFile(
      allVals.sort((a, b) => a['Cast Number'] < b['Cast Number'] ? -1 : 1),
      headers,
      cast.name + " Cast");
  }

  async generateCSVFromPerformance(perf: Performance) {
    await this.userAPI.getAllUsers();
    await this.pieceAPI.getAllPieces();
    let headers = ['Performance', 'Piece', 'Length', 'Position',
      'Selected Cast', 'Cast Number', 'Dancer Number',
      'Dancer First', 'Dancer Last'];
    let objs: any[][][][] = perf.step_3.segments.filter(s => this.pieceAPI.pieces.get(s.segment).type == "PIECE").map(seg => {
      return seg.custom_groups.map(filledPos => {
        return filledPos.groups.map(g => {
          return g.members.sort((a, b) => a.position_number < b.position_number ? -1 : 1).map(m => {
            let piece = this.pieceAPI.pieces.get(seg.segment);
            let position = piece.positions.find(pos => pos.uuid == filledPos.position_uuid);
            let dancer = this.userAPI.users.get(m.uuid);
            return {
              'Performance': perf.step_1.title,
              'Piece': piece.name,
              'Length': seg.length,
              'Position': position.name,
              'Selected Cast': seg.selected_group + 1,
              'Cast Number': g.group_index + 1,
              'Dancer Number': m.position_number + 1,
              'Dancer First': dancer.first_name,
              'Dancer Last': dancer.last_name
            };
          })
        })
      })
    });
    let allVals = [];
    for (let i = 0; i < objs.length; i++) {
      for (let n = 0; n < objs[i].length; n++) {
        for (let z = 0; z < objs[i][n].length; z++) {
          for (let y = 0; y < objs[i][n][z].length; y++) {
            allVals.push(objs[i][n][z][y]);
          }
        }
      }
    }
    this.downloadFile(
      allVals.sort((a, b) => a['Cast Number'] < b['Cast Number'] ? -1 : 1)
        .sort((a, b) => a['Piece'] < b['Piece'] ? -1 : 1),
      headers,
      perf.step_1.location + " - " +
      (new Date(perf.step_1.date)).toLocaleDateString().replace(/\//g, '-') + " - " +
      perf.step_1.title + " Performance Casting");
  }

  downloadFile(data: any, headers: string[], fileName: string) {
    const replacer = (key, value) => (value === null || value == undefined) ? '' : value;
    let csv = data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(headers.join(','));
    let csvArray = csv.join('\r\n');

    var blob = new Blob([csvArray], { type: 'text/csv' })
    saveAs(blob, fileName + ".csv");
  }

}
