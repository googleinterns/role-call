import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cleanRouterString } from 'src/app/util';
import { AppRoutingModule } from './app-routing.module';
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
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });

  it('should toggle the nav bar when menu is clicked', () => {

    expect(component.navBar.navIsOpen).toBeFalse();
    component.onNavButtonClick();
    expect(component.navBar.navIsOpen).toBeTrue();
    component.onNavButtonClick();
    expect(component.navBar.navIsOpen).toBeFalse();
  });

  it('should navigate to the login page when login button is clicked', fakeAsync(() => {
    let button = component.loginButton.nativeElement;
    let routerLinkAttr = button.attributes.getNamedItem("ng-reflect-router-link");
    fixture.ngZone.run(() => {
      button.dispatchEvent(new Event('click'));
      tick();
    });
    let cleanedRoute = cleanRouterString(routerLinkAttr.value as string);

    expect(router.url).toBe(cleanedRoute);
  }));


});
