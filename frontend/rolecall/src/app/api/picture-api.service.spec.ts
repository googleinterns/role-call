
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockPictureBackend } from '../mocks/mock-picture-backend';
import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import { PictureApi, OnePictureResponse, PictureSetResponse
} from './picture-api.service';

describe('PictureApi', () => {
  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: PictureApi;
  let mockBackend: MockPictureBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [{
          provide: HttpClient, useValue: fakeHttpClient,
        }, {
          provide: ResponseStatusHandlerService,
          useValue: fakeResponseStatusHandlerService,
        },
      ],
    });
    service = new PictureApi(
      fakeHttpClient,
      fakeResponseStatusHandlerService,
      fakeHeaderUtilityService,
    );
    service = TestBed.inject(PictureApi);
    mockBackend = new MockPictureBackend();
    service.mockBackend = mockBackend;
    service.requestOnePicture = ((uuid): Promise<OnePictureResponse> =>
      mockBackend.requestOnePicture(uuid)
    );
    service.requestPictureSet = ((user): Promise<PictureSetResponse> =>
      mockBackend.requestPictureSet(user)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
