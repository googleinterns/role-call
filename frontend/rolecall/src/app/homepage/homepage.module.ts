import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HomepageBase } from './homepage_base.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'

@NgModule({
  declarations: [HomepageBase],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [HomepageBase]
})
export class HomepageModule { }
