import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {LoginApi} from '../api/login_api.service';
import {SideNav} from './side_nav.component';

/**
 * The site-wide header that holds the menu bar, login information,
 * and anything else that needs to be accessed site-wide
 */
@Component({
  selector: 'app-site-header',
  templateUrl: './site_header.component.html',
  styleUrls: ['./site_header.component.scss']
})
export class SiteHeader implements OnInit, AfterViewInit {

  /** Reference to the nav bar */
  @Input() navBar: SideNav;

  /** Whether we've received a response from the login API */
  responseReceived = false;

  constructor(
    public loginAPI: LoginApi,
  ) {
  }

  ngOnInit(): void {
    this.loginAPI.login().then(() => {
      this.configureHeaderForLogin();
    });
    this.loginAPI.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.loginAPI.signOut();
      }
      this.configureHeaderForLogin();
      this.loginAPI.refresh();
    });
  }

  ngAfterViewInit(): void {
    this.loginAPI.loginBtn = document.getElementById('gsi_btn');
    this.loginAPI.showLoginButton();
  }

  /**
   * Toggles the open state of the nav side bar
   * when the menu button is clicked
   */
  onNavButtonClick(): void {
    this.navBar.isNavOpen ? this.navBar.closeNav() : this.navBar.openNav();
  }

  /** Sign out of google OAuth2 */
  onSignOut() {
    this.loginAPI.signOut();
    this.configureHeaderForLogin();
  }

  /** Set state and render page header depending on login state */
  private configureHeaderForLogin() {
    this.responseReceived = true;
  }
}
