import { HttpClient } from '@angular/common/http';

import { LoggingService } from '../services/logging.service';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import { CastApi } from './cast-api.service';
import { SegmentApi } from './segment-api.service';
import { GlobalsService } from '../services/globals.service';

describe('CastApiService', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeHttpClient = {} as HttpClient;
  const fakeSegmentApi = {} as SegmentApi;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;
  const g = new GlobalsService();

  let service: CastApi;

  beforeEach(() => {
    service = new CastApi(fakeLoggingService, fakeHttpClient, fakeSegmentApi,
        fakeHeaderUtilityService, fakeResponseStatusHandlerService, g);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
