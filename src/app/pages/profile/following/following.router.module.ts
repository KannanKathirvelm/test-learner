import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FollowingPage } from './following.page';

const routes: Routes = [
  {
    path: '',
    component: FollowingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FollowingPageRouterModule { }
