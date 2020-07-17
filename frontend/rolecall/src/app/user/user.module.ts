import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserEditorComponent } from './user-editor.component';
import { UserRoutingModule } from './user-routing.module';



@NgModule({
  declarations: [UserEditorComponent],
  imports: [
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }
