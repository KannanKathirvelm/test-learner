import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GuardianInvitesPage } from './guardian-invites.page';

const routes: Routes = [
  {
    path: '',
    component: GuardianInvitesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuardianInvitesPageRoutingModule {}
