import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterModule} from '@angular/router';
import {CommonComponentsModule,
} from '../common_components/common_components.module';
import {Dashboard} from './dashboard.component';
import {HomepageBase} from './homepage_base.component';


@NgModule({
  declarations: [HomepageBase, Dashboard],
  imports: [
    CommonModule,
    CommonComponentsModule,
    RouterModule,
    MatButtonModule
  ],
  exports: [HomepageBase]
})
export class HomepageModule {
}
