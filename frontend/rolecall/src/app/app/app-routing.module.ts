import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageBaseComponent } from '../homepage/homepage-base/homepage-base.component';
import { SettingsBaseComponent } from '../settings/settings-base/settings-base.component';


const routes: Routes = [
  { path: '', component: HomepageBaseComponent },
  { path: 'settings', component: SettingsBaseComponent },
  {path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
