import { HttpClient } from '@angular/common/http';

import { LoggingService } from '../services/logging.service';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import { DashboardApi } from './dashboard-api.service';

describe('DashboardApi', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: DashboardApi;

  beforeEach(() => {
    service = new DashboardApi(fakeLoggingService, fakeHttpClient,
        fakeHeaderUtilityService, fakeResponseStatusHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
