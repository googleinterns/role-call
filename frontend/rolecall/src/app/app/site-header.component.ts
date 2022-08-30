import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { LoginApi } from '../api/login-api.service';
import { GlobalsService } from '../services/globals.service';
import { SideNav } from './side-nav.component';

/**
 * The site-wide header that holds the menu bar, login information,
 * and anything else that needs to be accessed site-wide
 */
@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class SiteHeader implements OnInit, AfterViewInit {

  /** Reference to the nav bar */
  @Input() navBar: SideNav;

  /** Whether we've received a response from the login API */
  responseReceived = false;

  constructor(
    public g: GlobalsService,
    public loginAPI: LoginApi,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.loginAPI.login().then(() => {
      this.configureHeaderForLogin();
    });
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
