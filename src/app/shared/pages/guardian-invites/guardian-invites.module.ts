import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { GuardianInvitesPageRoutingModule } from './guardian-invites-routing.module';
import { GuardianInvitesPage } from './guardian-invites.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SharedComponentModule,
    GuardianInvitesPageRoutingModule
  ],
  declarations: [GuardianInvitesPage]
})
export class GuardianInvitesPageModule {}
