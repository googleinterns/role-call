import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {CommonComponentsModule,
} from '../common-components/common-components.module';
import {SegmentEditor} from './segment-editor.component';


@NgModule({
  declarations: [SegmentEditor],
  imports: [
    CommonModule,
    MatButtonModule,
    CommonComponentsModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    DragDropModule,
    MatFormFieldModule,
    MatSelectModule,
  ]
})
export class SegmentModule {
}
