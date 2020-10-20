import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';

import {LoginApi} from '../api/login_api.service';
import {DashboardApi} from '../api/dashboard_api.service';

import {App} from './app.component';
import {AppModule} from './app.module';
import {FakePage} from '../../test_utils';

describe('App', () => {
  const fakeDashboardApi = {
    dashPerformanceEmitter: of([]),
    getAllDashboard() {
    }
  } as DashboardApi;
  const fakeLoginApi = {loginPromise: Promise.resolve()} as LoginApi;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        App,
        FakePage,
      ],
      imports: [
        RouterTestingModule.withRoutes([
          {path: `dashboard`, component: FakePage},
        ]),
        AppModule,
      ],
      providers: [
        {provide: DashboardApi, useValue: fakeDashboardApi},
        {provide: LoginApi, useValue: fakeLoginApi},
      ]
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
