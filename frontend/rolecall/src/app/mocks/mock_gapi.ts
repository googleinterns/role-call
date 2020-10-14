/**
 * A mocked GAPI instance for simulating OAuth2 signins
 */
export class MockGAPI {
  /** The time at which the GAPI was created */
  moment = Date.now();
  /** The time after which the token will expire */
  expiresTime = 1000 * 60 * 30;
  /** Test user email */
  testEmail = 'testEmail@test.com';
  /** A mocked GAPI user object */
  testUser = {
    Ea: '115743193108649754154',
    getAuthResponse: () => {
      return this.testUser.wc;
    },
    reloadAuthResponse: () => {
      this.moment = Date.now();
      this.testUser.wc = {
        token_type: 'Bearer',
        access_token: 'access_token',
        scope: 'email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        login_hint: 'login_hint',
        expires_in: this.expiresTime,
        id_token: 'id_token',
        session_state: {
          extraQueryParams: {authuser: '0'}
        },
        first_issued_at: this.moment,
        expires_at: this.moment + this.expiresTime,
        idpId: 'google'
      };
      return Promise.resolve(this.testUser.wc);
    },
    wc: {
      token_type: 'Bearer',
      access_token: 'access_token',
      scope: 'email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
      login_hint: 'login_hint',
      expires_in: this.expiresTime,
      id_token: 'id_token',
      session_state: {
        extraQueryParams: {authuser: '0'}
      },
      first_issued_at: this.moment,
      expires_at: this.moment + this.expiresTime,
      idpId: 'google'
    },
    Ot: {
      JU: 'JU',
      Cd: 'TestFirst TestLast',
      nW: 'TestFirst',
      nU: 'TestLast',
      PK: 'https://lh5.googleusercontent.com/-Pum6kbwXqbM/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckIUxE4zd7UrOeWGKpPHNsCYG9fXQ/s96-c/photo.jpg',
      yu: this.testEmail
    },
    getBasicProfile: () => {
      return {
        getEmail: () => {
          return this.testUser.Ot.yu;
        },
        getImageUrl: () => {
          return this.testUser.Ot.PK;
        },
        getGivenName: () => {
          return this.testUser.Ot.nW;
        },
        getFamilyName: () => {
          return this.testUser.Ot.nU;
        }
      };
    }
  };

  /** Whether or not the mock GAPI is signed in */
  isSignedInVal = false;
  /** Whether the mock GAPI should reject the sign-in promise */
  shouldThrowSignInError = false;

  /** Returns a mocked GAPI object, complete with mocked OAuth2 object */
  mock() {
    return {
      auth2: {
        init: (options) => {
          return Promise.resolve({
            signIn: () => {
              if (this.shouldThrowSignInError) {
                return Promise.reject('Reason');
              }
              this.isSignedInVal = true;
              return Promise.resolve(this.testUser);
            },
            isSignedIn: {
              get: () => {
                return this.isSignedInVal;
              }
            },
            currentUser: {
              get: () => {
                if (this.isSignedInVal) {
                  return this.testUser;
                } else {
                  return undefined;
                }
              }
            },
            disconnect: () => {
            },
            signOut: () => {
              this.isSignedInVal = false;
            }
          });
        }
      },
      load: (tag: string, callback: Function) => {
        callback();
      },
    };
  };
}
