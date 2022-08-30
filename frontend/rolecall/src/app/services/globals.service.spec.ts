import { GlobalsService } from './globals.service';

describe('GlobalsService', () => {
  let service: GlobalsService;

  beforeEach(() => {
    service = new GlobalsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
