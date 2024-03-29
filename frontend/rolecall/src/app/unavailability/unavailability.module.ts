import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonComponentsModule,
} from '../common-components/common-components.module';
import { UnavailabilityEditor } from './unavailability-editor.component';


@NgModule({
  declarations: [UnavailabilityEditor],
  imports: [
    CommonModule,
    CommonComponentsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
  ]
})
export class UnavailabilityModule {
}
