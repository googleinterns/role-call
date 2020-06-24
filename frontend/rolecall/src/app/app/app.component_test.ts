import { async, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { App } from './app.component';
import { SideNav } from './side_nav.component';
import { SiteHeader } from './site_header.component';

describe('App', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatIconModule
      ],
      declarations: [
        App,
        SideNav,
        SiteHeader
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it(`should have as title 'rolecall'`, () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.title).toEqual('rolecall');
  });
});
