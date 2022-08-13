/* eslint-disable @typescript-eslint/naming-convention */

import {HttpClient} from '@angular/common/http';
import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, Subscription, lastValueFrom, timer,
} from 'rxjs';
import {environment} from 'src/environments/environment';


export type LoginResponse = {
  isLoggedIn: boolean;
  user: any;
};

/** Service that handles logging in and obtaining the session token. */
@Injectable({providedIn: 'root'})
export class LoginApi {
  /** Whether the user has been loaded already. */
  isLoggedIn = false;
  isLoggedIn$: Observable<boolean>;

  /** The current credential */
  credential = '';

  /** The current user. */
  user: any;

  /** If the google OAuth2 api is loaded. */
  isAuthLoaded = false;
  isAuthLoaded$: Observable<boolean>;

  /** Startup timer */
  seconds = timer(1000, 1000);
  ticks: Subscription;


  /** Google login button */
  loginBtn?: HTMLElement;

  /** Promise that resolves when logged in. */
  loginPromise = new Promise(res => {
    this.resolveLogin = res;
  });
  resolveLogin: (value?: unknown) => void;

  /** User profile attributes */
  imageURL: string;
  email: string;
  givenName: string;
  familyName: string;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn);
  private isAuthLoadedSubject = new BehaviorSubject<boolean>(this.isLoggedIn);

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
    private router: Router,
  ) {
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();
    this.isAuthLoaded$ = this.isAuthLoadedSubject.asObservable();

    this.ticks = this.seconds.subscribe(() => this.loginWrapper());

    // this code guarantees that the login button is shown
    this.isAuthLoaded$.subscribe((isAuthLoaded: boolean) => {
      if (isAuthLoaded) {
        this.showLoginButton();
      }
      this.refresh();
    });
  }

  /** Initialize OAuth2. */
  public initGoogleAuth = async (): Promise<void> =>
    new Promise(resolve => {
      if (typeof google === 'object' && typeof google.accounts === 'object') {
        google.accounts.id.initialize({
          client_id: environment.oauthClientID,
          auto_select: true,
          cancel_on_tap_outside: false,
          callback: (res) => {
            this.credential = res.credential;
            this.user = JSON.parse(atob(res.credential.split('.')[1]));
            resolve();
            this.saveLoginParams(true, this.user);
          },
        });
        this.isAuthLoaded = true;
        google.accounts.id.prompt((/* notif */) => {
          // console.log(notif);
        });
      }
    });


  /** Determine whether or not login is needed and return. */
  public login = async (): Promise<LoginResponse> => {
    const resp: LoginResponse = { isLoggedIn: false, user: undefined };
    if (environment.mockBackend) {
      this.isAuthLoaded = true;
      this.isLoggedIn = true;
      resp.isLoggedIn = this.isLoggedIn;
      resp.user = this.user;
    } else {
      if (!this.isAuthLoaded) {
        await this.initGoogleAuth();
        resp.isLoggedIn = this.isLoggedIn;
        resp.user = this.user;
      }
    }
    return resp;
  };

  public updateSigninStatus = (isLoggedIn: boolean): void => {
    this.isLoggedInSubject.next(isLoggedIn || false);
  };

  /** Get the current user object if logged in or force a login. */
  public getCurrentUser = async (
  ): Promise<any> => {
    if (this.isLoggedIn) {
      return Promise.resolve(this.user);
    } else {
      await this.login();
      return this.user;
    }
  };

  /** Sign out of Google OAuth2. */
  public signOut = async (): Promise<void> => {
    if (environment.mockBackend) {
      if (this.isLoggedIn) {
        // this.authInstance.signOut();
      }
      this.isLoggedIn = false;
      this.refresh();
      return Promise.resolve();
    } else {
      // Hit the logout endpoint to invalidate session
      return lastValueFrom(this.http.get(
        environment.backendURL + 'logout', {
          observe: 'response',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            EMAIL: this.email || '',
          }
        })
      ).then(resp => {
        if (resp.status > 299 || resp.status < 200) {
          return Promise.reject('Sign in failed');
        } else {
          return resp;
        }
      }).then(() => {
        // If session invalid, go ahead and log out of OAuth
        if (this.isLoggedIn) {
          google.accounts.id.disableAutoSelect();
        }
        this.isLoggedIn = false;
        this.user = undefined;
        this.loginPromise = new Promise(res => {
          this.resolveLogin = res;
        });
        this.refresh();
      }).catch(e => {
        // alert('Sign out failed!');  it makes no sense to pop this to user.
        // they cannot do anything anyway.
        google.accounts.id.disableAutoSelect();
        console.log(e);
        this.refresh();
      });
    }
  };

  public refresh = (): void => {
    this.ngZone.run(() => this.router.navigateByUrl('/'));
  };

  /** Display google login button */
  public showLoginButton = async (): Promise<void> => {
    if (this.loginBtn && this.isAuthLoaded) {
      google.accounts.id.renderButton(this.loginBtn, {
        type: 'standard',
        size: 'large',
        theme: 'outline',
      });
    }
  };

  // Private methods

  /** Calls login. If login successfule, ends login loop */
  private loginWrapper = (
  ): void => {
    this.login();
    if (this.isAuthLoaded) {
      this.ticks.unsubscribe();
    }
    // console.log('Login Delay', time);
  };

  /** Constructs a login response and updates appropriate state. */
  private saveLoginParams = (
    isLoggedIn: boolean,
    user: any,
  ): void => {
    let resolveLogin = false;
    if (!this.isLoggedIn && isLoggedIn) {
      resolveLogin = true;
    }
    this.isLoggedIn = isLoggedIn;
    this.user = user;
    if (isLoggedIn) {
      this.email = this.user.email;
      this.imageURL = this.user.picture;
      this.givenName = this.user.given_name;
      this.familyName = this.user.family_name;
      if (resolveLogin) {
        this.resolveLogin();
      }
    }
    this.updateSigninStatus(isLoggedIn);
  };

}
