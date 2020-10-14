import {HttpClient, HttpResponse} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {APITypes} from 'src/api_types';
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
}

export type AllUnavailbilitiesResponse = {
  'data':
      {
        'id': number,
        'userId': number,
        'description': string,
        'startDate': number
        'endDate': number
      }[]
  'warnings': []
}

export type OneUnavailbilityResponse = {
  'data':
      {
        'id': number,
        'userId': number,
        'description': string,
        'startDate': number
        'endDate': number
      }
  'warnings': []
}

const SixMonthInMS = 6 * 2629800000;

/**
 * A service responsible for interfacing with the Unavailability APIs
 * and keeping track of unavailability data.
 */
@Injectable({
  providedIn: 'root'
})
export class UnavailabilityApi {

  /** Mock backend */
  mockBackend: MockUnavailabilityBackend = new MockUnavailabilityBackend();

  constructor(private loggingService: LoggingService,
              private http: HttpClient,
              private headerUtil: HeaderUtilityService,
              private respHandler: ResponseStatusHandlerService) {
  }

  /** Hits backend with all unavailabilites GET request */
  async requestAllUnavailabilites(): Promise<AllUnavailbilitiesResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllUnavailabilites();
    }
    return this.http.get<AllUnavailbilitiesResponse>(
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
            (resp) => this.respHandler.checkResponse<AllUnavailbilitiesResponse>(
                resp));
  }

  /** Hits backend with one unavailability GET request */
  requestOneUnavailability(uuid: APITypes.UnavailabilityUUID): Promise<OneUnavailbilityResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestOneUnavailability(uuid);
    }
    return this.mockBackend.requestOneUnavailability(uuid);
  };

  /** Hits backend with create/edit unav POST request */
  async requestUnavailabilitySet(unav: Unavailability): Promise<HttpResponse<any>> {
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

  /** Hits backend with delete unav request */
  async requestUnavailabilityDelete(unav: Unavailability): Promise<HttpResponse<any>> {
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

  /** All the loaded unavs mapped by UUID */
  unavailabilities: Map<APITypes.UnavailabilityUUID, Unavailability> = new Map<APITypes.UnavailabilityUUID, Unavailability>();

  /** Emitter that is called whenever unavs are loaded */
  unavailabilityEmitter: EventEmitter<Unavailability[]> = new EventEmitter();

  /** Takes backend response, updates data structures for all unavs */
  private getAllUnavailabilitiesResponse(): Promise<AllUnavailbilitiesResponse> {
    return this.requestAllUnavailabilites().then(val => {
      // Update the unavailabilites map
      this.unavailabilities.clear();
      for (let unav of val.data) {
        this.unavailabilities.set(unav.id, unav);
      }
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Takes backend response, updates data structure for one unav */
  private getOneUnavailabilityResponse(uuid: APITypes.UnavailabilityUUID): Promise<OneUnavailbilityResponse> {
    return this.requestOneUnavailability(uuid).then(val => {
      // Update unav in map
      this.unavailabilities.set(val.data.id, val.data);
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Sends backend request and awaits reponse */
  private setUnavailabilityResponse(unav: Unavailability): Promise<HttpResponse<any>> {
    return this.requestUnavailabilitySet(unav);
  }

  /** Sends backend request and awaits reponse */
  private deleteUnavailabilityResponse(unav: Unavailability): Promise<HttpResponse<any>> {
    return this.requestUnavailabilityDelete(unav);
  }

  /** Gets all the unavs from the backend and returns them */
  getAllUnavailabilities(): Promise<Unavailability[]> {
    return this.getAllUnavailabilitiesResponse().then(val => {
      this.unavailabilityEmitter.emit(
          Array.from(this.unavailabilities.values()));
      return val;
    }).then(val => val.data).catch(err => {
      return [];
    });
  }

  /** Gets a specific unav from the backend by UUID and returns it */
  getUnavailability(uuid: APITypes.UnavailabilityUUID): Promise<Unavailability> {
    return this.getOneUnavailabilityResponse(uuid).then(val => {
      this.unavailabilityEmitter.emit(
          Array.from(this.unavailabilities.values()));
      return val;
    }).then(val => val.data);
  }

  /** Requests an update to the backend which may or may not be successful,
   * depending on whether or not the unav is valid, as well as if the backend
   * request fails for some other reason.
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

  /** Requests for the backend to delete the unav */
  deleteUnavailability(unav: Unavailability): Promise<APITypes.SuccessIndicator> {
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
