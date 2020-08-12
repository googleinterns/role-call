import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ClassProvider, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CastRoutingModule } from '../cast/cast-routing.module';
import { LoginModule } from '../login/login.module';
import { PerformanceRoutingModule } from '../performance/performance-routing.module';
import { PieceRoutingModule } from '../piece/piece-routing.module';
import { RequestInterceptorService } from '../services/request-interceptor.service';
import { UserRoutingModule } from '../user/user-routing.module';
import { App } from './app.component';
import { AppRoutingModule } from './app_routing.module';
import { SideNav } from './side_nav.component';
import { SiteHeader } from './site_header.component';

const LOGGING_INTERCEPTOR_PROVIDER: ClassProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: RequestInterceptorService,
  multi: true
};


@NgModule({
  declarations: [
    App,
    SiteHeader,
    SideNav
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    NgbModule,
    LoginModule,
    // Routing
    PerformanceRoutingModule,
    CastRoutingModule,
    PieceRoutingModule,
    UserRoutingModule,
    AppRoutingModule,
  ],
  providers: [
    LOGGING_INTERCEPTOR_PROVIDER
  ],
  bootstrap: [App]
})
export class AppModule { }
