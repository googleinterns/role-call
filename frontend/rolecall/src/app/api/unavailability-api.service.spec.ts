// import { HttpClient } from '@angular/common/http';
// import { LoggingService } from '../services/logging.service';
// import { HeaderUtilityService } from '../services/header-utility.service';
// import { ResponseStatusHandlerService,
// } from '../services/response-status-handler.service';

import * as APITypes from 'src/api-types';
import { CrudApi } from './crud-api.service';

import { UnavailabilityApi } from './unavailability-api.service';

describe('UnavailabilityApiService', () => {
  // const fakeLoggingService = {} as LoggingService;
  // const fakeHttpClient = {} as HttpClient;
  // const fakeHeaderUtilityService = {} as HeaderUtilityService;
  // const fakeResponseStatusHandlerService =
  // {} as ResponseStatusHandlerService;
  const fakeCrudApi = {} as CrudApi<APITypes.UnavailabilityUUID>;

  let service: UnavailabilityApi;

  beforeEach(() => {
    service = new UnavailabilityApi(
      // fakeLoggingService,
      // fakeHttpClient,
      // fakeHeaderUtilityService,
      // fakeResponseStatusHandlerService,
      fakeCrudApi,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
