import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerformanceEditor } from './performance-editor.component';
import { PerformanceModule } from './performance.module';


const routes: Routes = [
  { path: 'performance/:uuid', component: PerformanceEditor },
  { path: 'performance', component: PerformanceEditor }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    PerformanceModule],
  exports: [RouterModule]
})
export class PerformanceRoutingModule { }
