import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KnowMoreQuestionDetailModel, ProfileModel } from '@app/models/auth/signup';
import { AuthProvider } from '@app/providers/apis/auth/auth';
import { routerPath } from '@app/shared/constants/router-constants';
import { TaxonomyGrades } from '@app/shared/models/taxonomy/taxonomy';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { ProfileService } from '@app/shared/providers/service/profile/profile.service';
import { TaxonomyService } from '@app/shared/providers/service/taxonomy/taxonomy.service';
import { NavController, Platform } from '@ionic/angular';
import { IdentifyAccountPullupComponent } from '../identify-account-pullup/identify-account-pullup.component';

@Component({
  selector: 'app-user-personal-details',
  templateUrl: './user-personal-details.component.html',
  styleUrls: ['./user-personal-details.component.scss'],
})
export class UserPersonalDetailsComponent implements OnInit {
  public userDetails: Array<KnowMoreQuestionDetailModel>;
  public userContent: any;
  public userDetailForm: FormGroup;
  public submitted: boolean;
  public isDeeplinkUrl: boolean;
  public customSelectOptions: { header: string };
  public isInitialFlow: boolean;
  @Input() public userProfile: ProfileModel;

  // -------------------------------------------------------------------------
  // Properties

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    protected formBuilder: FormBuilder,
    private authProvider: AuthProvider,
    private navCtrl: NavController,
    private profileService: ProfileService,
    private taxonomyService: TaxonomyService,
    private modalService: ModalService,
    private platform: Platform
  ) {
    this.customSelectOptions = {
      header: 'Options'
    };
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function(event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
    });
  }

  public ngOnInit() {
    this.authProvider.fetchMoreUserDetails().then(async (userContent: Array<KnowMoreQuestionDetailModel>) => {
      const formBuilder = {};
      userContent.forEach(question => {
        formBuilder[question.storeKey] = [question.defaultValue, Validators.required];
      });
      this.userDetailForm = this.formBuilder.group(formBuilder);
      this.userDetails = userContent;
      const gradeLevelQuestion = userContent.find((item) => item.storeKey === 'grade_level');
      if (gradeLevelQuestion) {
        const framework = gradeLevelQuestion.additionalInfo && gradeLevelQuestion.additionalInfo.framework_code;
        const subjectCode = gradeLevelQuestion.additionalInfo && gradeLevelQuestion.additionalInfo.subject_code;
        const filters = {
          subject: subjectCode,
          fw_code: framework
        };
        const taxonomyGrades: Array<TaxonomyGrades> = await this.taxonomyService.fetchGradesBySubject(filters);
        gradeLevelQuestion.options = taxonomyGrades as any;
      }
    });
  }

  // ------------------------------------------------------------------
  // Actions

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalService.dismissModal();
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
   public openUniversalLink() {
    this.modalService.open(IdentifyAccountPullupComponent, {
      userProfile: this.userProfile
    }).then(() => {
      this.closeReport();
    });
  }

  /**
   * @function navigateToHome
   * Method is used to navigate to home page
   */
  public navigateToHome() {
    this.submitted = true;
    if (this.userDetailForm.valid) {
      const formData = this.userDetailForm.value;
      this.authProvider.updateUserProfile({ info: formData }).then(() => {
        this.profileService.fetchProfileDetail();
        this.closeReport();
        this.navCtrl.navigateRoot(routerPath('studentHome'));
      });
    }
  }

}
