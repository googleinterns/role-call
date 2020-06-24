import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cleanRouterString } from 'src/app/util';
import { AppRoutingModule } from './app-routing.module';
import { SideNav } from './side_nav.component';


describe('SideNav', () => {
  let component: SideNav;
  let fixture: ComponentFixture<SideNav>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SideNav],
      imports: [
        RouterTestingModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatIconModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(SideNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.ngZone.run(() => {
      router.initialNavigation();
    });
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });

  it('should change open state', () => {

    expect(component.navIsOpen).toBeFalse();
    component.openNav();
    expect(component.navIsOpen).toBeTrue();
    component.closeNav();
    expect(component.navIsOpen).toBeFalse();
  });

  it('should navigate to panel pages', fakeAsync(() => {
    let panels = document.getElementsByClassName('nav-child');
    for (let i = 0; i < panels.length; i++) {
      let itemAttr = (panels.item(i)).attributes as NamedNodeMap;
      let routerLinkAttr = itemAttr.getNamedItem("ng-reflect-router-link");
      fixture.ngZone.run(() => {
        panels.item(i).dispatchEvent(new Event('click'));
        tick();
      });
      let cleanedRoute = cleanRouterString(routerLinkAttr.value as string);
      expect(router.url).toBe(cleanedRoute);
    }
  }));

});
