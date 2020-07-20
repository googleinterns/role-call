import { UserEditorComponent } from './user-editor.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonComponentsModule } from '../common_components/common_components.module';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [UserEditorComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    CommonComponentsModule,
    MatInputModule,
  ]
})
export class UserModule { }

