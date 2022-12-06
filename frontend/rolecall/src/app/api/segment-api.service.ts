
import { Injectable } from '@angular/core';
import { CrudApi } from './crud-api.service';
import * as APITypes from 'src/api-types';

import { MockSegmentBackend } from '../mocks/mock-segment-backend';
import { DataCache } from '../utils/data-cache';

type RawPosition = {
  id: number;
  name: string;
  notes: string;
  order: number;
  siblingId: number;
  size: number;
};

type RawSegment = {
  id: number;
  name: string;
  notes: string;
  siblingId: number;
  type: SegmentType;
  length: number;
  positions: RawPosition[];
};

// type RawAllSegmentsResponse = {
//   data: RawSegment[];
//   warnings: string[];
// };

export type Position = {
  id?: number;
  uuid: string;
  name: string;
  notes: string;
  order: number;
  siblingId: number;
  size: number;
};

export type SegmentType = 'SEGMENT' | 'BALLET' | 'SUPER' | 'UNDEF';

export type Segment = {
  uuid: string;
  name: string;
  isOpen: boolean;
  siblingId: number;
  type: SegmentType;
  positions: Position[];
  deletePositions: Position[];
  // For frontend use only. Is not saved.
  hasAbsence?: boolean;
};

export type AllSegmentsResponse = {
  data: {
    segments: Segment[];
  };
  warnings: string[];
};

export type OneSegmentResponse = {
  data: {
    segment: Segment;
  };
  warnings: string[];
};

/**
 * A service responsible for interfacing with the Sections API and
 * maintaining section data.
 */
@Injectable({providedIn: 'root'})
export class SegmentApi {

  cache: DataCache<APITypes.UserUUID>;

  constructor(
      public crudApi: CrudApi<APITypes.UserUUID>,
  ) {
    this.cache = new DataCache<APITypes.UserUUID>({
      name: 'Segment',
      apiName: 'api/section',
      ixName: 'sectionid',
      crudApi: this.crudApi,
      getIx: this.getIx,
      fromRaw: this.fromRawSegment,
      toRaw: this.toRawSegment,
      sortCmp: this.segmentCmp,
      mockBackend: new MockSegmentBackend(),
    });
  }

  public segmentCmp = (a: unknown, b: unknown): number =>
    ( a as Segment ).name.toLowerCase() <
    ( b as Segment ).name.toLowerCase() ? -1 : 1;

  public fromRawSegment = (rawItem: unknown): unknown => {
    const raw = rawItem as RawSegment;
    return {
      uuid: String(raw.id),
      name: raw.name,
      isOpen: false,
      siblingId: raw.siblingId,
      type: raw.type,
      positions: raw.positions.sort((a, b) =>
          a.order < b.order ? -1 : 1).map(pos => ({
              ...pos,
              uuid: String(pos.id),
            })),
      deletePositions: [],
    };
  };

  public toRawSegment = (item: unknown): unknown => {
    const segment = item as Segment;
    if (segment.uuid) {
      return {
        id: Number(segment.uuid),
        name: segment.name,
        siblingId: segment.siblingId,
        type: segment.type ? segment.type : 'BALLET',
        positions: segment.positions.map(val => ({
            ...val,
            delete: false
          })
        ).concat(segment.deletePositions.map(val => ({
            ...val,
            delete: true
          })
        )),
      };
    } else {
      return {
        name: segment.name,
        siblingId: segment.siblingId,
        type: segment.type ? segment.type : 'BALLET',
        positions: segment.positions,
      };
    }
  };

  public getIx = (item: unknown): APITypes.SegmentUUID =>
    ( item as Segment ).uuid;

  public loadAllSegments = async (
    forceDbRead: boolean = false,
  ): Promise<Segment[]> => {
    if (forceDbRead || !this.cache.isLoaded) {
      const items = await this.cache.loadAll() as Segment[];
      return items;
    }
    return this.cache.refreshData() as Segment[];
    // const arr = Array.from(this.cache.arr.values());
    // this.cache.loadedAll.emit(arr);
    // return arr as Segment[];
  };

  public lookup = (ix: APITypes.SegmentUUID): Segment =>
    this.cache.map.get(ix) as Segment;

}
