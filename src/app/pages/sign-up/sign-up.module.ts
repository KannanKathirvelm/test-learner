import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ComponentsModule } from '@components/components.module';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { SignUpPage } from './sign-up.page';
import { SignUpPageRouterModule } from './sign-up.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SignUpPageRouterModule,
    TranslateModule,
    ComponentsModule,
    SharedComponentModule
  ],
  declarations: [SignUpPage]
})
export class SignUpPageModule { }
