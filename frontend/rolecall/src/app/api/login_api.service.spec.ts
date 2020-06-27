import { TestBed } from '@angular/core/testing';
import { LoginApi } from './login_api.service';


describe('LoginApi', () => {
  let service: LoginApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
