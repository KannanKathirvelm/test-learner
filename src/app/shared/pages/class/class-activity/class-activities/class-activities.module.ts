import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { SharedApplicationPipesModule } from '@shared/pipes/shared-application-pipes.module';

import { ClassActivityListPage } from './class-activities.page';
import { ClassActivityListRouterModule } from './class-activities.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ClassActivityListRouterModule,
    TranslateModule,
    ComponentsModule,
    SharedApplicationPipesModule,
    SharedComponentModule
  ],
  declarations: [ClassActivityListPage]
})
export class ClassActivityListModule { }
