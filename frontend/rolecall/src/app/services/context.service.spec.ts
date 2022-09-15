import { ContextService } from './context.service';

describe('ContextService', () => {
  let service: ContextService;

  beforeEach(() => {
    service = new ContextService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
