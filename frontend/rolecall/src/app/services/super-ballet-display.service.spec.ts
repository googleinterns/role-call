import { SuperBalletDisplayService } from './super-ballet-display.service';

describe('SuperBalletDisplayService', () => {
  let service: SuperBalletDisplayService;

  beforeEach(() => {
    service = new SuperBalletDisplayService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
