import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { ClassActivityPageRoutingModule } from './class-activity-routing.module';

import { ClassActivityPage } from './class-activity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassActivityPageRoutingModule,
    TranslateModule
  ],
  declarations: [ClassActivityPage]
})
export class ClassActivityPageModule { }
