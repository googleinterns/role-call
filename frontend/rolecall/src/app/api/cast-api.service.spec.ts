import {HttpClient} from '@angular/common/http';

import {LoggingService} from '../services/logging.service';
import {HeaderUtilityService} from '../services/header-utility.service';
import {ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import {CastApi} from './cast_api.service';
import {SegmentApi} from './segment-api.service';

describe('CastApiService', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeHttpClient = {} as HttpClient;
  const fakeSegmentApi = {} as SegmentApi;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: CastApi;

  beforeEach(() => {
    service = new CastApi(fakeLoggingService, fakeHttpClient, fakeSegmentApi,
        fakeHeaderUtilityService, fakeResponseStatusHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
