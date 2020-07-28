import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonComponentsModule } from '../common_components/common_components.module';
import { CastDragAndDrop } from './cast-drag-and-drop.component';
import { CastEditorV2 } from './cast-editor-v2.component';
import { CastingEditor } from './casting_editor.component';



@NgModule({
  declarations: [CastingEditor, CastDragAndDrop, CastEditorV2],
  imports: [
    CommonModule,
    MatButtonModule,
    CommonComponentsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DragDropModule
  ]
})
export class CastModule { }
