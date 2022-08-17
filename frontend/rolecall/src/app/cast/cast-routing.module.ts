import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CastEditor} from './cast-editor.component';
import {CastModule} from './cast.module';


const routes: Routes = [
  {path: 'cast', component: CastEditor},
  {path: 'cast/:uuid', component: CastEditor},
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CastModule],
  exports: [RouterModule]
})
export class CastRoutingModule {
}
