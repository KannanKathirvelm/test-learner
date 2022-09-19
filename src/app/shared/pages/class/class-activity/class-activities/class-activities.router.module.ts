import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClassActivityListPage } from './class-activities.page';

const routes: Routes = [
  {
    path: '',
    component: ClassActivityListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassActivityListRouterModule { }
