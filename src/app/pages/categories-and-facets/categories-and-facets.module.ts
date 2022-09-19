import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CategoriesAndFacetsPage } from './categories-and-facets.page';
import { CategoriesAndFacetsPageRouterModule } from './categories-and-facets.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriesAndFacetsPageRouterModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [CategoriesAndFacetsPage]
})
export class CategoriesAndFacetsPageModule {}
