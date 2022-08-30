import { SegmentApi } from '../api/segment-api.service';
import { UserApi } from '../api/user-api.service';
import { CsvGenerator } from './csv-generator.service';

describe('CsvGeneratorService', () => {
  const fakeUserApi = {} as UserApi;
  const fakeSegmentApi = {} as SegmentApi;

  let service: CsvGenerator;

  beforeEach(() => {
    service = new CsvGenerator(fakeUserApi, fakeSegmentApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
