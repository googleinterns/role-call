import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {CastModule} from '../cast/cast.module';
import {CommonComponentsModule,
} from '../common-components/common-components.module';
import {PerformanceEditor} from './performance-editor.component';


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
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    DragDropModule,
  ]
})
export class PerformanceModule {
}
