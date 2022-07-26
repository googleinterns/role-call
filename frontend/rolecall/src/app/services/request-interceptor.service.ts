import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {LoginApi} from '../api/login_api.service';

@Injectable({providedIn: 'root'})
export class RequestInterceptorService implements HttpInterceptor {

  constructor(private loginAPI: LoginApi) {
  }

  intercept = (
      req: HttpRequest<any>,
      next: HttpHandler,
  ): Observable<HttpEvent<any>> => {
    // Ensures fresh Google OAuth token
    this.loginAPI.login();
    if (environment.logRequests) {
      console.log(req);
    }
    return next.handle(req);
  };
}
