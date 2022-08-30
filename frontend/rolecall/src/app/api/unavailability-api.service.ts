/* eslint-disable @typescript-eslint/naming-convention */

import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

import { MockUnavailabilityBackend,
} from '../mocks/mock-unavailability-backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { LoggingService } from '../services/logging.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';


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
      private respHandler: ResponseStatusHandlerService,
  ) {
  }

  /** Hits backend with all unavailabilities GET request. */
  requestAllUnavailabilities = async (
  ): Promise<AllUnavailabilitiesResponse> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllUnavailabilites();
    }
    return lastValueFrom(this.http.get<AllUnavailabilitiesResponse>(
        environment.backendURL + 'api/unavailable?startdate=' +
          (Date.now() - SixMonthInMS) +
          '&enddate=' +
          (Date.now() + SixMonthInMS), {
            headers: await this.headerUtil.generateHeader(),
            observe: 'response',
            withCredentials: true
          })
        )
        .catch(errorResp => errorResp)
        .then(resp =>
          this.respHandler.checkResponse<AllUnavailabilitiesResponse>(resp));
  };

  // Never called (and only calls mock)
  /** Hits backend with one unavailability GET request. */
  requestOneUnavailability = async (
    uuid: APITypes.UnavailabilityUUID,
  ): Promise<OneUnavailabilityResponse> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestOneUnavailability(uuid);
    }
    return this.mockBackend.requestOneUnavailability(uuid);
  };

  /** Hits backend with create/edit unavailability POST request. */
  requestUnavailabilitySet = async (
    unav: Unavailability,
  ): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestUnavailabilitySet(unav);
    }
    if (!unav.reason) {
      unav.reason = 'UNDEF';
    }
    // If this is an unavailability from the backend, do a PATCH, else do a POST
    if (this.unavailabilities.has(unav.id)) {
      // Do patch
      return lastValueFrom(this.http.patch(
          environment.backendURL + 'api/unavailable', unav, {
            headers: await this.headerUtil.generateHeader(),
            observe: 'response',
            withCredentials: true
          }))
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    } else {
      // Do post
      unav.id = undefined;
      return lastValueFrom(this.http.post(
          environment.backendURL + 'api/unavailable', unav, {
            observe: 'response',
            headers: await this.headerUtil.generateHeader(),
            withCredentials: true
          }))
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    }
  };

  /** Hits backend with delete unavailability request. */
  requestUnavailabilityDelete = async (
    unav: Unavailability,
  ): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestUnavailabilityDelete(unav);
    }
    return lastValueFrom(this.http.delete(
        environment.backendURL + 'api/unavailable?unavailableid=' + unav.id, {
          observe: 'response',
          headers: await this.headerUtil.generateHeader(),
          withCredentials: true
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
  };

  /** Gets all the unavailabilities from the backend and returns them. */
  getAllUnavailabilities = async (): Promise<Unavailability[]> =>
    this.getAllUnavailabilitiesResponse().then(val => {
        this.unavailabilityEmitter.emit(
            Array.from(this.unavailabilities.values()));
        return val;
      })
      .then(val => val.data)
      .catch(() =>
        []
  );

  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the unavailability is valid, as well as if the
   * backend request fails for some other reason.
   */
  setUnavailability = async (
    unav: Unavailability,
  ): Promise<APITypes.SuccessIndicator> =>
    this.setUnavailabilityResponse(unav)
        .then(() => {
          this.getAllUnavailabilities();
          return {
            successful: true
          };
        })
        .catch(reason =>
          Promise.resolve({
            successful: false,
            error: reason
          })
        );


  /** Requests for the backend to delete the unavailability. */
  deleteUnavailability = async (
    unav: Unavailability,
  ): Promise<APITypes.SuccessIndicator> =>
    this.deleteUnavailabilityResponse(unav)
        .then(() => {
          this.getAllUnavailabilities();
          return {
            successful: true
          };
        })
        .catch(reason => ({
            successful: false,
            error: reason,
          })
        );


  // Private methods

  /**
   * Takes backend response, updates data structures for all unavailabilities.
   */
   private getAllUnavailabilitiesResponse = async (
  ): Promise<AllUnavailabilitiesResponse> =>
    this.requestAllUnavailabilities().then(val => {
      // Update the unavailabilities map
      this.unavailabilities.clear();
      for (const unav of val.data) {
        if (!unav.reason) {
          unav.reason = 'UNDEF';
        }
        this.unavailabilities.set(unav.id, unav);
      }
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    }
  );

  /** Sends backend request and awaits response. */
  private setUnavailabilityResponse = async (
    unav: Unavailability,
  ): Promise<HttpResponse<any>> =>
    this.requestUnavailabilitySet(unav);


  /** Sends backend request and awaits response. */
  private deleteUnavailabilityResponse = async (
    unav: Unavailability,
  ): Promise<HttpResponse<any>> =>
    this.requestUnavailabilityDelete(unav);



}
