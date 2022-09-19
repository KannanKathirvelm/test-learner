import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginWithTenantUrlPage } from './login-with-tenant-url.page';

const routes: Routes = [
  {
    path: '',
    component: LoginWithTenantUrlPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginWithTenantUrlPageRouterModule {}
