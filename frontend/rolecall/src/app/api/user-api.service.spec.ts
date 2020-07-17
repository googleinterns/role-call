import { TestBed } from '@angular/core/testing';
import { MockUserBackend } from '../mocks/mock_user_backend';
import { UserApi } from './user-api.service';


describe('UserApi', () => {
  let service: UserApi;
  let mockBackend: MockUserBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserApi);
    mockBackend = new MockUserBackend();
    service.requestAllUsers = mockBackend.requestAllUsers;
    service.requestOneUser = mockBackend.requestOneUser;
    service.requestUserSet = mockBackend.requestUserSet;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
