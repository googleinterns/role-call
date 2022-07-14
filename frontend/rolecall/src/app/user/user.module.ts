import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {CommonComponentsModule,
} from '../common_components/common_components.module';
import {UserEditor} from './user-editor.component';

@NgModule({
  declarations: [UserEditor],
  imports: [
    CommonComponentsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ]
})
export class UserModule {
}
