import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CastEditorV2 } from './cast-editor-v2.component';
import { CastModule } from './cast.module';
import { CastingEditor } from './casting_editor.component';


const routes: Routes = [
  { path: 'castv1/:uuid', component: CastingEditor },
  { path: 'castv1', component: CastingEditor },
  { path: 'cast', component: CastEditorV2 },
  { path: 'cast/:uuid', component: CastEditorV2 },
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CastModule],
  exports: [RouterModule]
})
export class CastRoutingModule { }
