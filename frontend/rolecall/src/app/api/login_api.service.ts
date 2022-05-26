import {HttpClient} from '@angular/common/http';
//import { not } from '@angular/compiler/src/output/output_ast';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {environment} from 'src/environments/environment';

export type LoginResponse = {
  authenticated: boolean,
  user: google.accounts.id.Credential
};

/** Service that handles logging in and obtaining the session token. */
@Injectable({providedIn: 'root'})
export class LoginApi {
  /** Whether the user has been loaded already. */
  isLoggedIn = false;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // /** The current user. */
  user: any;

  /** If the google OAuth2 api is loaded. */
  isAuthLoaded = false;

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
      private http: HttpClient,
      private router: Router) {
    this.updateSigninStatus = this.updateSigninStatus.bind(this);   
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
          this.user =  JSON.parse(atob(res.credential.split('.')[1]));
          resolve();
        }
      });      
      google.accounts.id.prompt((notif) => {console.log(notif)});
    })
  }  


  /** Determine whether or not login is needed and return. */
  public async login(flag: boolean = false): Promise<void> {       
    if (!this.isAuthLoaded) {
     await this.initGoogleAuth();
    }
    this.getLoginResponse(flag, true,this.user);
    
  }


  
      // // Return user if already signed in and token not expired
      // if (this.authInstance.isSignedIn.get()) {
      //   // Check if token is expired, and refresh if needed
      //   if (Date.now() < this.authInstance.currentUser.get()
      //       .getAuthResponse().expires_at) {
      //     return prom.then(() => {
      //       return this.getLoginResponse(true, true,
      //           this.authInstance.currentUser.get());
      //     });
      //   } else {
      //     return prom.then(() => {
      //       return this.authInstance.currentUser.get()
      //           .reloadAuthResponse()
      //           .then(() => {
      //             return this.getLoginResponse(true, true,
      //                 this.authInstance.currentUser.get());
      //           });
      //     });
      //   }
    
    

  /** Constructs a login response and updates appropriate state. */
  private getLoginResponse(
      authed: boolean,
      isLoggedIn: boolean,
      user: any): LoginResponse {
    let resolveLogin = false;
    if (!this.isLoggedIn && isLoggedIn) {
      resolveLogin = true;
    }
    this.isLoggedIn = isLoggedIn;
    this.user = user;
    if (isLoggedIn) {
      const basicProf = this.user;
      this.email = basicProf.email;
      this.imageURL = basicProf.picture;
      this.givenName = basicProf.given_name;
      this.familyName = basicProf.family_name;
      if (resolveLogin) {
        this.resolveLogin();
      }
    }
    return {
      authenticated: authed,
      user: this.user
    };
  }

  public updateSigninStatus(isLoggedIn) {
    this.isLoggedInSubject.next(isLoggedIn || false);
  }

  /** Get the current user object if logged in or force a login. */
  public async getCurrentUser(): Promise<any> {
    if (this.isLoggedIn) {
      return Promise.resolve(this.user);
    } else {
      return this.login(true);
    }
  }

  
  public async signOut(): Promise<void> {
    if (environment.mockBackend) {
   // lib sign out 
      this.isLoggedIn = false;
      this.refresh();
      return Promise.resolve();
    } else {
      // Hit the logout endpoint to invalidate session
      return this.http.get(environment.backendURL + 'logout',
          {
            observe: 'response',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'EMAIL': this.email || ''
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

  refresh() {
    this.router.navigateByUrl('/');
  }
}
