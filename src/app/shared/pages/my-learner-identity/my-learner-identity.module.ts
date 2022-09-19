import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';

import { MyLearnerIdentityRoutingModule } from './my-learner-identity-routing.module';

import { MyLearnerIdentityPage } from './my-learner-identity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    MyLearnerIdentityRoutingModule,
    TranslateModule,
    SharedComponentModule
  ],
  declarations: [MyLearnerIdentityPage]
})
export class MyLearnerIdentityPageModule { }
