import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageModule } from '../homepage/homepage.module';
import { HomepageBase } from '../homepage/homepage_base.component';
import { SettingsModule } from '../settings/settings.module';
import { SettingsBase } from '../settings/settings_base.component';


const routes: Routes = [
  { path: '', component: HomepageBase },
  { path: 'settings', component: SettingsBase },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    HomepageModule,
    SettingsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
