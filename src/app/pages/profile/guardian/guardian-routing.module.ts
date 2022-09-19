import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GuardianPage } from './guardian.page';

const routes: Routes = [
  {
    path: '',
    component: GuardianPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuardianPageRoutingModule {}
