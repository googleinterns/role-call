import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoggingService } from '../services/logging.service';


/** Request and Response types */
export type LoginRequest = {
  email: string,
  password: string
}

export type LoginResponse = {
  authenticated: boolean,
  user: gapi.auth2.GoogleUser
}


/**
 * Service that handles logging in and obtaining the session token
 */
@Injectable({
  providedIn: 'root'
})
export class LoginApi {

  /** Whether the user has been loaded already */
  isLoggedIn = false;
  /** The current user */
  user: gapi.auth2.GoogleUser;
  /** The google OAuth2 instance */
  authInstance: gapi.auth2.GoogleAuth;
  /** If the google OAuth2 api is loaded */
  isAuthLoaded: boolean = false;

  constructor(private loggingService: LoggingService) { }

  /** Initialize OAuth2 */
  public async initGoogleAuth(): Promise<void> {
    const pload = new Promise((resolve) => {
      gapi.load('auth2', resolve);
    });
    return pload.then(async () => {
      await gapi.auth2
        .init({ client_id: environment.oauthClientID })
        .then(auth => {
          this.isAuthLoaded = true;
          this.authInstance = auth;
        });
    });
  }

  /** Determine whether or not login is needed and return */
  public async login(openDialog: boolean): Promise<LoginResponse> {
    let prom = Promise.resolve();
    // Load OAuth2 if not already loaded
    if (!this.isAuthLoaded) {
      prom = prom.then(() => {
        return this.initGoogleAuth();
      });
    }
    return prom.then(() => {
      // Return user if already signed in and token not expired
      if (this.authInstance.isSignedIn.get()) {
        if (Date.now() < this.authInstance.currentUser.get().getAuthResponse().expires_at) {
          return prom.then(() => {
            return this.getLoginResponse(true, true, this.authInstance.currentUser.get())
          });
        } else {
          return prom.then(() => {
            return this.authInstance.currentUser.get().reloadAuthResponse().then(() => {
              return this.getLoginResponse(true, true, this.authInstance.currentUser.get());
            })
          });
        }
      }
      if (openDialog) {
        // Sign in and retrieve user
        return prom.then(() => {
          return this.authInstance.signIn().then(
            (user => {
              return this.getLoginResponse(true, true, user);
            }),
            ((reason) => {
              this.loggingService.logError(reason);
              return this.getLoginResponse(false, false, undefined);
            })
          )
        });
      } else {
        return this.getLoginResponse(false, false, undefined);
      }
    });
  }

  /** Constructs a login response and updates appropriate state */
  private getLoginResponse(authed: boolean, isLoggedIn: boolean, user: gapi.auth2.GoogleUser): LoginResponse {
    this.isLoggedIn = isLoggedIn;
    this.user = user;
    return {
      authenticated: authed,
      user: this.user
    };
  }

  /** Get the current user object if logged in or force a login */
  public async getCurrentUser(): Promise<gapi.auth2.GoogleUser> {
    if (this.isLoggedIn) {
      return Promise.resolve(this.user);
    } else {
      return await this.login(false).then(val => val.user);
    }
  }

  /** Sign out of Google OAuth2 */
  public signOut() {
    if (this.isLoggedIn) {
      this.authInstance.signOut();
    }
    this.isLoggedIn = false;
  }

}
