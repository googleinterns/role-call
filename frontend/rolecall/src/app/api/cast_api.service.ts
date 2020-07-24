import { HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { APITypes } from 'src/types';
import { MockCastBackend } from '../mocks/mock_cast_backend';
import { LoggingService } from '../services/logging.service';

export type Cast = {
  uuid: string;
  name: string;
  segment: string;
  filled_positions: {
    position_uuid: string,
    groups: {
      group_index: number,
      members: string[]
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

  constructor(private loggingService: LoggingService) { }

  /** Hits backend with all casts GET request */
  requestAllCasts(): Promise<AllCastsResponse> {
    return this.mockBackend.requestAllCasts();
  }

  /** Hits backend with one cast GET request */
  requestOneCast(uuid: APITypes.UserUUID): Promise<OneCastResponse> {
    return this.mockBackend.requestOneCast(uuid);
  };

  /** Hits backend with create/edit cast POST request */
  requestCastSet(cast: Cast): Promise<HttpResponse<any>> {
    return this.mockBackend.requestCastSet(cast);
  }
  /** 
   * Hits backend with delete cast POST request */
  requestCastDelete(cast: Cast): Promise<HttpResponse<any>> {
    return this.mockBackend.requestCastDelete(cast);
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
      this.castEmitter.emit(Array.from(this.casts.values()));
      return val;
    }).then(val => val.data.casts);
  }

  /** Gets a specific cast from the backend by UUID and returns it */
  getCast(uuid: APITypes.CastUUID): Promise<Cast> {
    return this.getOneCastResponse(uuid).then(val => {
      this.castEmitter.emit(Array.from(this.casts.values()));
      return val;
    }).then(val => val.data.cast);
  }

  /** Requests an update to the backend which may or may not be successful,
   * depending on whether or not the cast is valid, as well as if the backend
   * request fails for some other reason.
   */
  setCast(cast: Cast): Promise<APITypes.SuccessIndicator> {
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


}
