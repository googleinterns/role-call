/* eslint-disable max-len */

// Commented out because this file generates a deprecation error:
// describe with no children (describe() or it()) is deprecated and will be
// removed in a future version of Jasmine.
// Basically test setup without any testing will be unallowed in the future.

// import { TestBed, waitForAsync } from '@angular/core/testing';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { HttpClient } from '@angular/common/http';
// import { NgZone } from '@angular/core';
// import { Router } from '@angular/router';
// import { MockGAPI } from '../mocks/mock-gapi';
// // import { LoggingService } from '../services/logging.service';

// import { MatFormFieldModule } from '@angular/material/form-field';

// import { LoginApi } from './login-api.service';
// import { of } from 'rxjs';

// describe('LoginApi', () => {
//   let mockZone: jasmine.SpyObj<NgZone>;
//   // let mockLoggingService: jasmine.SpyObj<LoggingService>;
//   let mockRouter: jasmine.SpyObj<Router>;
//   let mockHttpClient: jasmine.SpyObj<HttpClient>;
//   let mockObj = new MockGAPI();
//   let mockGAPI = mockObj.mock();
//   let service: LoginApi;

//   console.log(mockZone);

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//         declarations: [
//           LoginApi,
//         ],
//         imports: [
//           MatFormFieldModule,
//           NoopAnimationsModule,
//         ]
//       })
//       .compileComponents();
//     }));

//   beforeEach(() => {
//     const successResponse = {status: 200};
//     mockHttpClient =
//         jasmine.createSpyObj('mockHttpClient', {get: of(successResponse)});
//     mockRouter = jasmine.createSpyObj('mockRouter', ['navigateByUrl']);
//     mockZone = jasmine.createSpyObj('mockZone', ['xx']);

//     service = new LoginApi(mockZone, mockHttpClient, mockRouter);
//     mockObj = new MockGAPI();
//     mockGAPI = mockObj.mock();
//     // // @ts-ignore
//     // window.gapi = mockGAPI;
//     console.log(service, mockObj, mockGAPI);
//   });

//   // it('should be created', () => {
//   //   expect(service).toBeTruthy();
//   // });

//   // it('should login', async () => {
//   //   service.login();
//   //   // const loginRespProm = service.login();
//   //   // const loginResp = await loginRespProm;

//   //   // expect(loginResp.isLoggedIn).toBeTrue();
//   //   expect(service.isAuthLoaded).toBeTrue();
//   //   expect(service.isLoggedIn).toBeTrue();
//   // });

//   // it('should login successfully', async () => {
//   //   mockObj.isSignedInVal = true;
//   //   const loginRespProm = service.login();
//   //   const loginResp = await loginRespProm;

//   //   expect(loginResp.isLoggedIn).toBeTrue();
//   //   expect(service.isAuthLoaded).toBeTrue();
//   //   expect(service.isLoggedIn).toBeTrue();
//   // });

//   // it('should login automatically with popup enabled if signed in', async () => {
//   //   mockObj.isSignedInVal = true;
//   //   //const loginRespProm = service.login();
//   //   //const loginResp = await loginRespProm;

//   //   //expect(loginResp.authenticated).toBeTrue();
//   //   expect(service.isAuthLoaded).toBeTrue();
//   //   expect(service.isLoggedIn).toBeTrue();
//   // });

//   // it('should fail login if not signed in without popup enabled', async () => {
//   //   mockObj.isSignedInVal = false;
//   //   //const loginRespProm = service.login();
//   //   //const loginResp = await loginRespProm;

//   //   //expect(loginResp.authenticated).toBeFalse();
//   //   expect(service.isAuthLoaded).toBeTrue();
//   //   expect(service.isLoggedIn).toBeFalse();
//   // });

//   // it('should reload auth response if token is expired', async () => {
//   //   mockObj.isSignedInVal = true;
//   //   mockObj.testUser.wc.expires_at = 0;
//   //   mockObj.testUser.wc.expires_in = 0;
//   //   //const loginRespProm = service.login();
//   //   //const loginResp = await loginRespProm;

//   //   //expect(loginResp.authenticated).toBeTrue();
//   //   expect(service.isAuthLoaded).toBeTrue();
//   //   expect(service.isLoggedIn).toBeTrue();
//   // });

//   // it('should return undefined user if not signed in', async () => {
//   //   const loginRespProm = service.login();
//   //   await loginRespProm;
//   //   mockObj.isSignedInVal = false;

//   //   //expect(service.authInstance.currentUser.get()).toBeUndefined();
//   // });

//   // it('should not authenticate if sign in promise is rejected', async () => {
//   //   mockObj.shouldThrowSignInError = true;
//   //   const loginRespProm = service.login();
//   //   const loginResp = await loginRespProm;

//   //   expect(loginResp.authenticated).toBeFalse();
//   // });

//   // it('should get current user if signed in', async () => {
//   //   //const loginRespProm = service.login();
//   //   //const loginResp = await loginRespProm;

//   //   //expect(loginResp.authenticated).toBeTrue();

//   //   const user = await service.getCurrentUser();

//   //   expect(user).toBeDefined();
//   //   expect(user).toBe(service.user);
//   // });

//   // it('should successfully attempt login for current user if not signed in and return user if successful',
//   //     async () => {
//   //       //const loginRespProm = service.login();
//   //       //const loginResp = await loginRespProm;

//   //       //expect(loginResp.authenticated).toBeTrue();

//   //       service.isLoggedIn = false;
//   //       const user = await service.getCurrentUser();

//   //       expect(user).toBeDefined();
//   //       expect(user).toBe(service.user);
//   //     });

//   // it('should attempt login for current user if not signed in and return undefined if unsuccessful',
//   //     async () => {
//   //       service.isLoggedIn = false;
//   //       mockObj.shouldThrowSignInError = true;
//   //       const user = await service.getCurrentUser();

//   //       expect(user).toBeUndefined();
//   //     });

//   // it('should sign out when signed in', async () => {
//   //   //const loginRespProm = service.login();
//   //   //const loginResp = await loginRespProm;

//   //   //expect(loginResp.authenticated).toBeTrue();

//   //   await service.signOut();

//   //   //expect(service.authInstance.isSignedIn.get()).toBeFalse();
//   //   expect(service.isLoggedIn).toBeFalse();
//   // });

//   // it('should sign out when not signed in', async () => {
//   //   expect(service.isLoggedIn).toBeFalse();

//   //   await service.signOut();

//   //   expect(service.isLoggedIn).toBeFalse();
//   // });
// });
