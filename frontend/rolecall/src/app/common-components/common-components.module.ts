import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';

import {ActionButtonsComponent} from './action-buttons.component';
import {DateHeaderComponent} from './date-header.component';
import {EditableDateInput} from './editable-date-input.component';
import {EditableMultiSelectInput} from './editable-multiselect-input.component';
import {EditableTextInput} from './editable-text-input.component';
import {EmptyStringIfUndefinedPipe} from './empty-string-if-undefined.pipe';
import {FullNamePipe} from './full-name.pipe';
import {LoadingSpinnerComponent} from './loading-spinner.component';
import {NumberToPlacePipe} from './number-to-place.pipe';
import {PerfButtonsComponent} from './perf-buttons.component';
import {Stepper} from './stepper.component';
import {ClickOutsideModule} from 'ng-click-outside';

@NgModule({
  declarations: [
    ActionButtonsComponent,
    DateHeaderComponent,
    EditableTextInput,
    EditableDateInput,
    EditableMultiSelectInput,
    EmptyStringIfUndefinedPipe,
    FullNamePipe,
    NumberToPlacePipe,
    PerfButtonsComponent,
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
    MatMenuModule,
    MatTooltipModule,
    ClickOutsideModule,
  ],
  exports: [
    ActionButtonsComponent,
    DateHeaderComponent,
    EditableTextInput,
    EditableDateInput,
    EditableMultiSelectInput,
    EmptyStringIfUndefinedPipe,
    FullNamePipe,
    NumberToPlacePipe,
    PerfButtonsComponent,
    Stepper,
    LoadingSpinnerComponent,
  ]
})
export class CommonComponentsModule {
}
