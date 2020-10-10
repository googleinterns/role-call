import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {LoginApi} from '../api/login_api.service';

import {WelcomePage} from './welcome-page.component';

describe('WelcomePageComponent', () => {
  let component: WelcomePage;

  beforeEach(async(() => {
    const fakeLoginApi = {loginPromise: Promise.resolve()} as LoginApi;

    TestBed.configureTestingModule({
          declarations: [WelcomePage],
          imports: [
            RouterTestingModule,
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
