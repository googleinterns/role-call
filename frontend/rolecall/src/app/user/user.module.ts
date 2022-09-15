import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { CommonComponentsModule,
} from '../common-components/common-components.module';
import { UserEditor } from './user-editor.component';

@NgModule({
  declarations: [UserEditor],
  imports: [
    CommonComponentsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
  ]
})
export class UserModule {
}
