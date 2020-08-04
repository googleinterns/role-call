import { TestBed } from '@angular/core/testing';
import { CastApi } from './cast_api.service';


describe('CastApiService', () => {
  let service: CastApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CastApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
