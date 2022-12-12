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
    const email = environment.useDevEmail ? environment.devEmail :
        this.loginApi.email;
    return this.loginApi.loginPromise.then(() => {
      if (this.sentToken) {
        if (headerType === HeaderType.jpg) {
          return new HttpHeaders({ 'Content-Type': 'image/jpg', email });
        }
        if (headerType === HeaderType.png) {
          return new HttpHeaders({ 'Content-Type': 'image/png', email });
        }
        if (headerType === HeaderType.formData) {
          return new HttpHeaders({ email });
        }
        return new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8', email });
      } else {
        this.sentToken = true;
        return new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          email,
          authorization: 'Bearer ' + this.loginApi.credential,
        });
      }
    });
  };

}
