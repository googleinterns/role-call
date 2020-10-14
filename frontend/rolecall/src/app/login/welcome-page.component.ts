import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoginApi} from '../api/login_api.service';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePage implements OnInit {

  constructor(private loginAPI: LoginApi, private router: Router) {
  }

  ngOnInit(): void {
    if (this.loginAPI.isLoggedIn) {
      this.redirectToDashboard();
    }
    this.loginAPI.loginPromise.then(() => {
      this.redirectToDashboard();
    });
  }

  redirectToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

}
