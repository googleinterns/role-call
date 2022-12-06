import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserEditor } from './user-editor.component';
import { UserModule } from './user.module';

const routes: Routes = [
  {path: 'user/:uuid', component: UserEditor},
  {path: 'user', component: UserEditor}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    UserModule
  ],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
