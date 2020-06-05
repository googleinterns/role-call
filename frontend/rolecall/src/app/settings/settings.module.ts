import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsBaseComponent } from './settings-base/settings-base.component'


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
