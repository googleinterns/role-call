import { LoginApi } from '../api/login-api.service';
import { HeaderUtilityService } from './header-utility.service';

describe('HeaderUtilityService', () => {
  let service: HeaderUtilityService;

  beforeEach(() => {
    const fakeLoginService = {} as LoginApi;
    service = new HeaderUtilityService(fakeLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
