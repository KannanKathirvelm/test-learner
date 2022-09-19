import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { FollowingPageRouterModule } from './following.router.module';

import { FollowingPage } from './following.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FollowingPageRouterModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [FollowingPage]
})
export class FollowingPageModule { }
