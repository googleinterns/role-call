import {TestBed, waitForAsync} from '@angular/core/testing';

import {MatSelectModule} from '@angular/material/select';

import {RouterTestingModule} from '@angular/router/testing';
import {FakePage} from 'src/test_utils';

import {LoginApi} from '../api/login_api.service';

import {WelcomePage} from './welcome-page.component';

describe('WelcomePageComponent', () => {
  let component: WelcomePage;

  beforeEach(waitForAsync(() => {
    const fakeLoginApi = {loginPromise: Promise.resolve()} as LoginApi;

    TestBed.configureTestingModule({
          declarations: [
            WelcomePage,
          ],
          imports: [
            MatSelectModule,
            RouterTestingModule.withRoutes([
              {path: `dashboard`, component: FakePage},
            ]),
          ],
          providers: [
            {provide: LoginApi, useValue: fakeLoginApi},
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(WelcomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
