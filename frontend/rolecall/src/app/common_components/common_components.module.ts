import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EditableDateInput } from './editable_date_input.component';
import { EditableMultiSelectInput } from './editable_multiselect_input.component';
import { EditableTextInput } from './editable_text_input.component';
import { EmptyStringIfUndefinedPipe } from './empty_string_if_undefined.pipe';
import { NumberToPlacePipe } from './number_to_place.pipe';
import { Stepper } from './stepper.component';

@NgModule({
  declarations: [EditableTextInput, EditableDateInput, EditableMultiSelectInput, EmptyStringIfUndefinedPipe, NumberToPlacePipe, Stepper],
  imports: [
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSelectModule,
    FormsModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  exports: [EditableTextInput, EditableDateInput, EditableMultiSelectInput, EmptyStringIfUndefinedPipe, NumberToPlacePipe, Stepper]
})
export class CommonComponentsModule { }
