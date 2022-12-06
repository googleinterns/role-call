import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockUserBackend } from '../mocks/mock-user-backend';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import { CrudApi } from './crud-api.service';
import * as APITypes from 'src/api-types';

import { CacheLoadReturn, CacheGetReturn, ItemStdReturn,
} from '../utils/data-cache';

describe('CrudApi', () => {
  const fakeHttpClient = {} as HttpClient;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: CrudApi<APITypes.UserUUID>;
  let mockBackend: MockUserBackend<APITypes.UserUUID>;
  // let cache: DataCache<APITypes.UserUUID>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [{
          provide: HttpClient,
          useValue: fakeHttpClient,
        }, {
          provide: ResponseStatusHandlerService,
          useValue: fakeResponseStatusHandlerService,
        },
      ],
    });
    service = TestBed.inject(CrudApi);
    mockBackend = new MockUserBackend();
    service.requestAllItems = ((
      _cache
    ): Promise<CacheLoadReturn> =>
      mockBackend.requestAllMocks()
    );
    service.requestOneItem = ((
      cache, uuid,
    ): Promise<CacheGetReturn> =>
      mockBackend.requestOneMock(uuid, cache.getIx)
    );
    service.requestItemSet = ((
      cache, item,
    ): Promise<ItemStdReturn> =>
      mockBackend.requestMockSet(item, cache.getIx)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should return all users', async () => {
  //   const users = await service.loadAllItems();
  //   expect(users.length).toEqual(mockBackend.mockUserDB.length);
  // });
});
