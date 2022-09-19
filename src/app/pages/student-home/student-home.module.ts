import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ComponentsModule } from '@components/components.module';
import { StudentHomePage } from '@pages/student-home/student-home.page';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { SharedApplicationPipesModule } from '@shared/pipes/shared-application-pipes.module';
import { StudentHomePageRouterModule } from './student-home.router.module';

@NgModule({
  imports: [
    CommonModule,
    SharedComponentModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StudentHomePageRouterModule,
    TranslateModule,
    SharedApplicationPipesModule,
    ComponentsModule
  ],
  declarations: [StudentHomePage]
})
export class StudentHomePageModule { }
