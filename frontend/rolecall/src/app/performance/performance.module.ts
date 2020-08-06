import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonComponentsModule } from '../common_components/common_components.module';
import { PerformanceEditor } from './performance-editor.component';



@NgModule({
  declarations: [PerformanceEditor],
  imports: [
    CommonModule,
    CommonComponentsModule,
    MatButtonModule
  ]
})
export class PerformanceModule { }
