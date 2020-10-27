import {PieceApi} from '../api/piece_api.service';
import {UserApi} from '../api/user_api.service';

import {CsvGenerator} from './csv-generator.service';

describe('CsvGeneratorService', () => {
  const fakeUserApi = {} as UserApi;
  const fakePieceApi = {} as PieceApi;

  let service: CsvGenerator;

  beforeEach(() => {
    service = new CsvGenerator(fakeUserApi, fakePieceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
