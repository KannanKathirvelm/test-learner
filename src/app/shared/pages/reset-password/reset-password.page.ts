import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@config/app.config';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';
import { LoadingService } from '@shared/providers/service/loader.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { ToastService } from '@shared/providers/service/toast.service';
@Component({
  selector: 'nav-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage {

  // -------------------------------------------------------------------------
  // Properties
  public resetPasswordForm: FormGroup;
  public submitted: boolean;
  public token: string;
  public appLogo: string;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private formBuilder: FormBuilder,
    private loader: LoadingService,
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private navCtrl: NavController,
    private toastService: ToastService,
    private translate: TranslateService
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params.token;
    });
    this.appLogo = APP_CONFIG.appLogo;
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function validateForm
   * @return {boolean}
   * Method to check the basic form validation
   */
  get validateForm() {
    return this.resetPasswordForm.controls;
  }

  /**
   * @function checkPassword
   * @return {boolean}
   * this Method is used to check the password with confirm password as same
   */
  get checkPassword() {
    return this.resetPasswordForm.get('password').value === this.resetPasswordForm.get('confirmPassword').value ? null : { notSame: true };
  }

  /**
   * @function resetPassword
   * this Method is used to reset password
   */
  public resetPassword() {
    this.submitted = true;
    if (this.resetPasswordForm.valid && !this.checkPassword) {
      this.loader.displayLoader();
      const resetPasswordForm = this.resetPasswordForm.value;
      this.profileService.resetPassword(resetPasswordForm.password, this.token).then(() => {
        this.loader.dismissLoader();
        this.navCtrl.navigateForward([routerPath('loginWithUsername')]);
      }).catch((error) => {
        if (error) {
          const wentWrongMsg = this.translate.instant('SOMETHING_WENT_WRONG');
          this.toastService.presentToast(wentWrongMsg);
          this.loader.dismissLoader();
        }
      });
    }
  }
}
