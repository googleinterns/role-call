import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageHeaderComponent } from './homepage_header.component';
import { HomepageBaseComponent } from './homepage_base.component';
import { CommonComponentsModule } from '../common/common.module';



@NgModule({
  declarations: [HomepageHeaderComponent, HomepageBaseComponent],
  imports: [
    CommonModule
  ],
  exports: [HomepageBaseComponent]
})
export class HomepageModule { }
