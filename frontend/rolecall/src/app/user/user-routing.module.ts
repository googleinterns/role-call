import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserEditorComponent } from './user-editor.component';
import { UserModule } from './user.module';


const routes: Routes = [
  { path: 'user', component: UserEditorComponent },
  { path: 'user/:uuid', component: UserEditorComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    UserModule
  ],
  exports: [RouterModule]
})
export class UserRoutingModule { }
