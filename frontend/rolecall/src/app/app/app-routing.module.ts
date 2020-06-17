import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageBaseComponent } from '../homepage/homepage-base.component';
import { SettingsBaseComponent } from '../settings/settings-base.component';
import { HomepageModule } from '../homepage/homepage.module';
import { SettingsModule } from '../settings/settings.module';
import { LoginModule } from '../login/login.module';
import { LoginBaseComponent } from '../login/login-base.component';


const routes: Routes = [
  { path: '', component: HomepageBaseComponent },
  { path: 'settings', component: SettingsBaseComponent },
  { path: 'login', component: LoginBaseComponent },
  {path: '**', redirectTo: '/', pathMatch: 'full' }
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
