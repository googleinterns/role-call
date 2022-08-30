import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SegmentModule } from './segment.module';
import { SegmentEditor } from './segment-editor.component';


const routes: Routes = [
  {path: 'segment/:uuid', component: SegmentEditor},
  {path: 'segment', component: SegmentEditor},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SegmentModule,
  ],
  exports: [RouterModule]
})
export class SegmentRoutingModule {
}
