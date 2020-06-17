import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { SideNavComponent } from './side-nav.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';
import { cleanRouterString } from 'src/app/util';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideNavComponent ],
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
    fixture = TestBed.createComponent(SideNavComponent);
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
    for(let i = 0; i < panels.length; i++){
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
