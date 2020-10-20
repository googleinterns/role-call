import {HttpClient} from '@angular/common/http';

import {LoggingService} from '../services/logging.service';
import {HeaderUtilityService} from '../services/header-utility.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

import {PerformanceApi} from './performance-api.service';

describe('PerformanceApiService', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: PerformanceApi;

  beforeEach(() => {
    service = new PerformanceApi(fakeLoggingService, fakeHttpClient,
        fakeHeaderUtilityService, fakeResponseStatusHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
