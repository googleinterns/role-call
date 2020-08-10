import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CastModule } from '../cast/cast.module';
import { CommonComponentsModule } from '../common_components/common_components.module';
import { PerformanceEditor } from './performance-editor.component';



@NgModule({
  declarations: [PerformanceEditor],
  imports: [
    CommonModule,
    CommonComponentsModule,
    CastModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    DragDropModule
  ]
})
export class PerformanceModule { }
