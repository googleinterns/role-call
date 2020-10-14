import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WelcomePage} from './welcome-page.component';


@NgModule({
  declarations: [WelcomePage],
  imports: [
    CommonModule
  ],
  exports: [WelcomePage]
})
export class LoginModule {
}
