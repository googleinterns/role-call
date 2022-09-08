/* eslint-disable @typescript-eslint/naming-convention */

import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

import { MockCastBackend } from '../mocks/mock-cast-backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { LoggingService } from '../services/logging.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { SegmentApi, Position } from './segment-api.service';
import { ContextService } from '../services/context.service';


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
type AllRawCastsResponse = {
  data: RawCast[];
  warnings: string[];
};

// Get one specific cast
type OneRawCastsResponse = {
  data: RawCast;
  warnings: string[];
};

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

export type AllCastsResponse = {
  data: {
    casts: Cast[];
  };
  warnings: string[];
};

export type OneCastResponse = {
  data: {
    cast: Cast;
  };
  warnings: string[];
};

/**
 * A service responsible for interfacing with the Cast APIs,
 * and maintaining all cast objects in the system, including those
 * acting as intermediaries for a performance's custom casts.
 */
@Injectable({providedIn: 'root'})
export class CastApi {
  /** The last saved id (every time a cast is saved it receives a new id). */
  lastSavedCastId: number;

  /** Mock backend. */
  mockBackend: MockCastBackend = new MockCastBackend();

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

  /** All the loaded casts mapped by UUID. */
  casts: Map<APITypes.CastUUID, Cast> = new Map<APITypes.CastUUID, Cast>();

  /** Emitter that is called whenever casts are loaded. */
  castEmitter: EventEmitter<Cast[]> = new EventEmitter();

  constructor(
      private loggingService: LoggingService,
      private http: HttpClient,
      private segmentApi: SegmentApi,
      private headerUtil: HeaderUtilityService,
      private respHandler: ResponseStatusHandlerService,

      public g: ContextService,
  ) {
  }

  /** Hits backend with all casts GET request. */
  requestAllCasts = async (
    forceSegmentLoad: boolean,
    dbgMsg: string,
    perfDate: number = 0,
  ): Promise<AllCastsResponse> => {
console.log('GET CASTS', dbgMsg);
    if (environment.mockBackend) {
      return this.mockBackend.requestAllCasts();
    }
    if (forceSegmentLoad || this.segmentApi.segments.size === 0) {
      await this.segmentApi.getAllSegments();
    }
    const header = await this.headerUtil.generateHeader();
    if (!this.g.checkUnavs) {
      perfDate = 0;
    }
    const params = new HttpParams().append('perfdate', '' + perfDate);
console.log('PERFDATE', perfDate);
    return lastValueFrom(this.http.get<AllRawCastsResponse>(
        environment.backendURL + 'api/cast', {
          headers: header,
          observe: 'response',
          withCredentials: true,
          params,
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<AllRawCastsResponse>(resp))
        .then(result => {
          this.rawCasts = result.data;
          const allPositions: Position[] = [];
          Array.from(this.segmentApi.segments.values()).forEach(segment => {
            allPositions.push(...segment.positions);
          });
          return {
            data: {
              casts: result.data.map(rawCast => {
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
              })
            },
            warnings: result.warnings
          };
        });
  };

  /** Hits backend with one cast GET request. */
  requestOneCast = async (
    uuid: APITypes.UserUUID,
  ): Promise<OneCastResponse> =>
    this.mockBackend.requestOneCast(uuid);


  /** Hits backend with create/edit cast POST request. */
  requestCastSet = async (cast: Cast): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestCastSet(cast);
    }
    // Check if we have record of the cast and patch if we do
    if (this.hasCast(cast.uuid)) {
      // Do patch
      const header = await this.headerUtil.generateHeader();
      return lastValueFrom(this.http.delete(
          environment.backendURL + 'api/cast?castid=' + cast.uuid, {
            headers: header,
            observe: 'response',
            withCredentials: true
          }))
          .catch(errorResp => errorResp)
          .then(
              resp => this.respHandler.checkResponse<any>(resp))
          .then(async () => {
            const rawCast = this.patchPostPrep(cast);
            return lastValueFrom(this.http.post(
                environment.backendURL + 'api/cast', rawCast, {
                  headers: header,
                  observe: 'response',
                  withCredentials: true
                }))
                .catch(errorResp => errorResp).then(
                  resp => this.respHandler.checkResponse<any>(resp));
          });
    } else {
      // Do post
      const rawCast = this.patchPostPrep(cast);
      const header = await this.headerUtil.generateHeader();
      return lastValueFrom(this.http.post(
        environment.backendURL + 'api/cast', rawCast, {
          headers: header,
          observe: 'response',
          withCredentials: true
        }))
        .catch(errorResp => errorResp).then(
          resp => this.respHandler.checkResponse<any>(resp));
    }
  };

  /** Hits backend with delete cast POST request. */
  requestCastDelete = async (cast: Cast): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestCastDelete(cast);
    }
    const header = await this.headerUtil.generateHeader();
    return lastValueFrom(this.http.delete(
        environment.backendURL + 'api/cast?castid=' + cast.uuid, {
          headers: header,
          observe: 'response',
          withCredentials: true
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
  };

  /** Gets all the casts from the backend and returns them. */
  getAllCasts = async (
    forceSegmentLoad: boolean,
    dbgMsg: string,
    perfDate: number = 0,
  ): Promise<Cast[]> =>
    this.getAllCastsResponse(forceSegmentLoad, dbgMsg, perfDate).then(() => {
      const allCasts = Array.from(this.casts.values())
          .concat(...this.workingCasts.values());
      this.castEmitter.emit(allCasts);
      return allCasts;
    }).catch(() =>
      []
    );


  /** Gets a specific cast from the backend by UUID and returns it. */
  getCast = async (uuid: APITypes.CastUUID): Promise<Cast> =>
    this.getOneCastResponse(uuid).then(val => {
      const cast = Array.from(this.casts.values())
          .concat(...this.workingCasts.values());
      this.castEmitter.emit(cast);
      return val.data.cast;
    });


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
      return Promise.resolve({
        successful: true
      });
    }
    if (this.workingCasts.has(cast.uuid)) {
      this.workingCasts.delete(cast.uuid);
    }
    return this.setCastResponse(cast).then(response => {
      const rawCast = (response as unknown as OneRawCastsResponse).data;
      this.lastSavedCastId = rawCast.id;
      this.getAllCasts(false, 'set');
      return {
        successful: true
      };
    }).catch(reason => ({
        successful: false,
        error: reason,
      })
    );
  };

  /** Requests for the backend to delete the cast. */
  deleteCast = async (cast: Cast): Promise<APITypes.SuccessIndicator> => {
    if (this.workingCasts.has(cast.uuid)) {
      this.workingCasts.delete(cast.uuid);
      this.getAllCasts(false, 'delete 1');
      return Promise.resolve({
        successful: true
      });
    }
    return this.deleteCastResponse(cast).then(() => {
      this.casts.delete(cast.uuid);
      this.getAllCasts(false, 'delete 2');
      return {
        successful: true
      };
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
  hasCast = (castUUID: APITypes.CastUUID): boolean =>
    this.casts.has(castUUID) || this.workingCasts.has(castUUID);


  /** Return the cast (working or backend) with a specific cast UUID. */
  castFromUUID = (castUUID: APITypes.CastUUID): Cast => {
    if (this.casts.has(castUUID)) {
      return this.casts.get(castUUID);
    }
    if (this.workingCasts.has(castUUID)) {
      return this.workingCasts.get(castUUID);
    }
    return undefined;
  };

  // Private methods

  private patchPostPrep = (cast: Cast): RawCast => {
    const allSubCasts: RawSubCast[] = [];
    const allPositions: Position[] = [];
    Array.from(this.segmentApi.segments.values()).forEach(segment => {
      allPositions.push(...segment.positions);
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

  /** Takes backend response, updates data structures for all users. */
  private getAllCastsResponse = async (
    forceSegmentLoad: boolean,
    dbgMsg: string,
    perfDate: number,
  ): Promise<AllCastsResponse> =>
    this.requestAllCasts(forceSegmentLoad, dbgMsg, perfDate).then(val => {
      // Update the casts map
      this.casts.clear();
      for (const cast of val.data.casts) {
        this.casts.set(cast.uuid, cast);
      }
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });


  /** Takes backend response, updates data structure for one cast. */
  private getOneCastResponse = async (
    uuid: APITypes.CastUUID,
  ): Promise<OneCastResponse> =>
    this.requestOneCast(uuid).then(val => {
      // Update cast in map
      this.casts.set(val.data.cast.uuid, val.data.cast);
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });


  /** Sends backend request and awaits response. */
  private setCastResponse = async (
    cast: Cast,
  ): Promise<HttpResponse<any>> =>
    this.requestCastSet(cast);


  /** Sends backend request and awaits response. */
  private deleteCastResponse = async (
    cast: Cast,
  ): Promise<HttpResponse<any>> =>
    this.requestCastDelete(cast);


}
