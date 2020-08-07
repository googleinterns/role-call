import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginApi } from '../api/login_api.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderUtilityService {

  constructor(private loginAPI: LoginApi) { }

  generateHeader(): Promise<HttpHeaders> {
    return this.loginAPI.loginPromise.then(() => {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'EMAIL': this.loginAPI.email,
        'AUTHORIZATION': 'Bearer ' + this.loginAPI.user.getAuthResponse().id_token
      });
      return headers;
    })

    // {
    //   'EMAIL': this.loginAPI.email,
    //   'AUTHORIZATION': 'Bearer ' + this.loginAPI.user.getAuthResponse().id_token
    // }
  }

}
