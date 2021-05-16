import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver-es';
import {Cast} from '../api/cast_api.service';
import {Performance} from '../api/performance-api.service';
import {PieceApi} from '../api/piece_api.service';
import {UserApi} from '../api/user_api.service';

@Injectable({providedIn: 'root'})
export class CsvGenerator {

  constructor(private userAPI: UserApi, private pieceAPI: PieceApi) {
  }

  async generateCSVFromCast(cast: Cast) {
    await this.userAPI.getAllUsers();
    await this.pieceAPI.getAllPieces();
    const headers = ['Cast Name', 'Piece', 'Position', 'Cast Number',
      'Dancer Number',
      'Dancer First', 'Dancer Last'];
    const objs: any[][][] = cast.filled_positions.map(filledPos => {
      return filledPos.groups.map(g => {
        return g.members.sort(
            (a, b) => a.position_number < b.position_number ? -1 : 1).map(m => {
          const piece = this.pieceAPI.pieces.get(cast.segment);
          const position = piece.positions.find(
              pos => pos.uuid === filledPos.position_uuid);
          const dancer = this.userAPI.users.get(m.uuid);
          return {
            'Cast Name': cast.name,
            'Piece': piece.name,
            'Position': position.name,
            'Cast Number': g.group_index + 1,
            'Dancer Number': m.position_number + 1,
            'Dancer First': dancer.first_name,
            'Dancer Last': dancer.last_name
          };
        });
      });
    });
    const allVals = [];
    for (const iObjs of objs) {
      for (const nObjs of iObjs) {
        for (const zObj of nObjs) {
          allVals.push(zObj);
        }
      }
    }
    this.downloadFile(
        allVals.sort((a, b) => a['Cast Number'] < b['Cast Number'] ? -1 : 1),
        headers,
        cast.name + ' Cast');
  }

  async generateCSVFromPerformance(perf: Performance) {
    await this.userAPI.getAllUsers();
    await this.pieceAPI.getAllPieces();
    const headers = ['Performance', 'Ballet', 'Length', 'Position',
      'Selected Cast', 'Cast Number', 'Dancer Number',
      'Dancer First', 'Dancer Last'];
    const objs: any[][][][] = perf.step_3.segments.filter(
        s => this.pieceAPI.pieces.get(s.segment).type === 'BALLET').map(seg => {
      return seg.custom_groups.map(filledPos => {
        return filledPos.groups.map(g => {
          return g.members.sort(
              (a, b) => a.position_number < b.position_number ? -1 : 1)
              .map(m => {
                const piece = this.pieceAPI.pieces.get(seg.segment);
                const position = piece.positions.find(
                    pos => pos.uuid === filledPos.position_uuid);
                const dancer = this.userAPI.users.get(m.uuid);
                return {
                  'Performance': perf.step_1.title,
                  'Ballet': piece.name,
                  'Length': seg.length,
                  'Position': position.name,
                  'Selected Cast': seg.selected_group + 1,
                  'Cast Number': g.group_index + 1,
                  'Dancer Number': m.position_number + 1,
                  'Dancer First': dancer.first_name,
                  'Dancer Last': dancer.last_name
                };
              });
        });
      });
    });
    const allVals = [];
    for (const iObjs of objs) {
      for (const nObjs of iObjs) {
        for (const zObjs of nObjs) {
          for (const yObj of zObjs) {
            allVals.push(yObj);
          }
        }
      }
    }
    this.downloadFile(
        allVals.sort((a, b) => a['Cast Number'] < b['Cast Number'] ? -1 : 1)
            .sort((a, b) => a['Ballet'] < b['Ballet'] ? -1 : 1),
        headers,
        perf.step_1.city + ', ' + perf.step_1.state + ' ' + perf.step_1.country
        + ' - ' + perf.step_1.venue + ' - ' +
        (new Date(perf.step_1.date)).toLocaleDateString().replace(/\//g, '-')
        + ' - ' +
        perf.step_1.title + ' Performance Casting');
  }

  downloadFile(data: any, headers: string[], fileName: string) {
    const replacer = (_, value) => (value === null || value === undefined) ?
        '' : value;
    const csv = data.map(row => headers.map(
        fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(headers.join(','));
    const csvArray = csv.join('\r\n');

    const blob = new Blob([csvArray], {type: 'text/csv'});
    saveAs(blob, fileName + '.csv');
  }
}
