import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { MockCastBackend } from '../mocks/mock_cast_backend';
import { LoggingService } from '../services/logging.service';
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

export type Cast = {
  uuid: string;
  name: string;
  segment: string;
  filled_positions: {
    position_uuid: string,
    groups: {
      position_uuid?: string,
      group_index: number,
      members: { uuid: string, position_number: number }[]
    }[]
  }[];
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

@Injectable({
  providedIn: 'root'
})
export class CastApi {


  /** Mock backend */
  mockBackend: MockCastBackend = new MockCastBackend();

  workingCasts: Map<APITypes.CastUUID, Cast> = new Map();

  rawCasts: RawCast[] = [];

  constructor(private loggingService: LoggingService, private http: HttpClient, private pieceAPI: PieceApi) { }

  /** Hits backend with all casts GET request */
  async requestAllCasts(): Promise<AllCastsResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllCasts();
    }
    await this.pieceAPI.getAllPieces();
    return this.http.get<AllRawCastsResponse>(environment.backendURL + "api/cast").toPromise().then((val) => {
      this.rawCasts = val.data;
      let allPositions: Position[] = [];
      Array.from(this.pieceAPI.pieces.values()).forEach(piece => {
        allPositions.push(...piece.positions);
      });
      return {
        data: {
          casts: val.data.map(rawCast => {
            let groups: {
              position_uuid: string,
              group_index: number,
              members: { uuid: string, position_number: number }[]
            }[] = [];
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
            }
            let uniquePositionIDs = new Set<number>();
            rawCast.subCasts.forEach(val => uniquePositionIDs.add(val.positionId));
            return {
              uuid: String(rawCast.id),
              name: rawCast.name,
              segment: String(rawCast.sectionId),
              filled_positions: Array.from(uniquePositionIDs.values()).map(positionID => {
                return {
                  position_uuid: String(allPositions.find(pos => Number(pos.uuid) == positionID).uuid),
                  groups: groups.filter(g => g.position_uuid == String(allPositions.find(pos => Number(pos.uuid) == positionID).uuid))
                }
              })
            }
          })
        },
        warnings: val.warnings
      }
    }).then(val => { return val }).catch(err => {
      this.loggingService.logError(err);
      return Promise.resolve({
        data: {
          casts: []
        },
        warnings: []
      })
    });
  }

  /** Hits backend with one cast GET request */
  requestOneCast(uuid: APITypes.UserUUID): Promise<OneCastResponse> {
    return this.mockBackend.requestOneCast(uuid);
  };

  /** Hits backend with create/edit cast POST request */
  requestCastSet(cast: Cast): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestCastSet(cast);
    }
    if (this.hasCast(cast.uuid)) {
      // Do patch
      return this.http.delete(environment.backendURL + 'api/cast?castid=' + cast.uuid, { observe: "response" }).toPromise().then(na => {
        let allSubCasts: RawSubCast[] = [];
        let allPositions: Position[] = [];
        Array.from(this.pieceAPI.pieces.values()).forEach(piece => {
          allPositions.push(...piece.positions);
        });
        for (let filledPos of cast.filled_positions) {
          for (let group of filledPos.groups) {
            allSubCasts.push({
              id: undefined,
              positionId: Number(allPositions.find(val2 => {
                return val2.uuid == filledPos.position_uuid;
              }).uuid),
              castNumber: group.group_index,
              members: group.members.map(mem => {
                return {
                  id: undefined,
                  userId: Number(mem.uuid),
                  order: mem.position_number
                }
              })
            });
          }
        }
        let rawCast: RawCast = {
          id: undefined,
          name: cast.name,
          notes: "",
          sectionId: Number(cast.segment),
          subCasts: allSubCasts
        }
        return this.http.post(environment.backendURL + "api/cast", rawCast, { observe: "response" }).toPromise().then(val => {
          return val;
        }).catch(val => {
          return {
            status: 400
          } as HttpResponse<any>;
        });
      });
    } else {
      // Do post
      let allSubCasts: RawSubCast[] = [];
      let allPositions = [];
      Array.from(this.pieceAPI.pieces.values()).forEach(piece => {
        allPositions.push(...piece.positions);
      });
      for (let filledPos of cast.filled_positions) {
        for (let group of filledPos.groups) {
          allSubCasts.push({
            id: undefined,
            positionId: Number(allPositions.find(val2 => {
              return val2.uuid == filledPos.position_uuid;
            }).uuid),
            castNumber: group.group_index,
            members: group.members.map(mem => {
              return {
                id: undefined,
                userId: Number(mem.uuid),
                order: mem.position_number
              }
            })
          });
        }
      }
      let rawCast: RawCast = {
        id: undefined,
        name: cast.name,
        notes: "",
        sectionId: Number(cast.segment),
        subCasts: allSubCasts
      }
      return this.http.post(environment.backendURL + "api/cast", rawCast, { observe: "response" }).toPromise().then(val => {
        return val;
      }).catch(val => {
        this.loggingService.logError(val);
        return {
          status: 400
        } as HttpResponse<any>;
      });
    }
  }
  /** 
   * Hits backend with delete cast POST request */
  requestCastDelete(cast: Cast): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestCastDelete(cast);
    }
    return this.http.delete(environment.backendURL + 'api/cast?castid=' + cast.uuid, { observe: "response" }).toPromise().then(val => {
      return val;
    }).catch(val => {
      this.loggingService.logError(val);
      return {
        status: 400
      } as HttpResponse<any>;
    });
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
      this.getAllCasts();
      return Promise.resolve({
        successful: true
      });
    }
    if (this.workingCasts.has(cast.uuid)) {
      this.workingCasts.delete(cast.uuid);
    }
    return this.setCastResponse(cast).then(val => {
      if (val.status == 200) {
        this.getAllCasts();
        return {
          successful: true
        }
      } else {
        return {
          successful: false,
          error: "Server failed, try again."
        }
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
      if (val.status == 200) {
        this.getAllCasts();
        return {
          successful: true
        }
      } else {
        return {
          successful: false,
          error: "Server failed, try again."
        }
      }
    });
  }

  hasCast(castUUID: APITypes.CastUUID) {
    return this.casts.has(castUUID) || this.workingCasts.has(castUUID);
  }

  castFromUUID(castUUID: APITypes.CastUUID) {
    if (this.casts.has(castUUID)) {
      return this.casts.get(castUUID);
    }
    if (this.workingCasts.has(castUUID)) {
      return this.workingCasts.get(castUUID);
    }
    return undefined;
  }

}
