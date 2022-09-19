import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentHomePage } from './student-home.page';

const routes: Routes = [
  {
    path: '',
    component: StudentHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentHomePageRouterModule { }
