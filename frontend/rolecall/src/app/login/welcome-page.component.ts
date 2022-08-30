import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginApi } from '../api/login-api.service';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class WelcomePage implements OnInit {

  constructor(
    private loginAPI: LoginApi,
    private router: Router,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    if (this.loginAPI.isLoggedIn) {
      this.redirectToDashboard();
    }
    this.loginAPI.loginPromise.then(() => {
      this.redirectToDashboard();
    });
  }

  redirectToDashboard = (): void => {
    this.router.navigateByUrl('/dashboard');
  };

}
