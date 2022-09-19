import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { SharedApplicationDirectivesModule } from '@shared/directives/shared-application-directives.module';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { SharedApplicationPipesModule } from '@shared/pipes/shared-application-pipes.module';
import { AvatarModule } from 'ngx-avatar';
import { CalendarModule } from 'primeng/calendar';

import { DiagnosticRouteComponent } from '@components/diagnostic-route/diagnostic-route.component';
import { FeaturedCourseCardComponent } from '@components/featured-course-card/featured-course-card.component';
import { IdentifyAccountPullupComponent } from '@components/identify-account-pullup/identify-account-pullup.component';
import { IdentifyConfirmationPopupComponent } from '@components/identify-confirmation-popup/identify-confirmation-popup.component';
import { JoinClassCardComponent } from '@components/join-class-card/join-class-card.component';
import { NavSideBarComponent } from '@components/nav-side-bar/nav-side-bar.component';
import { NonPremiumClassCardComponent } from '@components/non-premium-class-card/non-premium-class-card.component';
import { PremiumClassCardComponent } from '@components/premium-class-card/premium-class-card.component';
import { AddGuardianFormComponent } from '@components/profile/add-guardian-form/add-guardian-form.component';
import { GuardianCardComponent } from '@components/profile/guardian-card/guardian-card.component';
import { PreferencesCategoryPanelComponent } from '@components/profile/preferences-category-panel/preferences-category-panel.component';
import { PreferenceFrameworkPanelComponent } from '@components/profile/preferences-framework-panel/preferences-framework-panel.component';
import { ClassroomComponent } from '@components/student-home/classroom/classroom.component';
import { FeaturedCourseComponent } from '@components/student-home/featured-course/featured-course.component';
import { NavInputEmailComponent } from '@components/UI/inputs/nav-input-email/nav-input-email.component';
import { NavInputPasswordComponent } from '@components/UI/inputs/nav-input-password/nav-input-password.component';
import { NavInputSelectComponent } from '@components/UI/inputs/nav-input-select/nav-input-select.component';
import { NavInputTextComponent } from '@components/UI/inputs/nav-input-text/nav-input-text.component';
import { SelectWithSearchBarComponent } from '@components/UI/inputs/select-with-search-bar/select-with-search-bar.component';
import { UserPersonalDetailsComponent } from '@components/user-personal-details/user-personal-details.component';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProgramCourseListComponent } from './student-home/program-course-list/program-course-list.component';
import { ProgramCourseComponent } from './student-home/program-course/program-course.component';

const PAGES_COMPONENTS = [
  NavInputTextComponent,
  NavInputPasswordComponent,
  NavInputEmailComponent,
  NavSideBarComponent,
  NavInputSelectComponent,
  SelectWithSearchBarComponent,
  PremiumClassCardComponent,
  PreferencesCategoryPanelComponent,
  PreferenceFrameworkPanelComponent,
  FeaturedCourseComponent,
  ClassroomComponent,
  FeaturedCourseCardComponent,
  JoinClassCardComponent,
  NonPremiumClassCardComponent,
  AddGuardianFormComponent,
  GuardianCardComponent,
  DiagnosticRouteComponent,
  ProgramCourseComponent,
  ProgramCourseListComponent,
  ChangePasswordComponent,
  UserPersonalDetailsComponent,
  IdentifyAccountPullupComponent,
  IdentifyConfirmationPopupComponent
];

@NgModule({
  declarations: [PAGES_COMPONENTS],
  entryComponents: [
    SelectWithSearchBarComponent,
    AddGuardianFormComponent,
    DiagnosticRouteComponent,
    ProgramCourseListComponent,
    ChangePasswordComponent,
    UserPersonalDetailsComponent,
    IdentifyAccountPullupComponent,
    IdentifyConfirmationPopupComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AvatarModule,
    ApplicationPipesModule,
    SharedApplicationPipesModule,
    SharedApplicationDirectivesModule,
    CalendarModule,
    MatExpansionModule,
    SharedComponentModule
  ],
  exports: [
    PAGES_COMPONENTS
  ]
})
export class ComponentsModule { }
