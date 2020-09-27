import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PieceModule} from './piece.module';
import {PieceEditor} from './piece_editor.component';


const routes: Routes = [
  {path: 'segment/:uuid', component: PieceEditor},
  {path: 'segment', component: PieceEditor},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PieceModule,
  ],
  exports: [RouterModule]
})
export class PieceRoutingModule {
}
