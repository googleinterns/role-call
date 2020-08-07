import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginApi } from '../api/login_api.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderUtilityService {

  constructor(private loginAPI: LoginApi) { }

  sentEmail = false;

  generateHeader(): Promise<HttpHeaders> {
    return this.loginAPI.loginPromise.then(() => {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'EMAIL': environment.useDevEmail ? environment.devEmail : this.loginAPI.email,
        'AUTHORIZATION': 'Bearer ' + this.loginAPI.user.getAuthResponse().id_token
      });
      return headers;
    })
  }

}
