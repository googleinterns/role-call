/* eslint-disable @typescript-eslint/naming-convention */

import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginApi } from '../api/login-api.service';

export enum HeaderType {
  json,
  formData,
  jpg,
  png,
}

@Injectable({providedIn: 'root'})
export class HeaderUtilityService {

  sentToken = false;

  constructor(
    private loginApi: LoginApi,
  ) {
  }

  updateSentToken = (): void => {
    this.sentToken = this.loginApi.isLoggedIn && this.sentToken;
  };

  generateHeader = async (
    headerType: HeaderType = HeaderType.json,
  ): Promise<HttpHeaders> => {
    this.updateSentToken();
    return this.loginApi.loginPromise.then(() => {
      if (this.sentToken) {
        if (headerType === HeaderType.jpg) {
          return new HttpHeaders({
            'Content-Type': 'image/jpg',
            EMAIL: environment.useDevEmail ? environment.devEmail :
                this.loginApi.email,
          });
        }
        if (headerType === HeaderType.png) {
          return new HttpHeaders({
            'Content-Type': 'image/png',
            EMAIL: environment.useDevEmail ? environment.devEmail :
                this.loginApi.email,
          });
        }
        if (headerType === HeaderType.formData) {
          return new HttpHeaders({
            EMAIL: environment.useDevEmail ? environment.devEmail :
                this.loginApi.email,
          });
        }
        return new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          EMAIL: environment.useDevEmail ? environment.devEmail :
              this.loginApi.email,
        });
      } else {
        this.sentToken = true;
        return new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          EMAIL: environment.useDevEmail ? environment.devEmail :
              this.loginApi.email,
          AUTHORIZATION: 'Bearer ' + this.loginApi.credential,
        });
      }
    });
  };

}
