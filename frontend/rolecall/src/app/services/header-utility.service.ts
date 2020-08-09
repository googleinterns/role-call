import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginApi } from '../api/login_api.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderUtilityService {

  constructor(private loginAPI: LoginApi) { }

  sentToken = false;

  updateSentToken() {
    this.sentToken = this.loginAPI.isLoggedIn && this.sentToken;
  }

  generateHeader(): Promise<HttpHeaders> {
    this.updateSentToken();
    return this.loginAPI.loginPromise.then(() => {
      if (this.sentToken) {
        let headers = new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'EMAIL': environment.useDevEmail ? environment.devEmail : this.loginAPI.email,
        });
        return headers;
      } else {
        let headers = new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'EMAIL': environment.useDevEmail ? environment.devEmail : this.loginAPI.email,
          'AUTHORIZATION': 'Bearer ' + this.loginAPI.user.getAuthResponse().id_token
        });
        this.sentToken = true;
        return headers;
      }
    })
  }

}
