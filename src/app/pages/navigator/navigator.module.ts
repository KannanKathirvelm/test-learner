import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { NavigatorPageRoutingModule } from './navigator-routing.module';
import { NavigatorPage } from './navigator.page';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedComponentModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    NavigatorPageRoutingModule
  ],
  declarations: [NavigatorPage]
})
export class NavigatorPageModule { }
