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
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class SiteHeader implements OnInit, AfterViewInit {

  /** Reference to the nav bar */
  @Input() navBar: SideNav;

  /** Whether we've received a response from the login API */
  responseReceived = false;

  constructor(
    public loginAPI: LoginApi,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.loginAPI.login().then(() => {
      this.configureHeaderForLogin();
    });
  console.log('LOGIN_API', this.loginAPI);
  console.log('IS_LOGGENDIN', this.loginAPI.isLoggedIn$);
    this.loginAPI.isLoggedIn$.subscribe((isLoggedIn: boolean | undefined) => {
      if (!isLoggedIn) {
        this.loginAPI.signOut();
      }
      this.configureHeaderForLogin();
      this.loginAPI.refresh();
    });
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngAfterViewInit(): void {
    this.loginAPI.loginBtn = document.getElementById('gsi_btn');
    this.loginAPI.showLoginButton();
  }

  /**
   * Toggles the open state of the nav side bar
   * when the menu button is clicked
   */
  onNavButtonClick = (): void => {
    if (this.navBar.isNavOpen) {
      this.navBar.closeNav();
    } else {
      this.navBar.openNav();
    }
  };

  /** Sign out of google OAuth2 */
  onSignOut = (): void => {
    this.loginAPI.signOut();
    this.configureHeaderForLogin();
  };

  // Private methods

  /** Set state and render page header depending on login state */
  private configureHeaderForLogin = (): void => {
    this.responseReceived = true;
  };

}
