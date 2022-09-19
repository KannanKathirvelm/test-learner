import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ForgotPasswordPage } from './forgot-password.page';
import { ForgotPasswordPageRouterModule } from './forgot-password.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ForgotPasswordPageRouterModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [ForgotPasswordPage]
})
export class ForgotPasswordPageModule { }
