import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteHeaderComponent } from './site-header.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SideNavComponent } from '../side-nav/side-nav.component';

describe('SiteHeaderComponent', () => {
  let component: SiteHeaderComponent;
  let fixture: ComponentFixture<SiteHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteHeaderComponent, SideNavComponent ],
      imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteHeaderComponent);
    component = fixture.componentInstance;
    component.navBar = TestBed.createComponent(SideNavComponent).componentInstance;
    fixture.detectChanges();
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
  })

});
