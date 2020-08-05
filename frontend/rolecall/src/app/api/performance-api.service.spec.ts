import { TestBed } from '@angular/core/testing';
import { PerformanceApi } from './performance-api.service';

describe('PerformanceApiService', () => {
  let service: PerformanceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
