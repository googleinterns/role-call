import {HttpClient, HttpResponse} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {MockUserBackend} from '../mocks/mock-user-backend';
import {ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import {AllUsersResponse, OneUserResponse, UserApi} from './user-api.service';

describe('UserApi', () => {
  const fakeHttpClient = {} as HttpClient;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;

  let service: UserApi;
  let mockBackend: MockUserBackend;

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
    service = TestBed.inject(UserApi);
    mockBackend = new MockUserBackend();
    service.mockBackend = mockBackend;
    service.requestAllUsers = ((): Promise<AllUsersResponse> =>
      mockBackend.requestAllUsers()
    );
    service.requestOneUser = ((uuid): Promise<OneUserResponse> =>
      mockBackend.requestOneUser(uuid)
    );
    service.requestUserSet = ((user): Promise<HttpResponse<any>> =>
      mockBackend.requestUserSet(user)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all users', async () => {
    const users = await service.getAllUsers();
    expect(users.length).toEqual(mockBackend.mockUserDB.length);
  });
});
