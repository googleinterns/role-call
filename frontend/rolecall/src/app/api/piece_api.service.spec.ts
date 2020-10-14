import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {PieceApi} from './piece_api.service';


describe('PieceApiService', () => {
  let service: PieceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, HttpHandler]
    });
    service = TestBed.inject(PieceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
