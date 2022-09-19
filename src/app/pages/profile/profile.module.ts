import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProfilePage } from '@pages/profile/profile.page';
import { AvatarModule } from 'ngx-avatar';
import { ProfilePageRouterModule } from './profile.router.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ProfilePageRouterModule,
    TranslateModule,
    ComponentsModule,
    AvatarModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule { }
