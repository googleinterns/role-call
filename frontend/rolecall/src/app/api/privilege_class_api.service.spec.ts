import { TestBed } from '@angular/core/testing';
import { PrivilegeClassApi } from './privilege_class_api.service';


describe('PrivilegeClassApiService', () => {
  let service: PrivilegeClassApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivilegeClassApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
