import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LoginWithTenantUrlPage } from './login-with-tenant-url.page';
import { LoginWithTenantUrlPageRouterModule } from './login-with-tenant-url.router.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginWithTenantUrlPageRouterModule,
    ComponentsModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [LoginWithTenantUrlPage],
  providers: [InAppBrowser]
})
export class LoginWithTenantUrlPageModule {}
