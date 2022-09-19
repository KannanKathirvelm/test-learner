import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProficiencyPage } from './proficiency.page';

const routes: Routes = [
  {
    path: '',
    component: ProficiencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProficiencyPageRoutingModule {}
