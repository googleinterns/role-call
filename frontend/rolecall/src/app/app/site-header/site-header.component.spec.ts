import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SiteHeaderComponent } from './site-header.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { cleanRouterString } from 'src/app/util';

describe('SiteHeaderComponent', () => {
  let component: SiteHeaderComponent;
  let fixture: ComponentFixture<SiteHeaderComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteHeaderComponent, SideNavComponent ],
      imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        RouterTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(SiteHeaderComponent);
    component = fixture.componentInstance;
    component.navBar = TestBed.createComponent(SideNavComponent).componentInstance;
    fixture.detectChanges();
    router.initialNavigation();
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
    button.dispatchEvent(new Event('click'));
    tick();
    let cleanedRoute = cleanRouterString(routerLinkAttr.value as string);
    expect(router.url).toBe(cleanedRoute);
  }));
  

});
