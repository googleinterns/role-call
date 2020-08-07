import { TestBed } from '@angular/core/testing';

import { ResponseStatusHandlerService } from './response-status-handler.service';

describe('ResponseStatusHandlerService', () => {
  let service: ResponseStatusHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponseStatusHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
