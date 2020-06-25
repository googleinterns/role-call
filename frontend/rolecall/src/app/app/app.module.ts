import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
