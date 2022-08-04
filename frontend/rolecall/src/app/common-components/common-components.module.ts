import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

import {EditableDateInput} from './editable-date-input.component';
import {EditableMultiSelectInput} from './editable-multiselect-input.component';
import {EditableTextInput} from './editable-text-input.component';
import {EmptyStringIfUndefinedPipe} from './empty-string-if-undefined.pipe';
import {FullNamePipe} from './full-name.pipe';
import {LoadingSpinnerComponent} from './loading-spinner.component';
import {NumberToPlacePipe} from './number-to-place.pipe';
import {Stepper} from './stepper.component';
import {ClickOutsideModule} from 'ng-click-outside';

@NgModule({
  declarations: [
    EditableTextInput,
    EditableDateInput,
    EditableMultiSelectInput,
    EmptyStringIfUndefinedPipe,
    FullNamePipe,
    NumberToPlacePipe,
    Stepper,
    LoadingSpinnerComponent,
  ],
  imports: [
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSelectModule,
    FormsModule,
    MatAutocompleteModule,
    MatIconModule,
    ClickOutsideModule,
  ],
  exports: [
    EditableTextInput,
    EditableDateInput,
    EditableMultiSelectInput,
    EmptyStringIfUndefinedPipe,
    FullNamePipe,
    NumberToPlacePipe,
    Stepper,
    LoadingSpinnerComponent,
  ]
})
export class CommonComponentsModule {
}
