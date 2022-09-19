import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { AvatarModule } from 'ngx-avatar';
import { GuardianPageRoutingModule } from './guardian-routing.module';
import { GuardianPage } from './guardian.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    SharedComponentModule,
    GuardianPageRoutingModule,
    AvatarModule,
    ApplicationPipesModule
  ],
  declarations: [GuardianPage]
})
export class GuardianPageModule { }
