/* eslint-disable @typescript-eslint/naming-convention */

import { Injectable } from '@angular/core';
import { CrudApi } from './crud-api.service';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { MockUnavailabilityBackend
} from '../mocks/mock-unavailability-backend';
import { DataCache } from '../utils/data-cache';


export type WorkUnav = {
  userId: number;
  startDate: Date;
  endDate: Date;
};

export type Unavailability = {
  id: number;
  userId: number;
  reason: UnavailabilityReason;
  description: string;
  startDate: number;
  endDate: number;
};

export type AllUnavailabilitiesResponse = {
  data: Unavailability[];
  warnings: [];
};

export type OneUnavailabilityResponse = {
  data: Unavailability;
  warnings: [];
};

const SixMonthInMS = 6 * 2629800000;

export type UnavailabilityReason = 'UNDEF' | 'INJURY' | 'VACATION' | 'OTHER';

/**
 * A service responsible for interfacing with the Unavailability APIs
 * and keeping track of unavailability data.
 */
@Injectable({providedIn: 'root'})
export class UnavailabilityApi {
  /** Should match UnavailabilityReason except for UNDEF */
  reasonList = [
    'Injury',
    'Vacation',
    'Other',
  ];

  cache: DataCache<APITypes.UnavailabilityUUID>;

  constructor(
      public crudApi: CrudApi<APITypes.UnavailabilityUUID>,
  ) {
    this.cache = new DataCache<APITypes.UnavailabilityUUID>({
      name: 'Unavailability',
      apiName: 'api/unavailable',
      ixName: 'unavailableid',
      crudApi: this.crudApi,
      getIx: this.getIx,
      sortCmp: this.unavCmp,
      mockBackend: new MockUnavailabilityBackend(),
      loadAllUrl: this.loadAllApi,
    });
  }

  unavCmp = (a: unknown, b: unknown): number =>
      ( a as Unavailability ).endDate - ( b as Unavailability ).endDate;

  newUnavailability = (): Unavailability => ({
      id: 0,
      reason: 'UNDEF',
      description: '',
      userId: 0,
      startDate: Date.now(),
      endDate: Date.now(),
    });

  public getIx = (item: unknown): APITypes.UnavailabilityUUID =>
    ( item as Unavailability ).id;

  loadAllApi = (): string => {
    const url =
      environment.backendURL + 'api/unavailable?startdate=' +
      (Date.now() - SixMonthInMS) +
      '&enddate=' + (Date.now() + SixMonthInMS);
    return url;
  };


  loadAllUnavailabilities = async (
    forceDbRead: boolean = false,
  ): Promise<Unavailability[]> => {
    if (forceDbRead || !this.cache.isLoaded) {
      return await this.cache.loadAll() as Unavailability[];
    }
    return this.cache.refreshData() as Unavailability[];
    // const arr = Array.from(this.cache.arr.values());
    // this.cache.loadedAll.emit(arr);
    // return arr as Unavailability[];
  };

  lookup = (ix: APITypes.UnavailabilityUUID): Unavailability =>
    this.cache.map.get(ix) as Unavailability;

}
