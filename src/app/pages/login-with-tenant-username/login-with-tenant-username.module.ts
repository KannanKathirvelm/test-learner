import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AvatarModule } from 'ngx-avatar';
import { LoginWithTenantUsernamePageRoutingModule } from './login-with-tenant-username-router.module';
import { LoginWithTenantUsernamePage } from './login-with-tenant-username.page';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LoginWithTenantUsernamePageRoutingModule,
    TranslateModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    AvatarModule
  ],
  declarations: [LoginWithTenantUsernamePage]
})
export class LoginWithTenantUsernamePageModule {}
