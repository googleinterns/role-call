import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonComponentsModule } from '../common_components/common_components.module';
import { CastRoutingModule } from './cast-routing.module';
import { CastingEditor } from './casting_editor.component';



@NgModule({
  declarations: [CastingEditor],
  imports: [
    CommonModule,
    CastRoutingModule,
    CommonComponentsModule
  ]
})
export class CastModule { }
