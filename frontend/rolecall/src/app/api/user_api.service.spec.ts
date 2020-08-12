import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MockUserBackend } from '../mocks/mock_user_backend';
import { UserApi } from './user_api.service';

describe('UserApi', () => {
  let service: UserApi;
  let mockBackend: MockUserBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler]
    });
    service = TestBed.inject(UserApi);
    mockBackend = new MockUserBackend();
    service.mockBackend = mockBackend;
    service.requestAllUsers = () => { return mockBackend.requestAllUsers() };
    service.requestOneUser = (uuid) => { return mockBackend.requestOneUser(uuid) };
    service.requestUserSet = (user) => { return mockBackend.requestUserSet(user) };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all users', async () => {
    let users = await service.getAllUsers();
    expect(users.length).toEqual(mockBackend.mockUserDB.length);
  });

});
