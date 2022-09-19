import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginWithTenantUsernamePage } from './login-with-tenant-username.page';

const routes: Routes = [
  {
    path: '',
    component: LoginWithTenantUsernamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginWithTenantUsernamePageRoutingModule {}
