import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonComponentsModule } from '../common_components/common_components.module';
import { PieceEditor } from './piece_editor.component';



@NgModule({
  declarations: [PieceEditor],
  imports: [
    CommonModule,
    MatButtonModule,
    CommonComponentsModule,
    MatIconModule,
  ]
})
export class PieceModule { }
