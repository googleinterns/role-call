/* eslint-disable @typescript-eslint/naming-convention */

import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {LoginApi} from '../api/login_api.service';

@Injectable({providedIn: 'root'})
export class HeaderUtilityService {

  sentToken = false;

  constructor(
    private loginAPI: LoginApi,
  ) {
  }

  updateSentToken = (): void => {
    this.sentToken = this.loginAPI.isLoggedIn && this.sentToken;
  };

  generateHeader = (): Promise<HttpHeaders> => {
    this.updateSentToken();
    return this.loginAPI.loginPromise.then(() => {
      if (this.sentToken) {
        return new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          EMAIL: environment.useDevEmail ? environment.devEmail :
              this.loginAPI.email,
        });
      } else {
        this.sentToken = true;
        return new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          EMAIL: environment.useDevEmail ? environment.devEmail :
              this.loginAPI.email,
          AUTHORIZATION: 'Bearer ' + this.loginAPI.user,
        });
      }
    });
  };

}
