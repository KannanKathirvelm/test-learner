import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { JourneyPageRoutingModule } from './journey-routing.module';

import { JourneyPage } from './journey.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JourneyPageRoutingModule,
    TranslateModule,
    SharedComponentModule
  ],
  declarations: [JourneyPage]
})
export class JourneyPageModule { }
