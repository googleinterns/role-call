/* eslint-disable @typescript-eslint/naming-convention */

import { Injectable } from '@angular/core';
import { CrudApi } from './crud-api.service';
import * as APITypes from 'src/api-types';

import { MockPerformanceBackend } from '../mocks/mock-performance-backend';
import { ContextService } from '../services/context.service';
import { SegmentType } from './segment-api.service';
import { DataCache } from '../utils/data-cache';


type Group = {
  group_index: number;
  members: {
    uuid: string;
    position_number: number;
    // not saved
    hasAbsence: boolean;
  }[];
  memberNames?: string[];
};

type CustomGroup = {
  position_uuid: string;
  position_order: number;
  groups: Group[];
  name?: string;
  // ignored
  hasAbsence: boolean;
};

export type PerformanceSegment = {
  id: string;
  segment: string;
  name: string;
  type: SegmentType;
  hasAbsence: boolean;
  length: number;
  selected_group: number;
  custom_groups: CustomGroup[];
};

export type Performance = {
  uuid: string;
  // Should be removed?
  dateTime?: number;
  status: APITypes.PerformanceStatus.DRAFT |
      APITypes.PerformanceStatus.PUBLISHED |
      APITypes.PerformanceStatus.CANCELED;
  step_1: {
    title: string;
    date: number;
    city: string;
    state: string;
    country: string;
    venue: string;
    description: string;
  };
  step_2: {
    segments: string[];
  };
  step_3: {
    perfSegments: PerformanceSegment[];
  };
  // For frontend use only. Is not saved.
  hasAbsence?: boolean;
};

// export type RawAllPerformancesResponse = {
//   data: RawPerformance[];
//   warnings: string[];
// };

export type RawPerformance = {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string;
  country: string;
  venue: string;
  dateTime: number;
  status: string;
  hasAbsence?: boolean;
  performanceSections: {
    id?: number;
    // may not exist. Only set on way to server.
    delete?: boolean;
    sectionPosition: number;
    primaryCast: number;
    sectionId: number;
    positions: {
      positionId: number;
      positionOrder: number;
      casts: {
        castNumber: number;
        members: {
          id?: number;
          order: number;
          userId: number;
          performing: boolean;
          hasAbsence?: boolean;
        }[];
      }[];
    }[];
  }[];
};

export type AllPerformancesResponse = {
  data: {
    performances: Performance[];
  };
  warnings: string[];
};

export type OnePerformanceResponse = {
  data: {
    performance: Performance;
  };
  warnings: string[];
};

/**
 * A service responsible for interfacing with the Performance APIs, as well
 * as maintaining the performance data.
 */
@Injectable({providedIn: 'root'})
export class PerformanceApi {

  cache: DataCache<APITypes.PerformanceUUID>;

  constructor(
      public g: ContextService,
      public crudApi: CrudApi<APITypes.PerformanceUUID>,
  ) {
    this.cache = new DataCache<APITypes.PerformanceUUID>({
      name: 'Performance',
      apiName: 'api/performance',
      ixName: 'performanceid',
      crudApi: this.crudApi,
      getIx: this.getIx,
      fromRaw: this.convertRawToPerformance,
      toRaw: this.convertPerformanceToRaw,
      sortCmp: this.performanceCmp,
      mockBackend: new MockPerformanceBackend(),
      // loadAllParams: this.loadAllPerformanceParams,
      preUpdateCleanup: this.deletePreviousGroups,
    });
  }

  getIx = (item: unknown): APITypes.PerformanceUUID =>
    ( item as Performance ).uuid;


  performanceCmp = (a: unknown, b: unknown): number =>
      ( a as Performance ).step_1.date >
      ( b as Performance ).step_1.date ? -1 : 1;

  // loadAllPerformanceParams = (): HttpParams =>
  //   new HttpParams().append('checkUnavs', `${this.g.checkUnavs}`);

  /**
   * Converts a raw performance response to the performance structure
   * for the performance editor.
   *
   * @param raw The raw performance from the backend
   */
  convertRawToPerformance = (rawItem: unknown): unknown => {
    const raw = rawItem as RawPerformance;
    return {
      uuid: String(raw.id),
      dateTime: raw.dateTime,
      hasAbsence: raw.hasAbsence,
      status: (raw.status === 'DRAFT' || raw.status === 'PUBLISHED'
               || raw.status
               === 'CANCELED')
          ? APITypes.PerformanceStatus[raw.status] :
          APITypes.PerformanceStatus.DRAFT,
      step_1: {
        title: raw.title,
        description: raw.description,
        date: raw.dateTime,
        city: raw.city,
        venue: raw.venue,
        country: raw.country,
        state: raw.state,
      },
      step_2: {
        segments: raw.performanceSections.map(val => val).sort((a, b) =>
          (a.sectionPosition < b.sectionPosition ? -1 : 1)
        ).map(val => String(val.sectionId))
      },
      step_3: {
        perfSegments: raw.performanceSections.map(val => ({
            id: String(val.id),
            segment: String(val.sectionId),
            type: 'UNDEF',
            length: 0,
            selected_group: val.primaryCast,
            custom_groups: val.positions.map(position => ({
                position_uuid: String(position.positionId),
                position_order: position.positionOrder,
                hasAbsence: false,
                groups: position.casts.map(cast => ({
                    group_index: cast.castNumber,
                    members: cast.members.map(mem => ({
                        uuid: String(mem.userId),
                        position_number: mem.order,
                        hasAbsence: mem.hasAbsence
                      })
                    )
                  })
                )
              })
            ),
            name: '',
            hasAbsence: false,
          })
        )
      }
    };
  };

  /**
   * Converts a performance editor performance into a
   * backend performance to be set on the backend.
   *
   * @param perf The performance editor performance state
   */
  convertPerformanceToRaw = (item: unknown): unknown => {
    const perf = item as Performance;
    return {
      id: isNaN(Number(perf.uuid)) ? null : Number(perf.uuid),
      title: perf.step_1.title,
      description: perf.step_1.description,
      city: perf.step_1.city,
      country: perf.step_1.country,
      venue: perf.step_1.venue,
      state: perf.step_1.state,
      dateTime: perf.step_1.date,
      status: perf.status ? perf.status : APITypes.PerformanceStatus.DRAFT,
      performanceSections: perf.step_3.perfSegments.map((seg, segIx) => ({
          id: seg.id ? Number(seg.id) : undefined,
          sectionPosition: segIx,
          primaryCast: seg.selected_group,
          sectionId: Number(seg.segment),
          positions: seg.custom_groups.map(customGroup => ({
              positionId: Number(customGroup.position_uuid),
              positionOrder: customGroup.position_order,
              casts: customGroup.groups.map(subCast => ({
                  castNumber: subCast.group_index,
                  members: subCast.members.map(mem => ({
                      order: mem.position_number,
                      userId: Number(mem.uuid),
                      performing: subCast.group_index === seg.selected_group
                    })
                  )
                })
              )
            })
          )
        })
      )
    };
  };

  /**
   * Takes a raw performance and calculates which performance sections
   * are missing from it since the last backend update, and resolves
   * the deleted sections to be marked for deletion on the backend
   * (since the backend requires a delete tag to remove objects rather
   * than simply omitting them).
   *
   * @param rawPerf The raw performance being patched
   */
  deletePreviousGroups = (
    rawItem: unknown,
  ): RawPerformance => {
    const rawPerf = rawItem as RawPerformance;
    rawPerf.performanceSections.push(
        ...(rawPerf.performanceSections.map(sec => {
          const copy = JSON.parse(JSON.stringify(sec));
          copy.delete = true;
          copy.sectionPosition = undefined;
          copy.positions = [];
          return copy;
        }))
    );
    // Using the original data in the map, find the deleted sections
    // in the performance
    const deletedSections = this.lookup(String(rawPerf.id))
        .step_3
        .perfSegments
        .filter(val =>
              rawPerf.performanceSections.find(
                  perfSec => String(perfSec.id) === val.id) === undefined
        );
    // Add the deleted sections with delete tags
    rawPerf.performanceSections.push(
        ...(deletedSections.map(sec => ({
            delete: true,
            id: Number(sec.id),
            segment: Number(sec.segment),
            primaryCast: sec.selected_group,
            sectionId: Number(sec.id),
            sectionPosition: undefined,
            positions: [],
          })
        ))
    );
    // If we are not deleting the section, meaning we are uploading it,
    // give it an undefined id to be set by the backend
    rawPerf.performanceSections = rawPerf.performanceSections.map(val => {
      if (!val.delete) {
        val.id = undefined;
        return val;
      } else {
        return val;
      }
    }).filter(val => (!(val.delete && val.id === undefined)));
    // Ensure only 1 deleted perf section for each performance section to be
    // deleted
    const uuidSet: Set<number> = new Set();
    rawPerf.performanceSections = rawPerf.performanceSections.filter(pS => {
      if (pS.id === undefined || (!pS.delete)) {
        return true;
      }
      if (uuidSet.has(pS.id)) {
        return false;
      } else {
        uuidSet.add(pS.id);
        return true;
      }
    });
    return rawPerf;
  };

  loadAllPerformances = async (
    forceDbRead: boolean = false,
  ): Promise<Performance[]> => {
    if (forceDbRead || !this.cache.isLoaded) {
      return await this.cache.loadAll() as Performance[];
    }
    return this.cache.refreshData() as Performance[];
    // const arr = Array.from(this.cache.arr.values());
    // this.cache.loadedAll.emit(arr);
    // return arr as Performance[];
  };

  lookup = (ix: APITypes.PerformanceUUID): Performance =>
    this.cache.map.get(ix) as Performance;

}
