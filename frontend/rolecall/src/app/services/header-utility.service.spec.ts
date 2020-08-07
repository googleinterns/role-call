import { TestBed } from '@angular/core/testing';

import { HeaderUtilityService } from './header-utility.service';

describe('HeaderUtilityService', () => {
  let service: HeaderUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
