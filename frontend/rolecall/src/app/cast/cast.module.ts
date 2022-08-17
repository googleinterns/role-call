import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonComponentsModule,
} from '../common-components/common-components.module';
import {CastDragAndDrop} from './cast-drag-and-drop.component';
import {CastEditor} from './cast-editor.component';


@NgModule({
  declarations: [CastDragAndDrop, CastEditor],
  imports: [
    CommonModule,
    MatButtonModule,
    CommonComponentsModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DragDropModule,
    NgbModule,
  ],
  exports: [CastDragAndDrop]
})
export class CastModule {
}
