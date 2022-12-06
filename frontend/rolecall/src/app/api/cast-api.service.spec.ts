import { HttpClient } from '@angular/common/http';

// import { LoggingService } from '../services/logging.service';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import * as APITypes from 'src/api-types';

import { CastApi } from './cast-api.service';
import { SegmentApi } from './segment-api.service';
import { ContextService } from '../services/context.service';
import { CrudApi } from './crud-api.service';

describe('CastApiService', () => {
  // const fakeLoggingService = {} as LoggingService;
  const fakeHttpClient = {} as HttpClient;
  const fakeSegmentApi = {} as SegmentApi;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;
  const g = new ContextService();
  const fakeCrudApi = {} as CrudApi<APITypes.CastUUID>;


  let service: CastApi;

  beforeEach(() => {
    service = new CastApi(
      fakeHttpClient,
      fakeHeaderUtilityService,
      fakeResponseStatusHandlerService,
      fakeSegmentApi,
      g,
      fakeCrudApi,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
