import { TestBed, waitForAsync } from '@angular/core/testing';
import {of} from 'rxjs';

import {DashboardApi} from '../api/dashboard_api.service';

import {Dashboard} from './dashboard.component';

describe('DashboardComponent', () => {
  let component: Dashboard;

  beforeEach(waitForAsync(() => {
    const fakeDashboardApi = {
      dashPerformanceEmitter: of([]),
      getAllDashboard() {
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
