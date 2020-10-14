import {TestBed} from '@angular/core/testing';
import {CsvGenerator} from './csv-generator.service';


describe('CsvGeneratorService', () => {
  let service: CsvGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
