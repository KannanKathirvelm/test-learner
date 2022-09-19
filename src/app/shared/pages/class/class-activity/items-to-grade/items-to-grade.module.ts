import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

// import { ComponentsModule } from '@components/components.module';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { ItemsToGradePage } from './items-to-grade.page';
import { ItemsToGradePageRouterModule } from './items-to-grade.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ItemsToGradePageRouterModule,
    TranslateModule,
    SharedComponentModule
    // ComponentsModule
  ],
  declarations: [ItemsToGradePage]
})
export class ItemsToGradePageModule { }
