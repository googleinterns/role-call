import { Component, OnInit } from '@angular/core';
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
export class LoginBase implements OnInit {

  constructor(private loginAPIService: LoginApi) { }

  ngOnInit() {
    // Test a login
    this.loginAPIService.login({
      email: "testuserfromlogin@gmail.com",
      password: "testpass"
    }).toPromise().then((val) => {
      console.log(val);
    }).then(val => {
      console.log(this.loginAPIService.getCurrentUser());
    }).then(val => {
      console.log(this.loginAPIService.getCurrentSessionToken());
    });
  }

}
