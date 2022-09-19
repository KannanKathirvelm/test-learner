import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CategoriesAndFacetsPage } from './categories-and-facets.page';

const routes: Routes = [
  {
    path: '',
    component: CategoriesAndFacetsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriesAndFacetsPageRouterModule {}
