import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { CalendarModule } from 'primeng/calendar';
import { PortfolioPageRouterModule } from './portfolio.router.module';

import { PortfolioPage } from './portfolio.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PortfolioPageRouterModule,
    TranslateModule,
    SharedComponentModule,
    CalendarModule
  ],
  declarations: [PortfolioPage]
})
export class PortfolioPageModule { }
