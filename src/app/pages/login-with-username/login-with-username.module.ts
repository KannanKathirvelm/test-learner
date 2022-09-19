import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LoginWithUsernamePage } from './login-with-username.page';
import { LoginWithUsernamePageRouterModule } from './login-with-username.router.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginWithUsernamePageRouterModule,
    ComponentsModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  declarations: [LoginWithUsernamePage]
})
export class LoginWithUsernamePageModule {}
