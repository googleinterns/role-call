import {TestBed} from '@angular/core/testing';
import {UnavailabilityApi} from './unavailability-api.service';


describe('UnavailabilityApiService', () => {
  let service: UnavailabilityApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnavailabilityApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
