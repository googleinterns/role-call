
import {TestBed, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {MatFormFieldModule} from '@angular/material/form-field';

import {HttpClient} from '@angular/common/http';

import {LoggingService} from '../services/logging.service';
import {HeaderUtilityService} from '../services/header-utility.service';
import {ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import {PieceApi} from './piece_api.service';

describe('PieceApiService', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: PieceApi;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          PieceApi,
        ],
        imports: [
          MatFormFieldModule,
          NoopAnimationsModule,
        ]
      })
      .compileComponents();
    }));

  beforeEach(() => {
    service = new PieceApi(fakeLoggingService, fakeHttpClient,
        fakeResponseStatusHandlerService, fakeHeaderUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
