import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ItemsToGradePage } from './items-to-grade.page';

const routes: Routes = [
  {
    path: '',
    component: ItemsToGradePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemsToGradePageRouterModule {}
