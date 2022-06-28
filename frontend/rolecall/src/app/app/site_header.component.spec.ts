import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {MatIconModule} from '@angular/material/icon';
import {BrowserModule} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient} from '@angular/common/http';
import {createSpyObjWithProps} from 'src/test_utils';
import {Subject} from 'rxjs';

import {MockGAPI} from '../mocks/mock_gapi';
import {LoginApi} from '../api/login_api.service';

import {AppRoutingModule} from './app_routing.module';
import {SideNav} from './side_nav.component';
import {SiteHeader} from './site_header.component';

describe('SiteHeader', () => {
  const fakeHttpClient = {} as HttpClient;
  const isLoggedIn$ = new Subject<boolean>();

  let mockLoginApi: jasmine.SpyObj<LoginApi>;
  let component: SiteHeader;
  let fixture: ComponentFixture<SiteHeader>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    mockLoginApi = createSpyObjWithProps<LoginApi>({
      baseName: 'mockLoginApi',
      methods: {
        login: Promise.resolve(),
        signOut: Promise.resolve(),
      },
      props: {
        isLoggedIn$
      }
    });
    mockLoginApi.login.and.callFake(async () => {
      mockLoginApi.isLoggedIn = true;
      //return Promise.resolve({} as LoginResponse);
    });
    mockLoginApi.signOut.and.callFake(async () => {
      mockLoginApi.isLoggedIn = false;
    });

    TestBed.configureTestingModule({
          declarations: [SiteHeader],
          imports: [
            BrowserModule,
            AppRoutingModule,
            RouterTestingModule,
            MatIconModule,
            NoopAnimationsModule,
          ],
          providers: [
            {provide: LoginApi, useValue: mockLoginApi},
            {provide: HttpClient, useValue: fakeHttpClient},
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SiteHeader);
    component = fixture.componentInstance;
    component.navBar = TestBed.createComponent(SideNav).componentInstance;
    fixture.detectChanges();
    fixture.ngZone.run(() => {
      router.initialNavigation();
    });
    // @ts-ignore
    window['gapi'] = new MockGAPI().mock();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });

  // it('should toggle the nav bar when menu is clicked', () => {
  //   expect(component.navBar.isNavOpen).toBeFalse();

  //   component.onNavButtonClick();

  //   expect(component.navBar.isNavOpen).toBeTrue();

  //   component.onNavButtonClick();

  //   expect(component.navBar.isNavOpen).toBeFalse();
  // });

  // it('should trigger login on login button click', async () => {
  //   expect(component.responseReceived).toBeFalse();

  //   await component.onLoginButtonClick();

  //   expect(component.responseReceived).toBeTrue();
  //   expect(component.userIsLoggedIn).toBeTrue();
  // });

  // it(
  //     'should unload auth then trigger login if auth instance is not '
  //     + 'null or undefined to reset auth',
  //     async () => {
  //       expect(component.responseReceived).toBeFalse();

  //       await component.onLoginButtonClick();

  //       expect(component.responseReceived).toBeTrue();
  //       expect(component.userIsLoggedIn).toBeTrue();
  //     });

  // it('should sign out on sign out click', async () => {
  //   expect(component.responseReceived).toBeFalse();

  //   await component.onLoginButtonClick();

  //   expect(component.responseReceived).toBeTrue();
  //   expect(component.userIsLoggedIn).toBeTrue();

  //   component.onSignOut();

  //   expect(component.userIsLoggedIn).toBeFalse();
  //   expect(component.responseReceived).toBeTrue();
  // });
});
