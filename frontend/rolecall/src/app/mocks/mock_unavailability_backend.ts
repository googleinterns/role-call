import {HttpResponse} from '@angular/common/http';
import * as APITypes from 'src/api_types';

import {AllUnavailabilitiesResponse, OneUnavailabilityResponse, Unavailability,
} from '../api/unavailability-api.service';

/** Mocks the unavailability backend responses. */
export class MockUnavailabilityBackend {

  /** Mock unavailability database. */
  mockUnavailabilityDB: Unavailability[] = [{
      id: 1,
      userId: 206,
      reason: 'INJURY',
      description: 'example desc',
      startDate: 1,
      endDate: 999999
    },
  ];

  /** Mocks backend response. */
  requestAllUnavailabilites = (
  ): Promise<AllUnavailabilitiesResponse> =>
    Promise.resolve({
      data: this.mockUnavailabilityDB,
      warnings: [],
    });


  /** Mocks backend response. */
  requestOneUnavailability = (
    uuid: APITypes.UnavailabilityUUID,
  ): Promise<OneUnavailabilityResponse> =>
    Promise.resolve({
      data: this.mockUnavailabilityDB.find(val =>
        val.id === uuid || val.id === uuid
      ),
      warnings: [],
    });


  /** Mock setting the unavailability. */
  requestUnavailabilitySet = (
    unav: Unavailability,
  ): Promise<HttpResponse<any>> => {
    const userInd = this.mockUnavailabilityDB.findIndex(
        val => val.id === unav.id);
    if (userInd === -1) {
      this.mockUnavailabilityDB.push(unav);
    } else {
      this.mockUnavailabilityDB[userInd] = unav;
    }
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  };

  /** Mocks unavailability delete response. */
  requestUnavailabilityDelete = (
    unav: Unavailability,
  ): Promise<HttpResponse<any>> => {
    this.mockUnavailabilityDB =
        this.mockUnavailabilityDB.filter(val => val.id !== unav.id);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  };
}
