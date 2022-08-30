import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnavailabilityEditor } from './unavailability-editor.component';
import { UnavailabilityModule } from './unavailability.module';


const routes: Routes = [
  {path: 'unavailability', component: UnavailabilityEditor}
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    UnavailabilityModule],
  exports: [RouterModule]
})
export class UnavailabilityRoutingModule {
}
