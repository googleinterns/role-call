import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockGAPI } from '../mocks/mock_gapi';
import { AppRoutingModule } from './app_routing.module';
import { SideNav } from './side_nav.component';
import { SiteHeader } from './site_header.component';


describe('SiteHeader', () => {
  let component: SiteHeader;
  let fixture: ComponentFixture<SiteHeader>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SiteHeader],
      imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        MatIconModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the nav bar when menu is clicked', () => {
    expect(component.navBar.isNavOpen).toBeFalse();

    component.onNavButtonClick();

    expect(component.navBar.isNavOpen).toBeTrue();

    component.onNavButtonClick();

    expect(component.navBar.isNavOpen).toBeFalse();
  });

  it('should trigger login on login button click', async () => {
    expect(component.responseRecieved).toBeFalse();

    await component.onLoginButtonClick();

    expect(component.responseRecieved).toBeTrue();
    expect(component.userIsLoggedIn).toBeTrue();
  });

  it('should unload auth then trigger login if auth instance is not null or undefined to reset auth', async () => {
    expect(component.responseRecieved).toBeFalse();

    await component.loginAPI.initGoogleAuth();

    expect(component.loginAPI.isAuthLoaded).toBeTrue();

    await component.onLoginButtonClick();

    expect(component.responseRecieved).toBeTrue();
    expect(component.userIsLoggedIn).toBeTrue();
  });

});
