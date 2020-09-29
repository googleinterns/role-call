import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CastEditorV2} from './cast-editor-v2.component';
import {CastModule} from './cast.module';


const routes: Routes = [
  {path: 'cast', component: CastEditorV2},
  {path: 'cast/:uuid', component: CastEditorV2},
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CastModule],
  exports: [RouterModule]
})
export class CastRoutingModule { }
