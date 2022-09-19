import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { EmailVerifyPageRoutingModule } from './email-verify-routing.module';
import { EmailVerifyPage } from './email-verify.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    ReactiveFormsModule,
    EmailVerifyPageRoutingModule,
    SharedComponentModule
  ],
  declarations: [EmailVerifyPage]
})
export class EmailVerifyPageModule {}
