import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { APITypes } from 'src/api_types';
import { environment } from 'src/environments/environment';
import { isNullOrUndefined } from 'util';
import { MockCastBackend } from '../mocks/mock_cast_backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { LoggingService } from '../services/logging.service';
import { ResponseStatusHandlerService } from '../services/response-status-handler.service';
import { PieceApi, Position } from './piece_api.service';

type RawCastMember = {
  id: number,
  userId: number,
  order: number
}

type RawSubCast = {
  id: number,
  positionId: number,
  castNumber: number,
  members: RawCastMember[]
}

type RawCast = {
  id: number,
  name: string,
  notes: string,
  sectionId: number,
  subCasts: RawSubCast[]
}

type AllRawCastsResponse = {
  data: RawCast[],
  warnings: string[]
}

type OneRawCastsResponse = {
  data: RawCast,
  warnings: string[]
}

export type CastMember = {
  uuid: string;
  position_number: number;
}

export type CastGroup = {
  position_uuid?: string;
  group_index: number;
  members: CastMember[];
}

export type CastPosition = {
  position_uuid: string;
  groups: CastGroup[];
}

export type Cast = {
  uuid: string;
  name: string;
  segment: string;
  castCount: number;
  filled_positions: CastPosition[];
}

export type AllCastsResponse = {
  data: {
    casts: Cast[]
  },
  warnings: string[]
};

export type OneCastResponse = {
  data: {
    cast: Cast
  },
  warnings: string[]
};

/**
 * A service responsible for interfacing with the Cast APIs,
 * and maintaing all cast objects in the system, including those
 * acting as intermediaries for a performance's custom casts
 */
@Injectable({
  providedIn: 'root'
})
export class CastApi {

  // The last saved id (every time a cast is saved it receives a new id)
  lastSavedCastId: number;

  /** Mock backend */
  mockBackend: MockCastBackend = new MockCastBackend();

  /** The casts which are not on the backend but are currently needed by
   * multiple components (namely the performance editor and cast drag and drop).
   * This should not include the cast creator's casts, it should only be the casts
   * which will not be set as cast objects on the backend, i.e. the cast objects
   * needed to pass between the cast drag and drop and the performance editor,
   * since these casts will be set as performance groups, not casts.
   */
  workingCasts: Map<APITypes.CastUUID, Cast> = new Map();

  /** The raw casts handed over by the backend */
  rawCasts: RawCast[] = [];

  constructor(private loggingService: LoggingService, private http: HttpClient, private pieceAPI: PieceApi,
    private headerUtil: HeaderUtilityService, private respHandler: ResponseStatusHandlerService) { }

  /** Hits backend with all casts GET request */
  async requestAllCasts(): Promise<AllCastsResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllCasts();
    }
    await this.pieceAPI.getAllPieces();
    let header = await this.headerUtil.generateHeader();
    return this.http.get<AllRawCastsResponse>(environment.backendURL + "api/cast", {
        headers: header,
        observe: "response",
        withCredentials: true
      })
      .toPromise()
      .catch((errorResp) => errorResp)
      .then((resp) => this.respHandler.checkResponse<AllRawCastsResponse>(resp)).then((result) => {
        this.rawCasts = result.data;
        let allPositions: Position[] = [];
        Array.from(this.pieceAPI.pieces.values()).forEach(piece => {
          allPositions.push(...piece.positions);
        });
        return {
          data: {
            casts: result.data.map(rawCast => {
              let highestCastNumber = 0;
              let groups: CastGroup[] = [];
              for (let rawSubCast of rawCast.subCasts) {
                let foundGroup = groups.find(g => g.position_uuid == String(allPositions.find(pos => Number(pos.uuid) == rawSubCast.positionId).uuid));
                if (foundGroup) {
                  let foundGroupIndex = groups.find(g => g.position_uuid == String(allPositions.find(pos => Number(pos.uuid) == rawSubCast.positionId).uuid) && g.group_index == rawSubCast.castNumber);
                  if (foundGroupIndex) {
                    foundGroupIndex.members = foundGroupIndex.members.concat(rawSubCast.members.map(rawMem => {
                      return {
                        uuid: String(rawMem.userId),
                        position_number: rawMem.order
                      }
                    }));
                  } else {
                    groups.push({
                      position_uuid: String(allPositions.find(pos => Number(pos.uuid) == rawSubCast.positionId).uuid),
                      group_index: rawSubCast.castNumber,
                      members: rawSubCast.members.map(rawMem => {
                        return {
                          uuid: String(rawMem.userId),
                          position_number: rawMem.order
                        }
                      })
                    });
                  }
                } else {
                  groups.push({
                    position_uuid: String(allPositions.find(pos => Number(pos.uuid) == rawSubCast.positionId).uuid),
                    group_index: rawSubCast.castNumber,
                    members: rawSubCast.members.map(rawMem => {
                      return {
                        uuid: String(rawMem.userId),
                        position_number: rawMem.order
                      }
                    })
                  });
                }
                if (highestCastNumber < rawSubCast.castNumber) {
                  highestCastNumber = rawSubCast.castNumber;
                }
              }
              let uniquePositionIDs = new Set<number>();
              rawCast.subCasts.forEach(val => uniquePositionIDs.add(val.positionId));
              return {
                uuid: CastApi.castUUIDFromRaw(rawCast.id),
                name: rawCast.name,
                segment: String(rawCast.sectionId),
                castCount: highestCastNumber + 1,
                filled_positions: Array.from(uniquePositionIDs.values()).map(positionID => {
                  return {
                    position_uuid: String(allPositions.find(pos => Number(pos.uuid) == positionID).uuid),
                    groups: groups.filter(g => g.position_uuid == String(allPositions.find(pos => Number(pos.uuid) == positionID).uuid))
                  }
                })
              }
            })
          },
          warnings: result.warnings
        }
      });
  }

  /** Hits backend with one cast GET request */
  requestOneCast(uuid: APITypes.UserUUID): Promise<OneCastResponse> {
    return this.mockBackend.requestOneCast(uuid);
  };

/** Hits backend with create/edit cast POST request */
async requestCastSet(cast: Cast): Promise<HttpResponse<any>> {
  if (environment.mockBackend) {
    return this.mockBackend.requestCastSet(cast);
  }
  // Check if we have record of the cast and patch if we do
  if (this.hasCast(cast.uuid)) {
    // Do patch
    let header = await this.headerUtil.generateHeader();
    return this.http.delete(environment.backendURL + 'api/cast?castid=' + cast.uuid, {
      headers: header,
      observe: "response",
      withCredentials: true
    }).toPromise().catch((errorResp) => errorResp).then(
        resp => this.respHandler.checkResponse<any>(resp)).then(async na => {
      const rawCast = this.PatchPostPrep(cast);
      return this.http.post(environment.backendURL + "api/cast", rawCast, {
        headers: header,
        observe: "response",
        withCredentials: true
      }).toPromise().catch((errorResp) => errorResp).then(
          resp => this.respHandler.checkResponse<any>(resp));
    });
  } else {
    // Do post
    const rawCast = this.PatchPostPrep(cast);
    let header = await this.headerUtil.generateHeader();
    return this.http.post(environment.backendURL + "api/cast", rawCast, {
      headers: header,
      observe: "response",
      withCredentials: true
    }).toPromise().catch((errorResp) => errorResp).then(
        resp => this.respHandler.checkResponse<any>(resp));
  }
}

  private PatchPostPrep(cast: Cast): RawCast {
    let allSubCasts: RawSubCast[] = [];
    let allPositions: Position[] = [];
    Array.from(this.pieceAPI.pieces.values()).forEach(piece => {
      allPositions.push(...piece.positions);
    });
    for (let filledPos of cast.filled_positions) {
      for (let group of filledPos.groups) {
        allSubCasts.push({
          id: undefined,
          positionId: Number(allPositions.find(
              position =>position.uuid == filledPos.position_uuid).uuid),
          castNumber: group.group_index,
          members: group.members.map(mem => {
            return {
              id: undefined,
              userId: Number(mem.uuid),
              order: mem.position_number
            }
          }),
        });
      }
    }
    let rawCast: RawCast = {
      id: undefined,
      name: cast.name,
      notes: "",
      sectionId: Number(cast.segment),
      subCasts: allSubCasts,
    }
    return rawCast;
  }

  /** 
   * Hits backend with delete cast POST request */
  async requestCastDelete(cast: Cast): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestCastDelete(cast);
    }
    let header = await this.headerUtil.generateHeader();
    return this.http.delete(environment.backendURL + 'api/cast?castid=' + cast.uuid, {
      headers: header,
      observe: "response",
      withCredentials: true
    }).toPromise().catch((errorResp) => errorResp).then((resp) => this.respHandler.checkResponse<any>(resp));
  }

  /** All the loaded casts mapped by UUID */
  casts: Map<APITypes.CastUUID, Cast> = new Map<APITypes.CastUUID, Cast>();

  /** Emitter that is called whenever casts are loaded */
  castEmitter: EventEmitter<Cast[]> = new EventEmitter();

  /** Takes backend response, updates data structures for all users */
  private getAllCastsResponse(): Promise<AllCastsResponse> {
    return this.requestAllCasts().then(val => {
      // Update the casts map
      this.casts.clear();
      for (let cast of val.data.casts) {
        this.casts.set(cast.uuid, cast);
      }
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Takes backend response, updates data structure for one cast */
  private getOneCastResponse(uuid: APITypes.CastUUID): Promise<OneCastResponse> {
    return this.requestOneCast(uuid).then(val => {
      // Update cast in map
      this.casts.set(val.data.cast.uuid, val.data.cast);
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    })
  }

  /** Sends backend request and awaits reponse */
  private setCastResponse(cast: Cast): Promise<HttpResponse<any>> {
    return this.requestCastSet(cast);
  }

  /** Sends backend request and awaits reponse */
  private deleteCastResponse(cast: Cast): Promise<HttpResponse<any>> {
    return this.requestCastDelete(cast);
  }

  /** Gets all the casts from the backend and returns them */
  getAllCasts(): Promise<Cast[]> {
    return this.getAllCastsResponse().then(val => {
      let allCasts = Array.from(this.casts.values()).concat(...this.workingCasts.values());
      this.castEmitter.emit(allCasts);
      return allCasts;
    }).catch(err => {
      return [];
    });
  }

  /** Gets a specific cast from the backend by UUID and returns it */
  getCast(uuid: APITypes.CastUUID): Promise<Cast> {
    return this.getOneCastResponse(uuid).then(val => {
      let allCasts = Array.from(this.casts.values()).concat(...this.workingCasts.values());
      this.castEmitter.emit(allCasts);
      return val.data.cast;
    });
  }

  /** Requests an update to the backend which may or may not be successful,
   * depending on whether or not the cast is valid, as well as if the backend
   * request fails for some other reason.
   */
  setCast(cast: Cast, isWorkingCast?: boolean): Promise<APITypes.SuccessIndicator> {
    if (!isNullOrUndefined(isWorkingCast) && isWorkingCast) {
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
      this.getAllCasts();
      return {
        successful: true
      }
    }).catch(reason => {
      return {
        successful: false,
        error: reason
      }
    });
  }

  /** Requests for the backend to delete the cast */
  deleteCast(cast: Cast): Promise<APITypes.SuccessIndicator> {
    if (this.workingCasts.has(cast.uuid)) {
      this.workingCasts.delete(cast.uuid);
      this.getAllCasts();
      return Promise.resolve({
        successful: true
      });
    }
    return this.deleteCastResponse(cast).then(val => {
      this.casts.delete(cast.uuid);
      this.getAllCasts();
      return {
        successful: true
      }
    }).catch(reason => {
      return {
        successful: false,
        error: reason
      }
    });
  }

  /** Check if the cached casts (working casts and backend casts) includes
   * a cast with a specific UUID
   */
  hasCast(castUUID: APITypes.CastUUID) {
    return this.casts.has(castUUID) || this.workingCasts.has(castUUID);
  }

  /** Return the cast (working or backend) with a specific cast UUID */
  castFromUUID(castUUID: APITypes.CastUUID) {
    if (this.casts.has(castUUID)) {
      return this.casts.get(castUUID);
    }
    if (this.workingCasts.has(castUUID)) {
      return this.workingCasts.get(castUUID);
    }
    return undefined;
  }

  static castUUIDFromRaw(id: number) {
    return String(id);
  }
}
