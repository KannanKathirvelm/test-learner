import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { PreferencesPageRouterModule } from './preferences.router.module';

import { PreferencesPage } from './preferences.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreferencesPageRouterModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [PreferencesPage]
})
export class PreferencesPageModule { }
