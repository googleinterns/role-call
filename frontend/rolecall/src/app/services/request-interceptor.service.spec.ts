import {RequestInterceptorService} from './request-interceptor.service';
import {LoginApi} from '../api/login_api.service';

describe('RequestInterceptorService', () => {
  let service: RequestInterceptorService;

  beforeEach(() => {
    const fakeLoginApi = {} as LoginApi;
    service = new RequestInterceptorService(fakeLoginApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
