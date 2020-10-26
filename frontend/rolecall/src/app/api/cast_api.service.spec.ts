import {HttpClient} from '@angular/common/http';

import {LoggingService} from '../services/logging.service';
import {HeaderUtilityService} from '../services/header-utility.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

import {CastApi} from './cast_api.service';
import {PieceApi} from './piece_api.service';

describe('CastApiService', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeHttpClient = {} as HttpClient;
  const fakePieceApi = {} as PieceApi;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: CastApi;

  beforeEach(() => {
    service = new CastApi(fakeLoggingService, fakeHttpClient, fakePieceApi,
        fakeHeaderUtilityService, fakeResponseStatusHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
