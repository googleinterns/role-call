import { TestBed } from '@angular/core/testing';
import { PieceApi } from './piece_api.service';


describe('PieceApiService', () => {
  let service: PieceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PieceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
