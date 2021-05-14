import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
//import {isNullOrUndefined} from 'util';
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
export class SiteHeader implements OnInit {

  /** Reference to the nav bar */
  @Input() navBar: SideNav;
  /** The log in button */
  @ViewChild('loginButton') loginButton: ElementRef;
  /** Whether or not the user is logged in */
  userIsLoggedIn = true;
  /** Whether we've received a response from the login API */
  responseReceived = false;

  constructor(public loginAPI: LoginApi) {
  }

  ngOnInit(): void {
    this.loginAPI.login(false).then(() => {
      this.configureHeaderForLogin();
    });
    this.loginAPI.isLoggedIn$.subscribe( (isLogin) => {
      if (!isLogin) {
        this.configureHeaderForLogin();
        this.loginAPI.signOut();
      }      
    })
  }

  /**
   * Toggles the open state of the nav side bar
   * when the menu button is clicked
   */
  onNavButtonClick() {
    this.navBar.isNavOpen ? this.navBar.closeNav() : this.navBar.openNav();
  }

  /** Initiate a google OAuth2 login when login button is clicked */
  onLoginButtonClick() {
    if (!!this.loginAPI?.authInstance) {
      this.loginAPI.authInstance.signOut();
      this.loginAPI.authInstance.disconnect();
      this.loginAPI.isAuthLoaded = false;
    }
    return this.loginAPI.login(true).then(() => {
      this.configureHeaderForLogin();
    });
  }

  /** Sign out of google OAuth2 */
  onSignOut() {
    this.loginAPI.signOut();
    this.configureHeaderForLogin();
  }

  /** Set state and render page header depending on login state */
  private configureHeaderForLogin() {
    this.responseReceived = true;
    this.userIsLoggedIn = this.loginAPI.isLoggedIn;
  }
}
