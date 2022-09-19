import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { UniversalPageRoutingModule } from './universal-routing.module';

import { UniversalPage } from './universal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UniversalPageRoutingModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [UniversalPage]
})
export class UniversalPageModule {}
