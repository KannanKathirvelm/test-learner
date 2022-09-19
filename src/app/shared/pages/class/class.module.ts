import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { ClassPageRoutingModule } from './class-routing.module';
import { ClassPage } from './class.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassPageRoutingModule,
    TranslateModule,
    SharedComponentModule
  ],
  declarations: [ClassPage]
})
export class ClassPageModule { }
