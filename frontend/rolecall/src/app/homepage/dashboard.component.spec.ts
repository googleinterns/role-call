import {TestBed, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {MatFormFieldModule} from '@angular/material/form-field';

import {of} from 'rxjs';

import {DashboardApi} from '../api/dashboard_api.service';

import {Dashboard} from './dashboard.component';

describe('DashboardComponent', () => {
  let component: Dashboard;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          Dashboard,
        ],
        imports: [
          MatFormFieldModule,
          NoopAnimationsModule,
        ]
      })
      .compileComponents();
    }));

  beforeEach(waitForAsync(() => {
    const fakeDashboardApi = {
      dashPerformanceEmitter: of([]),
      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      getAllDashboard(): void {
      }
    } as DashboardApi;

    TestBed.configureTestingModule({
          declarations: [Dashboard],
          providers: [
            {provide: DashboardApi, useValue: fakeDashboardApi},
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
