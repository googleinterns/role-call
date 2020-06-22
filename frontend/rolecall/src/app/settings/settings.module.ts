import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsBaseComponent } from './settings_base.component'


@NgModule({
  declarations: [SettingsBaseComponent],
  imports: [
    CommonModule
  ],
  exports: [
    SettingsBaseComponent
  ]
})
export class SettingsModule { }
