import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ClassProvider, NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CastRoutingModule} from '../cast/cast-routing.module';
import {LoginModule} from '../login/login.module';
import {PerformanceRoutingModule,
} from '../performance/performance-routing.module';
import {SegmentRoutingModule} from '../segment/segment-routing.module';
import {RequestInterceptorService,
} from '../services/request-interceptor.service';
import {UnavailabilityRoutingModule,
} from '../unavailability/unavailability-routing.module';
import {UserRoutingModule} from '../user/user-routing.module';
import {App} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {SideNav} from './side-nav.component';
import {SiteHeader} from './site-header.component';

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
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    NgbModule,
    LoginModule,
    // Routing
    UnavailabilityRoutingModule,
    PerformanceRoutingModule,
    CastRoutingModule,
    SegmentRoutingModule,
    UserRoutingModule,
    AppRoutingModule,
  ],
  providers: [
    LOGGING_INTERCEPTOR_PROVIDER,
  ],
  bootstrap: [App]
})
export class AppModule {
}
