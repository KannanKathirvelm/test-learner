import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { AboutMePage } from './about-me.page';
import { AboutMePageRouterModule } from './about-me.router.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutMePageRouterModule,
    TranslateModule,
    ComponentsModule,
    ApplicationPipesModule
  ],
  declarations: [AboutMePage]
})
export class AboutMePageModule { }
