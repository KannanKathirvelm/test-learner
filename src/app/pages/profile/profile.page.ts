import { Component, OnInit } from '@angular/core';
import { AppLogout } from '@app/app.logout';
import { ChangePasswordComponent } from '@app/components/change-password/change-password.component';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { ToastService } from '@app/shared/providers/service/toast.service';
import { AlertController, Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthProvider } from '@providers/apis/auth/auth';
import { MIN_AGE, MIN_AGE_TO_GOOGLE_SIGNUP, SETTINGS } from '@shared/constants/helper-constants';
import { SessionModel } from '@shared/models/auth/session';
import { ProfileModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { ProfileProvider } from '@shared/providers/apis/profile/profile';
import { ClassService } from '@shared/providers/service/class/class.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { MediaService } from '@shared/providers/service/media/media.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import * as moment from 'moment';

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public userSession: SessionModel;
  public avatarInitialCount: number;
  public avatarSize: number;
  public showNgxAvatar: boolean;
  public userDetails: ProfileModel;
  public isSaving: boolean;
  public deletionTriggerDate: string;
  public tenantValue: string;
  public minAgeToGoogleSignup: number;
  public minAge: number;
  public maxYear: string;
  public year: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private profileService: ProfileService,
    private events: Events,
    private profileProvider: ProfileProvider,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private authProvider: AuthProvider,
    public alertController: AlertController,
    private translate: TranslateService,
    private lookupService: LookupService,
    public modalService: ModalService,
    private toastService: ToastService,
    private appLogoutService: AppLogout
  ) {
    this.tenantValue = SETTINGS.ON;
    this.userSession = this.sessionService.userSession;
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.minAgeToGoogleSignup = MIN_AGE_TO_GOOGLE_SIGNUP;
    this.minAge = MIN_AGE;
    const date = new Date();
    const maxYear = date.getFullYear() - this.minAge;
    this.maxYear = maxYear.toString();

    this.avatarInitialCount = 1;
    this.avatarSize = 64;
    this.showNgxAvatar = this.userSession && !this.userSession.thumbnail;
    this.fetchTenantSettings();
    this.loadData();
  }

  /**
   * @function loadData
   * This method is used to load  the data
   */
  public loadData() {
    this.profileProvider.fetchProfileDetails().then((profile) => {
      this.userDetails = profile;
      const deletionDate = this.userDetails.deletionTriggerDate;
      if (this.userDetails.birthDate) {
        this.year = this.userDetails.birthDate;
      }
      if (deletionDate) {
        this.deletionTriggerDate = moment(deletionDate).format('MMMM DD, YYYY');
      }
    });
  }

  /**
   * @function onChangeDate
   * this Method is used to handle date of birth
   */
  public onChangeDate(event) {
    const dateOfBirthValue = moment(event.detail.value, 'YYYY-MM-DD').format('YYYY');
    const dateOfBirth = this.getUserDOB(dateOfBirthValue, 'MM/DD/YYY');
    this.authProvider.updateUserProfile({ birth_date: dateOfBirth }).then(() => {
      this.events.publish(this.classService.CLASS_JOINED_UPDATE);
    });
  }

  /**
   * @function getUserDOB
   * Method to get user DOB
   */
  private getUserDOB(formValues, format) {
    const isDOB = formValues;
    if (isDOB) {
      // We set month and date using the default value 01.
      return `01/01/${moment(isDOB).format('YYYY')}`;
    }
    return;
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings value
   */
  public fetchTenantSettings() {
    this.lookupService.getTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      if (tenantSettings) {
        this.tenantValue = tenantSettings.useLearnerDataVisibiltyPref;
      }
    });
  }

  /**
   * @function onClickUpdate
   * This method is used to update the user profile
   */
  public async onClickUpdate(event) {
    this.isSaving = true;
    const image = event.target.files[0];
    if (image) {
      const thumbnail = await this.mediaService.uploadContentFile(image, 'user');
      this.userSession.thumbnail = `${this.userSession.cdn_urls.user_cdn_url}${thumbnail}`;
      this.sessionService.setSession(this.userSession);
      this.isSaving = false;
      this.showNgxAvatar = false;
      this.events.publish(this.profileService.USER_PROFILE_UPDATE);
      const postData = {
        thumbnail
      };
      this.authProvider.updateUserProfile(postData);
    }
  }

  /**
   * @function imageErrorHandler
   * This method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }

  /**
   * @function onDeleteAlert
   * This method is used to delete the profile
   */
  public async onDeleteAlert() {
    const alert = await this.alertController.create({
      cssClass: 'alert-popup-container',
      message: this.translate.instant('DELETE_PROFILE_MSG'),
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel',
          cssClass: 'cancel-button'
        }, {
          text: this.translate.instant('CONFIRM'),
          role: 'confirm',
          cssClass: 'confirm-button',
          handler: () => {
            this.onConfirmDelete();
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * @function onConfirmDelete
   * This method is used to confirm the deletion
   */
  public onConfirmDelete() {
    this.profileProvider.deleteProfile().then(() => {
      const successMessage = this.translate.instant('DELETE_SUCCESSFULLY');
      this.toastService.presentToast(successMessage);
      this.appLogoutService.execute();
    });
  }

  /**
   * @function onChangePassword
   * This method is used to change password value
   */
     public onChangePassword() {
      this.modalService.open(ChangePasswordComponent, 'change-password');
    }
}
