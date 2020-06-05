import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageHeaderComponent } from './homepage-header/homepage-header.component';
import { HomepageBaseComponent } from './homepage-base/homepage-base.component';



@NgModule({
  declarations: [HomepageHeaderComponent, HomepageBaseComponent],
  imports: [
    CommonModule
  ],
  exports: [HomepageBaseComponent]
})
export class HomepageModule { }
