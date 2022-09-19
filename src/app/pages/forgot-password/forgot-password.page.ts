import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG } from '@config/app.config';
import { routerPath } from '@shared/constants/router-constants';
import { ProfileProvider } from '@shared/providers/apis/profile/profile';
import { LoadingService } from '@shared/providers/service/loader.service';
@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {

  // -------------------------------------------------------------------------
  // Properties
  public forgotPasswordForm: FormGroup;
  public submitted: boolean;
  public errorMessage: boolean;
  public tenantId: string;
  public tenantImage: string;
  public resetFinished: boolean;
  public googleError: boolean;
  public appLogo: string;
  public supportEmail: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private profileProvider: ProfileProvider, private loader: LoadingService, private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.tenantId = params.tenantId;
      this.tenantImage = params.tenantImage;
    });
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.appLogo = APP_CONFIG.appLogo;
    this.supportEmail = APP_CONFIG.supportEmail;
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function validateForm
   * This method is used to check the basic form validation
   */
  public get validateForm() {
    return this.forgotPasswordForm.controls;
  }

  /**
   * @function onSubmit
   * This method is used to reset the forgot password
   */
  public onSubmit() {
    this.submitted = true;
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;
      const tenantId = this.tenantId;
      this.loader.displayLoader();
      this.profileProvider.verifyEmail(email).then((response) => {
        if (response.data.login_type === 'google') {
          this.googleError = true;
          this.loader.dismissLoader();
        } else {
          this.profileProvider.forgotPassword(email, tenantId).then((res) => {
            this.loader.dismissLoader();
            this.resetFinished = true;
          }).catch((error) => {
            this.errorMessage = true;
            this.loader.dismissLoader();
          });
        }
      }).catch((error) => {
        this.errorMessage = true;
        this.loader.dismissLoader();
      });
    }
  }

  /**
   * @function onClose
   * This method is used to close the forgot password page
   */
  public onClose() {
    this.router.navigate([routerPath('login')]);
  }

  /**
   * @function onEnterEmail
   * This method is triggered when email entered
   */
  public onEnterEmail() {
    this.errorMessage = false;
    this.googleError = false;
  }
}
