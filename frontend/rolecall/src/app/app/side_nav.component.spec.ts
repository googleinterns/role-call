import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cleanRouterString } from 'src/app/util';
import { constNavBarEntries } from 'src/constants';
import { AppRoutingModule } from './app_routing.module';
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
    expect(component.isNavOpen).toBeFalse();

    component.openNav();

    expect(component.isNavOpen).toBeTrue();

    component.closeNav();

    expect(component.isNavOpen).toBeFalse();
  });

  it('should navigate to all valid url forms', fakeAsync(() => {
    fixture.ngZone.run(() => {
      router.navigateByUrl(cleanRouterString(constNavBarEntries[1].routerLinkUrl));
      tick();
    });

    expect(router.url).toBe(cleanRouterString(constNavBarEntries[1].routerLinkUrl));

    fixture.ngZone.run(() => {
      router.navigateByUrl("/" + cleanRouterString(constNavBarEntries[1].routerLinkUrl));
      tick();
    });

    expect(router.url).toBe(cleanRouterString("/" + constNavBarEntries[1].routerLinkUrl));
  }));

  it('should navigate to panel pages', fakeAsync(() => {
    const panels = document.getElementsByClassName('nav-child');
    for (let i = 0; i < panels.length; i++) {
      const itemAttr = (panels.item(i)).attributes as NamedNodeMap;
      const routerLinkAttr = itemAttr.getNamedItem('ng-reflect-router-link');
      fixture.ngZone.run(() => {
        panels.item(i).dispatchEvent(new Event('click'));
        tick();
      });
      const cleanedRoute = cleanRouterString(routerLinkAttr.value as string);

      expect(router.url).toBe(cleanedRoute);
    }
  }));

});
