/* eslint-disable @typescript-eslint/naming-convention */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudApi } from './crud-api.service';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

import { MockCastBackend } from '../mocks/mock-cast-backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { SegmentApi, Segment, Position } from './segment-api.service';
import { ContextService } from '../services/context.service';
import { DataCache, CacheLoadReturn, CacheSetReturn, ItemStdReturn,
} from '../utils/data-cache';
import { RawAllItemsResponse } from './crud-api.service';


type RawCastMember = {
  id: number;
  userId: number;
  order: number;
  hasAbsence?: boolean;
};

type RawSubCast = {
  id: number;
  positionId: number;
  castNumber: number;
  members: RawCastMember[];
};

type RawCast = {
  id: number;
  name: string;
  notes: string;
  sectionId: number;
  subCasts: RawSubCast[];
};

// Get all casts
// type AllRawCastsResponse = {
//   data: RawCast[];
//   warnings: string[];
// };

// Get one specific cast
// type OneRawCastsResponse = {
//   data: RawCast;
//   warnings: string[];
// };

export type CastMember = {
  uuid: string;
  position_number: number;
  hasAbsence: boolean;
};

export type CastGroup = {
  position_uuid?: string;
  group_index: number;
  members: CastMember[];
};

export type CastPosition = {
  position_uuid: string;
  groups: CastGroup[];
  hasAbsence: boolean;
};

export type Cast = {
  uuid: string;
  name: string;
  segment: string;
  castCount: number;
  filled_positions: CastPosition[];
};

// export type AllCastsResponse = {
//   data: {
//     casts: Cast[];
//   };
//   warnings: string[];
// };

// export type OneCastResponse = {
//   data: {
//     cast: Cast;
//   };
//   warnings: string[];
// };

/**
 * A service responsible for interfacing with the Cast APIs,
 * and maintaining all cast objects in the system, including those
 * acting as intermediaries for a performance's custom casts.
 */
@Injectable({providedIn: 'root'})
export class CastApi {
  /** The last saved id (every time a cast is saved it receives a new id). */
  lastSavedCastId: number;

  /** True if the cached data was calculated with performance dates. */
  hasPerformanceDates = false;

  /**
   * The casts which are not on the backend but are currently needed by
   * multiple components (namely the performance editor and cast drag and
   * drop).
   * This should not include the cast creator's casts, it should only be the
   * casts which will not be set as cast objects on the backend, i.e. the cast
   * objects needed to pass between the cast drag and drop and the performance
   * editor, since these casts will be set as performance groups, not casts.
   */
  workingCasts: Map<APITypes.CastUUID, Cast> = new Map();

  /** The raw casts handed over by the backend. */
  rawCasts: RawCast[] = [];

  // /** All the loaded casts mapped by UUID. */
  // casts: Map<APITypes.CastUUID, Cast> = new Map<APITypes.CastUUID, Cast>();

  // /** Emitter that is called whenever casts are loaded. */
  // castEmitter: EventEmitter<Cast[]> = new EventEmitter();

  cache: DataCache<APITypes.CastUUID>;

  constructor(
      private http: HttpClient,
      private headerUtil: HeaderUtilityService,
      private respHandler: ResponseStatusHandlerService,
      private segmentApi: SegmentApi,

      public g: ContextService,
      public crudApi: CrudApi<APITypes.UserUUID>,
  ) {
    this.cache = new DataCache<APITypes.UserUUID>({
      name: 'Cast',
      apiName: 'api/cast',
      ixName: 'castid',
      crudApi: this.crudApi,
      getIx: this.getIx,
      // sortCmp: this.castCmp,
      mockBackend: new MockCastBackend(),
      // loadAllParams: this.loadAllCastsParams,
      loadAllEmitItems: this.loadAllEmitCasts,
    });
    this.cache.loadAllRequestOverride = this.stdLoadAllCasts;
    this.cache.setRequestOverride = this.stdSetCast;
  }

  public getIx = (item: unknown): APITypes.CastUUID =>
    ( item as Cast ).uuid;

  // public castCmp = (a: unknown, b: unknown): number =>
  //     ( a as Cast ).name.toLowerCase() <
  //     ( b as Cast ).name.toLowerCase() ? -1 : 1;

  public loadAllCastsCompanionQuery = async (): Promise<void> => {
    await this.segmentApi.loadAllSegments();
  };

  // public loadAllCastsParams = (): HttpParams => {
  //   const perfDate = this.g.checkUnavs ? this.g.checUnavDate : 0;
  //   return new HttpParams().append('perfdate', '' + perfDate);
  // };

  public loadAllEmitCasts = (): unknown[] =>
    Array.from(this.cache.arr).concat(...this.workingCasts.values());

  /** Hits backend with all casts GET request. */
  public stdLoadAllCasts = async (
    cache: DataCache<APITypes.CastUUID>,
  ): Promise<CacheLoadReturn> => {
    const api = cache.apiName;
    if (environment.mockBackend) {
      return cache.mockBackend.requestAllMocks();
    }
    await this.segmentApi.loadAllSegments();
    const headers = await this.headerUtil.generateHeader();
    let params: HttpParams;
    if (cache.loadAllParams) {
      params = cache.loadAllParams();
    }
    return lastValueFrom(this.http.get<RawAllItemsResponse>(
        environment.backendURL + api, {
          headers,
          observe: 'response',
          withCredentials: true,
          params,
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<RawAllItemsResponse>(resp))
        .then(result => {
          this.rawCasts = result.data as RawCast[];
          const allPositions: Position[] = [];
          Array.from(this.segmentApi.cache.map.values()).forEach(segment => {
            allPositions.push(...( segment as Segment ).positions);
          });
          return {
            items: result.data.map(rawItem => {
              const rawCast = rawItem as RawCast;
              let highestCastNumber = 0;
              const groups: CastGroup[] = [];
              for (const rawSubCast of rawCast.subCasts) {
                const foundGroup = groups.find(
                    g => g.position_uuid === String(
                        allPositions.find(pos =>
                          Number(pos.uuid) === rawSubCast.positionId).uuid));
                if (foundGroup) {
                  const foundGroupIndex = groups.find(
                      g => g.position_uuid === String(allPositions.find(
                          pos => Number(pos.uuid)
                                  === rawSubCast.positionId).uuid)
                            && g.group_index === rawSubCast.castNumber);
                  if (foundGroupIndex) {
                    foundGroupIndex.members = foundGroupIndex.members.concat(
                        rawSubCast.members.map(rawMem => ({
                            uuid: String(rawMem.userId),
                            position_number: rawMem.order,
                            hasAbsence: rawMem.hasAbsence ?? false,
                          })
                        ));
                  } else {
                    // Note: This is duplicated with the following else-block
                    groups.push({
                      position_uuid: String(allPositions.find(
                          pos => Number(pos.uuid)
                                  === rawSubCast.positionId).uuid),
                      group_index: rawSubCast.castNumber,
                      members: rawSubCast.members.map(rawMem => ({
                          uuid: String(rawMem.userId),
                          position_number: rawMem.order,
                          hasAbsence: rawMem.hasAbsence ?? false,
                        })
                      )
                    });
                  }
                } else {
                  // Note: This is the same code as the preceding else-block
                  groups.push({
                    position_uuid: String(allPositions.find(
                        pos => Number(pos.uuid)
                                === rawSubCast.positionId).uuid),
                    group_index: rawSubCast.castNumber,
                    members: rawSubCast.members.map(rawMem => ({
                        uuid: String(rawMem.userId),
                        position_number: rawMem.order,
                        hasAbsence: rawMem.hasAbsence ?? false,
                      })
                    )
                  });
                }
                if (highestCastNumber < rawSubCast.castNumber) {
                  highestCastNumber = rawSubCast.castNumber;
                }
              }
              const uniquePositionIDs = new Set<number>();
              rawCast.subCasts.forEach(
                  val => uniquePositionIDs.add(val.positionId));
              return {
                uuid: String(rawCast.id),
                name: rawCast.name,
                segment: String(rawCast.sectionId),
                castCount: highestCastNumber + 1,
                filled_positions: Array.from(uniquePositionIDs.values())
                    .map(positionID => ({
                        position_uuid: String(allPositions.find(pos =>
                            Number(pos.uuid) === positionID).uuid),
                        groups: groups.filter(g => g.position_uuid === String(
                            allPositions.find(pos =>
                                Number(pos.uuid) === positionID).uuid)),
                        hasAbsence: false,
                      })
                    )
              };
            }),
            warnings: result.warnings
          };
        });
  };

  // No special implementation for requestOneCast is provided as
  // it is not needed for the client. If called the generic CRUD
  // function will be used. It will either retirieve a Mock value
  // or a Raw database value.

  /** Hits backend with create/edit cast POST request. */
  requestCastSet = async (
    cache: DataCache<APITypes.CastUUID>,
    item: unknown,
  ): Promise<ItemStdReturn> => {
    const api = cache.apiName;
    const delApi = `${cache.apiName}?${cache.ixName}=`;
    const getIx = cache.getIx;
    const cast = item as Cast;
    if (environment.mockBackend) {
      return this.cache.mockBackend.requestMockSet(cache, getIx);
    }
    const headers = await this.headerUtil.generateHeader();
    const observe: 'body' | 'events' | 'response' = 'response';
    const withCredentials = true;
    const httpParams = { headers, observe, withCredentials };
    // Check if we have record of the cast and patch if we do
    if (this.hasCast(cast.uuid)) {
      // Do patch
      // instead of patching db, delete and post new.
      return lastValueFrom(this.http.delete(
          environment.backendURL + delApi + cast.uuid,
          httpParams,
        ))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp))
        .then(async () => {
          const rawCast = this.castToPostRaw(cast);
          return lastValueFrom(this.http.post(
              environment.backendURL + api,
              rawCast,
              httpParams,
            ))
            .catch(errorResp => errorResp)
            .then(resp => this.respHandler.checkResponse<any>(resp));
        });
    } else {
      // Do post
      const rawCast = this.castToPostRaw(cast);
      return lastValueFrom(this.http.post(
          environment.backendURL + api,
          rawCast,
          httpParams,
        ))
        .catch(errorResp => errorResp).then(
            resp => this.respHandler.checkResponse<any>(resp));
    }
  };


  loadAllCasts = async (
    forceDbRead: boolean = false,
    _perfDate: number = 0,
  ): Promise<Cast[]> => {
    if (forceDbRead || !this.cache.isLoaded) {
      return await this.cache.loadAll() as Cast[];
    }
    let items: unknown[];
    if (this.loadAllEmitCasts) {
      items = this.loadAllEmitCasts();
    } else {
      items = Array.from(this.cache.arr.values());
    }
    this.cache.loadedAll.emit(items);
    return items as Cast[];
  };

  lookup = (ix: APITypes.CastUUID): Cast =>
    this.cache.map.get(ix) as Cast;


  stdSetCast = async (
    cache: DataCache<APITypes.CastUUID>,
    item: unknown,
  ): Promise<CacheSetReturn> =>
    this.requestCastSet(cache, item)
      .then(r => DataCache.itemSetReturnOk(r))
      .catch(e => DataCache.itemSetReturnError(e));

  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the cast is valid, as well as if the backend
   * request fails for some other reason.
   */
  setCast = async (
    cast: Cast,
    isWorkingCast?: boolean,
  ): Promise<APITypes.SuccessIndicator> => {
    if (isWorkingCast) {
      this.workingCasts.set(cast.uuid, cast);
      return { successful: true };
    }
    if (this.workingCasts.has(cast.uuid)) {
      this.workingCasts.delete(cast.uuid);
    }
    return this.cache.set(cast);
  };


  /** Requests for the backend to delete the cast. */
  deleteCast = async (
    cast: Cast,
  ): Promise<APITypes.SuccessIndicator> => {
    if (this.workingCasts.has(cast.uuid)) {
      this.workingCasts.delete(cast.uuid);
      this.loadAllCasts();
      return { successful: true };
    }
    return this.cache.delete(cast).then(() => {
      this.loadAllCasts();
      return { successful: true };
    }).catch(reason => ({
        successful: false,
        error: reason,
      })
    );
  };

  /**
   * Check if the cached casts (working casts and backend casts) includes
   * a cast with a specific UUID.
   */
  hasCast = (castUUID: APITypes.CastUUID): boolean => {
    const inCasts = this.cache.map.has(castUUID);
    const inWorkingCasts = this.workingCasts.has(castUUID);
    return inCasts || inWorkingCasts;
  };



  /** Return the cast (working or backend) with a specific cast UUID. */
  castFromUUID = (castUUID: APITypes.CastUUID): Cast => {
    if (this.cache.map.has(castUUID)) {
      return this.lookup(castUUID);
    }
    if (this.workingCasts.has(castUUID)) {
      return this.workingCasts.get(castUUID);
    }
    return undefined;
  };

  // Private methods

  /** Turns a cast to be patched into a raw cast to be posted. */
  private castToPostRaw = (cast: Cast): RawCast => {
    const allSubCasts: RawSubCast[] = [];
    const allPositions: Position[] = [];
    Array.from(this.segmentApi.cache.map.values()).forEach(segment => {
      allPositions.push(...( segment as Segment ).positions);
    });
    for (const filledPos of cast.filled_positions) {
      for (const group of filledPos.groups) {
        allSubCasts.push({
          id: undefined,
          positionId: Number(allPositions.find(
              position => position.uuid === filledPos.position_uuid).uuid),
          castNumber: group.group_index,
          members: group.members.map(mem => ({
              id: undefined,
              userId: Number(mem.uuid),
              order: mem.position_number
            })
          ),
        });
      }
    }

    return {
      id: undefined,
      name: cast.name,
      notes: '',
      sectionId: Number(cast.segment),
      subCasts: allSubCasts,
    };
  };

}
