import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CastRoutingModule } from '../cast/cast-routing.module';
import { PerformanceRoutingModule } from '../performance/performance-routing.module';
import { PieceRoutingModule } from '../piece/piece-routing.module';
import { UserRoutingModule } from '../user/user-routing.module';
import { App } from './app.component';
import { AppRoutingModule } from './app_routing.module';
import { SideNav } from './side_nav.component';
import { SiteHeader } from './site_header.component';


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
    // Routing
    PerformanceRoutingModule,
    CastRoutingModule,
    PieceRoutingModule,
    UserRoutingModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
