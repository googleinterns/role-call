import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageBaseComponent } from '../homepage/homepage_base.component';
import { SettingsBaseComponent } from '../settings/settings_base.component';
import { HomepageModule } from '../homepage/homepage.module';
import { SettingsModule } from '../settings/settings.module';
import { LoginModule } from '../login/login.module';
import { LoginBaseComponent } from '../login/login_base.component';


const routes: Routes = [
  { path: '', component: HomepageBaseComponent },
  { path: 'settings', component: SettingsBaseComponent },
  { path: 'login', component: LoginBaseComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    HomepageModule,
    SettingsModule,
    LoginModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
