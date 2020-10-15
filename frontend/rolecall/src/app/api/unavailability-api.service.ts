import {HttpClient, HttpResponse} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import * as APITypes from 'src/api_types';
import {environment} from 'src/environments/environment';

import {MockUnavailabilityBackend} from '../mocks/mock_unavailability_backend';
import {HeaderUtilityService} from '../services/header-utility.service';
import {LoggingService} from '../services/logging.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

export type Unavailability = {
  'id': number,
  'userId': number,
  'description': string,
  'startDate': number
  'endDate': number
};

export type AllUnavailabilitiesResponse = {
  'data':
      {
        'id': number,
        'userId': number,
        'description': string,
        'startDate': number
        'endDate': number
      }[]
  'warnings': []
};

export type OneUnavailabilityResponse = {
  'data':
      {
        'id': number,
        'userId': number,
        'description': string,
        'startDate': number
        'endDate': number
      }
  'warnings': []
};

const SixMonthInMS = 6 * 2629800000;

/**
 * A service responsible for interfacing with the Unavailability APIs
 * and keeping track of unavailability data.
 */
@Injectable({providedIn: 'root'})
export class UnavailabilityApi {
  /** Mock backend. */
  mockBackend: MockUnavailabilityBackend = new MockUnavailabilityBackend();

  /** All the loaded unavailabilities mapped by UUID. */
  unavailabilities: Map<APITypes.UnavailabilityUUID, Unavailability> =
      new Map<APITypes.UnavailabilityUUID, Unavailability>();

  /** Emitter that is called whenever unavailabilities are loaded. */
  unavailabilityEmitter: EventEmitter<Unavailability[]> = new EventEmitter();

  constructor(
      private loggingService: LoggingService,
      private http: HttpClient,
      private headerUtil: HeaderUtilityService,
      private respHandler: ResponseStatusHandlerService) {
  }

  /** Hits backend with all unavailabilities GET request. */
  async requestAllUnavailabilities(): Promise<AllUnavailabilitiesResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllUnavailabilites();
    }
    return this.http.get<AllUnavailabilitiesResponse>(
        environment.backendURL + 'api/unavailable?startdate=' + (Date.now()
                                                                 - SixMonthInMS)
        + '&enddate=' + (Date.now() + SixMonthInMS), {
              headers: await this.headerUtil.generateHeader(),
              observe: 'response',
              withCredentials: true
            })
        .toPromise()
        .catch((errorResp) => errorResp)
        .then(
            (resp) =>
                this.respHandler.checkResponse<AllUnavailabilitiesResponse>(
                    resp));
  }

  /** Hits backend with one unavailability GET request. */
  requestOneUnavailability(uuid: APITypes.UnavailabilityUUID):
      Promise<OneUnavailabilityResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestOneUnavailability(uuid);
    }
    return this.mockBackend.requestOneUnavailability(uuid);
  }

  /** Hits backend with create/edit unavailability POST request. */
  async requestUnavailabilitySet(unav: Unavailability):
      Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestUnavailabilitySet(unav);
    }
    // If this is an unavailability from the backend, do a PATCH, else do a POST
    if (this.unavailabilities.has(unav.id)) {
      // Do patch
      return this.http.patch(environment.backendURL + 'api/unavailable', unav, {
            headers: await this.headerUtil.generateHeader(),
            observe: 'response',
            withCredentials: true
          })
          .toPromise()
          .catch((errorResp) => errorResp)
          .then((resp) => this.respHandler.checkResponse<any>(resp));
    } else {
      // Do post
      unav.id = undefined;
      return this.http.post(environment.backendURL + 'api/unavailable', unav, {
            observe: 'response',
            headers: await this.headerUtil.generateHeader(),
            withCredentials: true
          })
          .toPromise()
          .catch((errorResp) => errorResp)
          .then((resp) => this.respHandler.checkResponse<any>(resp));
    }
  }

  /** Hits backend with delete unavailability request. */
  async requestUnavailabilityDelete(unav: Unavailability):
      Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestUnavailabilityDelete(unav);
    }
    return this.http.delete(
        environment.backendURL + 'api/unavailable?unavailableid=' + unav.id, {
              observe: 'response',
              headers: await this.headerUtil.generateHeader(),
              withCredentials: true
            })
        .toPromise()
        .catch((errorResp) => errorResp)
        .then((resp) => this.respHandler.checkResponse<any>(resp));
  }

  /**
   * Takes backend response, updates data structures for all unavailabilities.
   */
  private getAllUnavailabilitiesResponse():
      Promise<AllUnavailabilitiesResponse> {
    return this.requestAllUnavailabilities().then(val => {
      // Update the unavailabilities map
      this.unavailabilities.clear();
      for (const unav of val.data) {
        this.unavailabilities.set(unav.id, unav);
      }
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Takes backend response, updates data structure for one unavailability. */
  private getOneUnavailabilityResponse(uuid: APITypes.UnavailabilityUUID):
      Promise<OneUnavailabilityResponse> {
    return this.requestOneUnavailability(uuid).then(val => {
      // Update unavailability in map
      this.unavailabilities.set(val.data.id, val.data);
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Sends backend request and awaits response. */
  private setUnavailabilityResponse(unav: Unavailability):
      Promise<HttpResponse<any>> {
    return this.requestUnavailabilitySet(unav);
  }

  /** Sends backend request and awaits response. */
  private deleteUnavailabilityResponse(unav: Unavailability):
      Promise<HttpResponse<any>> {
    return this.requestUnavailabilityDelete(unav);
  }

  /** Gets all the unavailabilities from the backend and returns them. */
  getAllUnavailabilities(): Promise<Unavailability[]> {
    return this.getAllUnavailabilitiesResponse().then(val => {
      this.unavailabilityEmitter.emit(
          Array.from(this.unavailabilities.values()));
      return val;
    }).then(val => val.data).catch(err => {
      return [];
    });
  }

  /** Gets a specific unavailability from the backend by UUID and returns it. */
  getUnavailability(uuid: APITypes.UnavailabilityUUID):
      Promise<Unavailability> {
    return this.getOneUnavailabilityResponse(uuid).then(val => {
      this.unavailabilityEmitter.emit(
          Array.from(this.unavailabilities.values()));
      return val;
    }).then(val => val.data);
  }

  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the unavailability is valid, as well as if the
   * backend request fails for some other reason.
   */
  setUnavailability(unav: Unavailability): Promise<APITypes.SuccessIndicator> {
    return this.setUnavailabilityResponse(unav).then(val => {
      this.getAllUnavailabilities();
      return {
        successful: true
      };
    }).catch(reason => {
      return Promise.resolve({
        successful: false,
        error: reason
      });
    });
  }

  /** Requests for the backend to delete the unavailability. */
  deleteUnavailability(unav: Unavailability):
      Promise<APITypes.SuccessIndicator> {
    return this.deleteUnavailabilityResponse(unav).then(val => {
      this.getAllUnavailabilities();
      return {
        successful: true
      };
    }).catch(reason => {
      return {
        successful: false,
        error: reason
      };
    });
  }
}
