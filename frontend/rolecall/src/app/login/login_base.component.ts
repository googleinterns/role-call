import { Component } from '@angular/core';
import { LoginApi } from '../api/login_api.service';


/**
 * The base component for the login view. Arranges
 * all sub-components to form the login screen.
 */
@Component({
  selector: 'app-login-base',
  templateUrl: './login_base.component.html',
  styleUrls: ['./login_base.component.scss']
})
export class LoginBase {

  constructor(private loginAPIService: LoginApi) { }

}
