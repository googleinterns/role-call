import { NgModule } from '@angular/core';
import { EditableTextInput } from './editable_text_input.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [EditableTextInput],
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule
  ],
  exports: [EditableTextInput]
})
export class CommonComponentsModule { }
