import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HomepageBase } from './homepage_base.component';
import { HomepageHeader } from './homepage_header.component';


@NgModule({
  declarations: [HomepageHeader, HomepageBase],
  imports: [
    CommonModule
  ],
  exports: [HomepageBase]
})
export class HomepageModule { }
