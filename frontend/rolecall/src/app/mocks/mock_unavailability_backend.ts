import {HttpResponse} from '@angular/common/http';
import {APITypes} from 'src/api_types';
import {AllUnavailbilitiesResponse, OneUnavailbilityResponse, Unavailability} from '../api/unavailability-api.service';

/**
 * Mocks the unavailability backend responses
 */
export class MockUnavailabilityBackend {

  /** Mock unavailability database */
  mockUnavailabilityDB: Unavailability[] = [
    {
      id: 1,
      description: 'example desc',
      userId: 206,
      startDate: 1,
      endDate: 999999
    }
  ];

  /** Mocks backend response */
  requestAllUnavailabilites(): Promise<AllUnavailbilitiesResponse> {
    return Promise.resolve({
      data: this.mockUnavailabilityDB,
      warnings: []
    });
  }

  /** Mocks backend response */
  requestOneUnavailability(uuid: APITypes.UnavailabilityUUID): Promise<OneUnavailbilityResponse> {
    return Promise.resolve({
      data: this.mockUnavailabilityDB.find(val => {
        return val.id == uuid || val.id === uuid;
      }),
      warnings: []
    });
  };

  /** Mock setting the unavailability */
  requestUnavailabilitySet(unav: Unavailability): Promise<HttpResponse<any>> {
    let userInd = this.mockUnavailabilityDB.findIndex(
        (val) => val.id == unav.id);
    if (userInd == -1) {
      this.mockUnavailabilityDB.push(unav);
    } else {
      this.mockUnavailabilityDB[userInd] = unav;
    }
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

  /** Mocks unavailability delete response */
  requestUnavailabilityDelete(unav: Unavailability): Promise<HttpResponse<any>> {
    this.mockUnavailabilityDB =
        this.mockUnavailabilityDB.filter(val => val.id != unav.id);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

}
