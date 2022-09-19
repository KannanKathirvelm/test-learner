import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AvatarModule } from 'ngx-avatar';
import { LoginWithTenantListPage } from './login-with-tenant-list.page';
import { LoginWithTenantListPageRouterModule } from './login-with-tenant-list.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginWithTenantListPageRouterModule,
    ComponentsModule,
    TranslateModule,
    AvatarModule
  ],
  declarations: [LoginWithTenantListPage],
  providers: [InAppBrowser]
})
export class LoginWithTenantListPageModule { }
