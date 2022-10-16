import { AfterViewInit, Component, Input, OnDestroy, OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginApi } from '../api/login-api.service';
import { UserApi } from '../api/user-api.service';
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
export class SiteHeader implements OnInit, OnDestroy, AfterViewInit {

  /** Reference to the nav bar */
  @Input() navBar: SideNav;

  /** Whether we've received a response from the login API */
  responseReceived = false;

  loginSubscription: Subscription;

  constructor(
    private userApi: UserApi,

    public loginApi: LoginApi,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.loginApi.login().then(() => {
      this.configureHeaderForLogin();
    });
    this.loginSubscription = this.loginApi.isLoggedIn$
        .subscribe((isLoggedIn: boolean | undefined) => {
            if (!isLoggedIn) {
              this.loginApi.signOut();
            }
            this.configureHeaderForLogin();
            this.loginApi.refresh();
            if (isLoggedIn) {
              this.doStartup();
            }
          });
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnDestroy(): void {
    // don't know if subscription should continue
    // this.loginSubscription.unsubscribe();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngAfterViewInit(): void {
    this.loginApi.loginBtn = document.getElementById('gsi_btn');
  }

  doStartup = async (): Promise<void> => {
    await this.userApi.cache.loadAll();
    this.userApi.loadAllPictures();
  };

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
    this.loginApi.signOut();
    this.configureHeaderForLogin();
  };

  // Private methods

  /** Set state and render page header depending on login state */
  private configureHeaderForLogin = (): void => {
    this.responseReceived = true;
  };

}
