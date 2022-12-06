
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { LoggingService } from '../services/logging.service';

import { CrudApi } from '../api/crud-api.service';
import { PictureApi } from '../api/picture-api.service';
// import { MockUserBackend } from '../mocks/mock-user-backend';
// import { DataCache } from '../utils/data-cache';
import * as APITypes from 'src/api-types';

import { UserApi } from './user-api.service';
// import { LoggingService } from '../services/logging.service';


describe('UserApi', () => {
  let service: UserApi;
  // const mockBackend = new MockUserBackend<APITypes.UserUUID>();
  // let cache: DataCache<APITypes.UserUUID>;
  // let loggingService = new LoggingService();

  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeRespHandler = {} as ResponseStatusHandlerService;
  const fakeLoggingService = {} as LoggingService;
  const fakePictureApi = {} as PictureApi;

  const crudApi = new CrudApi<APITypes.UserUUID>(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    fakeLoggingService,
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [
        // {
        //   provide: HttpClient,
        //   useValue: fakeHttpClient,
        // }, {
        //   provide: ResponseStatusHandlerService,
        //   useValue: fakeResponseStatusHandlerService,
        // },
      ],
    });
    // service = TestBed.inject(UserApi);
    // mockBackend = new MockUserBackend<APITypes.UserUUID>();
    // service.mockBackend = mockBackend;

    // cache = new DataCache<APITypes.UserUUID>(
    //   'User',
    //   'api/user',
    //   'userid',

    //   service.crudApi,

    //   service.getIx,
    //   service.convertRawToUser,
    //   service.convertUserToRaw,
    //   service.userCmp,

    //   new MockUserBackend(),
    // );
    // service.cache = cache;
    // service.requestAllUsers = ((): Promise<CacheLoadReturn> =>
    //   mockBackend.requestAllUsers()
    // );
    // service.requestOneUser = ((uuid): Promise<CacheWarningsReturn> =>
    //   mockBackend.requestOneUser(uuid)
    // );
    // service.requestUserSet = ((user): Promise<ItemStdReturn> =>
    //   mockBackend.requestUserSet(user)
    // );
    service = new UserApi(
      crudApi,
      fakePictureApi
    );

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Requires mock backend to be true
  // it('should return all users', async () => {
  //   const items = await service.cache.loadAll();
  //   expect(items.length).toEqual(mockBackend.mockDb.length);
  // });
});
