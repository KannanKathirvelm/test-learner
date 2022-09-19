import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MyLearnerIdentityPage } from './my-learner-identity.page';

const routes: Routes = [
  {
    path: '',
    component: MyLearnerIdentityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyLearnerIdentityRoutingModule {}
