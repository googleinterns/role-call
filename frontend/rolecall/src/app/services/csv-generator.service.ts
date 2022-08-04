/* eslint-disable @typescript-eslint/naming-convention */

import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver-es';
import {Cast} from '../api/cast_api.service';
import {Performance} from '../api/performance-api.service';
import {SegmentApi} from '../api/segment-api.service';
import {UserApi} from '../api/user-api.service';

@Injectable({providedIn: 'root'})
export class CsvGenerator {

  constructor(
    private userAPI: UserApi,
    private segmentApi: SegmentApi) {
  }

  generateCSVFromCast = async (cast: Cast): Promise<void> => {
    await this.userAPI.getAllUsers();
    await this.segmentApi.getAllSegments();
    const headers = ['Cast Name', 'Segment', 'Position', 'Cast Number',
      'Dancer Number',
      'Dancer First', 'Dancer Last'];
    const objs: any[][][] = cast.filled_positions.map(filledPos =>
      filledPos.groups.map(g =>
        g.members.sort(
            (a, b) => a.position_number < b.position_number ? -1 : 1).map(m => {
          const segment = this.segmentApi.segments.get(cast.segment);
          const position = segment.positions.find(
              pos => pos.uuid === filledPos.position_uuid);
          const dancer = this.userAPI.users.get(m.uuid);
          return {
            'Cast Name': cast.name,
            Segment: segment.name,
            Position: position.name,
            'Cast Number': g.group_index + 1,
            'Dancer Number': m.position_number + 1,
            'Dancer First': dancer.first_name,
            'Dancer Last': dancer.last_name
          };
        })
      )
    );
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
  };

  generateCSVFromPerformance = async (perf: Performance): Promise<void> => {
    await this.userAPI.getAllUsers();
    await this.segmentApi.getAllSegments();
    const headers = ['Performance', 'Ballet', 'Length', 'Position',
      'Selected Cast', 'Cast Number', 'Dancer Number',
      'Dancer First', 'Dancer Last'];
    const objs: any[][][][] = perf.step_3.segments.filter(s =>
      this.segmentApi.segments.get(s.segment).type === 'BALLET').map(seg =>
        seg.custom_groups.map(filledPos =>
          filledPos.groups.map(g =>
            g.members.sort(
              (a, b) => a.position_number < b.position_number ? -1 : 1)
              .map(m => {
                const segment = this.segmentApi.segments.get(seg.segment);
                const position = segment.positions.find(
                    pos => pos.uuid === filledPos.position_uuid);
                const dancer = this.userAPI.users.get(m.uuid);
                return {
                  Performance: perf.step_1.title,
                  Ballet: segment.name,
                  Length: seg.length,
                  Position: position.name,
                  'Selected Cast': seg.selected_group + 1,
                  'Cast Number': g.group_index + 1,
                  'Dancer Number': m.position_number + 1,
                  'Dancer First': dancer.first_name,
                  'Dancer Last': dancer.last_name
                };
              })
        )
      )
    );
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
            .sort((a, b) => a.Ballet < b.Ballet ? -1 : 1),
        headers,
        perf.step_1.city + ', ' + perf.step_1.state + ' ' + perf.step_1.country
        + ' - ' + perf.step_1.venue + ' - ' +
        (new Date(perf.step_1.date)).toLocaleDateString().replace(/\//g, '-')
        + ' - ' +
        perf.step_1.title + ' Performance Casting');
  };

  downloadFile = (data: any, headers: string[], fileName: string): void => {
    const replacer = (_, value): string =>
      (value === null || value === undefined) ? '' : value;
    const csv = data.map(row => headers.map(
        fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(headers.join(','));
    const csvArray = csv.join('\r\n');

    const blob = new Blob([csvArray], {type: 'text/csv'});
    saveAs(blob, fileName + '.csv');
  };
}
