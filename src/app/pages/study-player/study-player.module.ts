import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { StudyPlayerPageRoutingModule } from './study-player-routing.module';

import { StudyPlayerPage } from './study-player.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudyPlayerPageRoutingModule,
    ComponentsModule,
    SharedComponentModule
  ],
  declarations: [StudyPlayerPage]
})
export class StudyPlayerPageModule {}
