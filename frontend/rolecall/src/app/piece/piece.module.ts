import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonComponentsModule } from '../common_components/common_components.module';
import { PieceEditor } from './piece_editor.component';



@NgModule({
  declarations: [PieceEditor],
  imports: [
    CommonModule,
    MatButtonModule,
    CommonComponentsModule,
    MatIconModule,
    DragDropModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class PieceModule { }
