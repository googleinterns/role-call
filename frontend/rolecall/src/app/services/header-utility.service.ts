import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginApi } from '../api/login_api.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderUtilityService {

  constructor(private loginAPI: LoginApi) { }

  generateHeader(): HttpHeaders {
    return new HttpHeaders(
      {
        'EMAIL': this.loginAPI.email,
        'AUTHORIZATION': 'Bearer ' + this.loginAPI.user.getAuthResponse().id_token
      }
    )
  }

}
