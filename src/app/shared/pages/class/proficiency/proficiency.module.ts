import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { ProficiencyPageRoutingModule } from './proficiency-routing.module';
import { ProficiencyPage } from './proficiency.page';

@NgModule({
  imports: [
    CommonModule,
    SharedComponentModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ProficiencyPageRoutingModule
  ],
  declarations: [ProficiencyPage]
})
export class ProficiencyPageModule { }
