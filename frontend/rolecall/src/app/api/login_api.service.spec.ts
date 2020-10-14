import {TestBed} from '@angular/core/testing';
import {isNullOrUndefined} from 'util';
import {MockGAPI} from '../mocks/mock_gapi';
import {LoginApi} from './login_api.service';


describe('LoginApi', () => {
  let service: LoginApi;
  let mockObj = new MockGAPI();
  let mockGAPI = mockObj.mock();


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginApi);
    mockObj = new MockGAPI();
    mockGAPI = mockObj.mock();
    // @ts-ignore
    window['gapi'] = mockGAPI;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login', async () => {
    let loginRespProm = service.login(true);
    let loginResp = await loginRespProm;

    expect(loginResp.authenticated).toBeTrue();
    expect(service.isAuthLoaded).toBeTrue();
    expect(service.isLoggedIn).toBeTrue();
  });

  it('should login sucessfully without popup enabled if signed in',
      async () => {
        mockObj.isSignedInVal = true;
        let loginRespProm = service.login(false);
        let loginResp = await loginRespProm;

        expect(loginResp.authenticated).toBeTrue();
        expect(service.isAuthLoaded).toBeTrue();
        expect(service.isLoggedIn).toBeTrue();
      });

  it('should login automatically with popup enabled if signed in', async () => {
    mockObj.isSignedInVal = true;
    let loginRespProm = service.login(true);
    let loginResp = await loginRespProm;

    expect(loginResp.authenticated).toBeTrue();
    expect(service.isAuthLoaded).toBeTrue();
    expect(service.isLoggedIn).toBeTrue();
  });

  it('should fail login if not signed in without popup enabled', async () => {
    mockObj.isSignedInVal = false;
    let loginRespProm = service.login(false);
    let loginResp = await loginRespProm;

    expect(loginResp.authenticated).toBeFalse();
    expect(service.isAuthLoaded).toBeTrue();
    expect(service.isLoggedIn).toBeFalse();
  });

  it('should reload auth response if token is expired', async () => {
    mockObj.isSignedInVal = true;
    mockObj.testUser.wc.expires_at = 0;
    mockObj.testUser.wc.expires_in = 0;
    let loginRespProm = service.login(true);
    let loginResp = await loginRespProm;

    expect(loginResp.authenticated).toBeTrue();
    expect(service.isAuthLoaded).toBeTrue();
    expect(service.isLoggedIn).toBeTrue();
  });

  it('should return null or undefined user if not signed in', async () => {
    let loginRespProm = service.login(true);
    let loginResp = await loginRespProm;
    mockObj.isSignedInVal = false;

    expect(isNullOrUndefined(service.authInstance.currentUser.get()))
        .toBeTrue();
  });

  it('should not authenticate if sign in promise is rejected', async () => {
    mockObj.shouldThrowSignInError = true;
    let loginRespProm = service.login(true);
    let loginResp = await loginRespProm;

    expect(loginResp.authenticated).toBeFalse();
  });

  it('should get current user if signed in', async () => {
    let loginRespProm = service.login(true);
    let loginResp = await loginRespProm;

    expect(loginResp.authenticated).toBeTrue();

    let user = await service.getCurrentUser();

    expect(user).toBeDefined();
    expect(user).toBe(service.user);
  });

  it('should successfully attempt login for current user if not signed in and return user if successful',
      async () => {
        let loginRespProm = service.login(true);
        let loginResp = await loginRespProm;

        expect(loginResp.authenticated).toBeTrue();

        service.isLoggedIn = false;
        let user = await service.getCurrentUser();

        expect(user).toBeDefined();
        expect(user).toBe(service.user);
      });

  it('should attempt login for current user if not signed in and return undefined if unsuccessful',
      async () => {
        service.isLoggedIn = false;
        mockObj.shouldThrowSignInError = true;
        let user = await service.getCurrentUser();

        expect(user).toBeUndefined();
      });

  it('should sign out when signed in', async () => {
    let loginRespProm = service.login(true);
    let loginResp = await loginRespProm;

    expect(loginResp.authenticated).toBeTrue();

    service.signOut();

    expect(service.authInstance.isSignedIn.get()).toBeFalse();
    expect(service.isLoggedIn).toBeFalse();
  });

  it('should sign out when not signed in', async () => {
    expect(service.isLoggedIn).toBeFalse();

    service.signOut();

    expect(service.isLoggedIn).toBeFalse();
  });

});
