import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {DashboardApi} from './dashboard_api.service';

describe('DashboardApi', () => {
  let service: DashboardApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler]
    });
    service = TestBed.inject(DashboardApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
