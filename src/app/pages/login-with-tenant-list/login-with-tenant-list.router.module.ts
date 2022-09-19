import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginWithTenantListPage } from './login-with-tenant-list.page';

const routes: Routes = [
  {
    path: '',
    component: LoginWithTenantListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginWithTenantListPageRouterModule {}
