import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { LoggingService } from '../services/logging.service';


/** Request and Response types */
export type LoginRequest = {
  email: string,
  password: string
}

export type LoginResponse = {
  authenticated: boolean,
  token?: SessionToken,
  user?: UserInfo
}

/** The stored data types of the token and user */
type SessionToken = {
  sessionToken: string,
  expires: number
}

type UserInfo = {
  firstName: string,
  lastName: string,
  email: string,
  uuid: string
}

/** The local storage key for the token */
const TOKEN_LOCAL_KEY = "RoleCallToken";

/** The local storage key for the user */
const USER_LOCAL_KEY = "RoleCallUser";

/**
 * Service that handles logging in and obtaining the session token
 */
@Injectable({
  providedIn: 'root'
})
export class LoginApi {

  /** The current session token */
  token: SessionToken;
  /** Whether the token and user has been loaded already */
  isLoggedIn = false;
  /** The current user */
  user: UserInfo;

  constructor(private loggingService: LoggingService) { }

  /** Submit login credentials and await response */
  private submitLoginCredentials(request: LoginRequest): Observable<LoginResponse> {
    return of({
      authenticated: true,
      token: {
        sessionToken: "example-session-token",
        expires: (Date.now() + 99999999)
      },
      user: {
        firstName: "example first",
        lastName: "example last",
        email: request.email,
        uuid: "example_uuid"
      }
    });
  }

  /** Save the session token */
  private saveSession(token: SessionToken, user: UserInfo) {
    this.token = token;
    this.user = user;
    localStorage.setItem(TOKEN_LOCAL_KEY, JSON.stringify(this.token));
    localStorage.setItem(USER_LOCAL_KEY, JSON.stringify(this.user));
    this.isLoggedIn = true;
  }

  /** Grabs the token from local storage and load it */
  private loadSession(): SessionToken {
    let prevTokenStr = localStorage.getItem(TOKEN_LOCAL_KEY);
    let prevToken: SessionToken = JSON.parse(prevTokenStr);
    this.token = prevToken;
    let prevUserStr = localStorage.getItem(USER_LOCAL_KEY);
    let prevUser: UserInfo = JSON.parse(prevUserStr);
    this.user = prevUser;
    this.isLoggedIn = true;
    return prevToken;
  }

  /** Whether a login is required or not */
  public requiresLogin(request: LoginRequest): boolean {
    if (this.isLoggedIn) {
      if (this.getCurrentUser().email != request.email) {
        return true;
      }
      if (Date.now() > this.token.expires) {
        this.isLoggedIn = false;
        return true;
      }
      return false;
    }
    let prevSavedToken = localStorage.getItem(TOKEN_LOCAL_KEY);
    if (isNullOrUndefined(prevSavedToken)) {
      return true;
    } else {
      let prevToken: SessionToken;
      try {
        prevToken = JSON.parse(prevSavedToken);
      } catch (e) {
        this.loggingService.logError(e);
        return true;
      }
      if (Date.now() > prevToken.expires) {
        return true;
      }
    }
    let prevSavedUserStr = localStorage.getItem(TOKEN_LOCAL_KEY);
    if (isNullOrUndefined(prevSavedUserStr)) {
      return true;
    } else {
      let prevUser: UserInfo;
      try {
        prevUser = JSON.parse(prevSavedUserStr);
      } catch (e) {
        this.loggingService.logError(e);
        return true;
      }
    }
    return false;
  }

  /** Determine whether or not login is needed and return */
  public login(request: LoginRequest): Observable<LoginResponse> {
    if (this.requiresLogin(request)) {
      return this.submitLoginCredentials(request).pipe(map(res => {
        if (res.authenticated) {
          this.saveSession(res.token, res.user);
          return res;
        } else {
          return {
            authenticated: false
          };
        }
      }));
    } else {
      if (!this.isLoggedIn) {
        this.loadSession();
      }
      return of({
        authenticated: true,
        token: this.token,
        user: this.user
      });
    }
  }

  /** Get the current user object if logged in */
  public getCurrentUser(): UserInfo {
    if (this.isLoggedIn) {
      return this.user;
    } else {
      return null;
    }
  }

  /** Get the current session token if logged in */
  public getCurrentSessionToken(): SessionToken {
    if (this.isLoggedIn) {
      return this.token;
    } else {
      return null;
    }
  }

}
