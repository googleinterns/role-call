import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageHeaderComponent } from './homepage-header/homepage-header.component';
import { HomepageBaseComponent } from './homepage-base/homepage-base.component';
import { CommonComponentsModule } from '../common-components/common-components.module';



@NgModule({
  declarations: [HomepageHeaderComponent, HomepageBaseComponent],
  imports: [
    CommonComponentsModule,
    CommonModule
  ],
  exports: [HomepageBaseComponent]
})
export class HomepageModule { }
