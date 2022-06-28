import {HttpClient} from '@angular/common/http';
import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {environment} from 'src/environments/environment';

export type LoginResponse = {
  isSignedIn: boolean,
  user: google.accounts.id.Credential,
};

/** Service that handles logging in and obtaining the session token. */
@Injectable({providedIn: 'root'})
export class LoginApi {
  /** Whether the user has been loaded already. */
  isLoggedIn = false;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  /** The current user. */
  user: google.accounts.id.Credential;

  /** If the google OAuth2 api is loaded. */
  isAuthLoaded = false;

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

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
    private router: Router,
  ) {
  }

  /** Initialize OAuth2. */
  public async initGoogleAuth(): Promise<void> {
    return new Promise(resolve => {
      google.accounts.id.initialize({
        client_id: environment.oauthClientID,
        auto_select: true,
        cancel_on_tap_outside: false,
        callback: (res) => {
          this.isAuthLoaded = true;
          this.user = JSON.parse(atob(res.credential.split('.')[1]));
          resolve();
          this.getLoginResponse(true, this.user);
        },
      });
      this.showLoginButton();
      google.accounts.id.prompt((notif) => {
        console.log(notif);
      });
    });
  }

  /** Determine whether or not login is needed and return. */
  public async login(): Promise<void> {
    if (!this.isAuthLoaded) {
      await this.initGoogleAuth();
    }
  }

  /** Constructs a login response and updates appropriate state. */
  private getLoginResponse(
    isLoggedIn: boolean,
    user: google.accounts.id.Credential,
  ): LoginResponse {
    let resolveLogin = false;
    if (!this.isLoggedIn && isLoggedIn) {
      resolveLogin = true;
    }
    this.isLoggedIn = isLoggedIn;
    this.user = user;
    if (isLoggedIn) {
      const credential = this.user as any;
      this.email = credential.email;
      this.imageURL = credential.picture;
      this.givenName = credential.given_name;
      this.familyName = credential.family_name;
      if (resolveLogin) {
        this.resolveLogin();
      }
    }
    this.updateSigninStatus(isLoggedIn);
    return {
      isSignedIn: isLoggedIn,
      user: this.user
    };
  }

  public updateSigninStatus = (isLoggedIn) => {
    this.isLoggedInSubject.next(isLoggedIn || false);
  }

  /** Get the current user object if logged in or force a login. */
  public async getCurrentUser(): Promise<google.accounts.id.Credential> {
    if (this.isLoggedIn) {
      return Promise.resolve(this.user);
    } else {
      await this.login();
      return this.user;
    }
  }

  /** Sign out of Google OAuth2. */
  public async signOut(): Promise<void> {
    if (environment.mockBackend) {
      if (this.isLoggedIn) {
        // this.authInstance.signOut();
      }
      this.isLoggedIn = false;
      this.refresh();
      return Promise.resolve();
    } else {
      // Hit the logout endpoint to invalidate session
      return this.http.get(environment.backendURL + 'logout', {
          observe: 'response',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'EMAIL': this.email || '',
          }
        }
      ).toPromise().then(resp => {
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
        this.loginPromise = new Promise(res => {
          this.resolveLogin = res;
        });
        this.refresh();
      }).catch(e => {
        //alert('Sign out failed!');  it makes no sense to pop this to user.
        // they cannot do anything anyway.
        google.accounts.id.disableAutoSelect();
        console.log(e);
        this.refresh();
      });
    }
  }

  public refresh = (): void => {
    this.ngZone.run(() => this.router.navigateByUrl('/'));
  };

  /** Display google login button */
  public showLoginButton(): void {
    if (this.loginBtn) {
      google.accounts.id.renderButton(this.loginBtn, {
        type: 'standard',
        size: 'large',
        theme: 'outline',
      });  
    }
  }

}
