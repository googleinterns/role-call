import {HttpClient} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {MockUserBackend} from '../mocks/mock_user_backend';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

import {UserApi} from './user_api.service';

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
      providers: [
        {provide: HttpClient, useValue: fakeHttpClient},
        {
          provide: ResponseStatusHandlerService,
          useValue: fakeResponseStatusHandlerService
        },
      ]
    });
    service = TestBed.inject(UserApi);
    mockBackend = new MockUserBackend();
    service.mockBackend = mockBackend;
    service.requestAllUsers = (() => {
      return mockBackend.requestAllUsers();
    });
    service.requestOneUser = (uuid => {
      return mockBackend.requestOneUser(uuid);
    });
    service.requestUserSet = (user => {
      return mockBackend.requestUserSet(user);
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all users', async () => {
    const users = await service.getAllUsers();
    expect(users.length).toEqual(mockBackend.mockUserDB.length);
  });
});
