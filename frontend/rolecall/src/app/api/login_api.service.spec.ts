import { TestBed } from '@angular/core/testing';
import { LoginApi, LoginResponse } from './login_api.service';


describe('LoginApi', () => {
  let service: LoginApi;
  let testEmail = 'testEmail@test.com';
  let testPass = 'testPassword123!';
  let loginRequest = {
    email: testEmail,
    password: testPass
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in successfully', async () => {
    let sentReqTime = Date.now();
    let loginProm = service.login(loginRequest).toPromise();
    let response: LoginResponse = await loginProm;

    expect(response.authenticated).toBeTrue();
    expect(response.token).toBeDefined();
    expect(response.user).toBeDefined();
    expect(service.getCurrentUser().email).toBe(response.user.email);
    expect(service.getCurrentUser().email).toBe(testEmail);
    expect(service.requiresLogin(loginRequest)).toBeFalse();
    expect(service.getCurrentSessionToken()).toEqual(response.token);
    expect(service.getCurrentSessionToken()).toBeDefined();
    expect(service.getCurrentSessionToken().expires).toBeGreaterThanOrEqual(sentReqTime);
  });

  it('should get the same session token if called again', async () => {
    let loginPromBefore = service.login(loginRequest).toPromise();
    let responseBefore: LoginResponse = await loginPromBefore;
    let prevSessionToken = service.getCurrentSessionToken();
    let prevUser = service.getCurrentUser();
    let loginProm = service.login(loginRequest).toPromise();
    let response: LoginResponse = await loginProm;

    expect(response.authenticated).toBeTrue();
    expect(response.token).toEqual(prevSessionToken);
    expect(response.user).toEqual(prevUser);
    expect(service.getCurrentSessionToken()).toEqual(prevSessionToken);
    expect(service.getCurrentUser()).toEqual(prevUser);
  });

});
