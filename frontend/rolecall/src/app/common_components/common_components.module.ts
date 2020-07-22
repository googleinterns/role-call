import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EditableDateInput } from './editable_date_input.component';
import { EditableMultiSelectInput } from './editable_multiselect_input.component';
import { EditableTextInput } from './editable_text_input.component';
import { EmptyStringIfUndefinedPipe } from './empty_string_if_undefined.pipe';


@NgModule({
  declarations: [EditableTextInput, EditableDateInput, EditableMultiSelectInput, EmptyStringIfUndefinedPipe],
  imports: [
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSelectModule,
    FormsModule
  ],
  exports: [EditableTextInput, EditableDateInput, EditableMultiSelectInput, EmptyStringIfUndefinedPipe]
})
export class CommonComponentsModule { }
