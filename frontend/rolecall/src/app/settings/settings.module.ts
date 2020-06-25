import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SettingsBase } from './settings_base.component';


@NgModule({
  declarations: [SettingsBase],
  imports: [
    CommonModule
  ],
  exports: [
    SettingsBase
  ]
})
export class SettingsModule { }
