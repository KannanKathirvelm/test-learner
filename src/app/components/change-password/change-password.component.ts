import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppLogout } from '@app/app.logout';
import { AuthProvider } from '@app/providers/apis/auth/auth';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { ToastService } from '@app/shared/providers/service/toast.service';
import { APP_CONFIG } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'nav-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  public changePasswordForm: FormGroup;
  public fromChangePassword: boolean;
  public isSubmit: boolean;
  public productLogo: string;
  public appLogo: string;
  @Input() public isChangedPassword: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    protected formBuilder: FormBuilder,
    public modalService: ModalService,
    private authService: AuthProvider,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private toastService: ToastService,
    private appLogoutService: AppLogout
  ) {
    this.changePasswordForm = this.formBuilder.group({
      currentpassword: ['', Validators.required],
      newpassword: ['', Validators.required],
      confirmpassword: ['', Validators.required]
    });
    this.productLogo = APP_CONFIG.productLogo;
    this.appLogo = APP_CONFIG.appLogo;
  }

  // -------------------------------------------------------------------------
  // Actions

  public ionViewDidEnter() {
    this.fromChangePassword = this.activatedRoute.snapshot.queryParams.fromChangePassword;
  }

  public ngOnInit() {
    if (this.isChangedPassword) {
      this.changePasswordForm = this.formBuilder.group({
        newpassword: ['', Validators.required],
        confirmpassword: ['', Validators.required]
      });
    }
  }

  /**
   * @function onChangedPassword
   * This method used to change the password
   */
  public onChangedPassword() {
    this.isSubmit = true;
    if (this.changePasswordForm.valid && !this.checkPassword) {
      let params;
      if (this.isChangedPassword) {
        params = {
          new_password: this.changePasswordForm.value.newpassword
         };
      } else {
        params = {
          old_password: this.changePasswordForm.value.currentpassword,
          new_password: this.changePasswordForm.value.newpassword
         };
      }
      this.authService.changePassword(params).then(() => {
        this.displayToast('YOUR_PASSWORD_HAS_EXPIRED_PLS_LOGIN_AGIAN');
        this.modalService.dismissModal();
        this.appLogoutService.execute();
        this.isSubmit = false;
      }).catch((error) => {
        if (error.status === 400) {
          this.displayToast('INVALID_CURRENT_PASSWORD_PLS_ENTER_CORRECT_PASSWORD');
        }
      });
    }
  }

  /**
   * @function displayToast
   * This method is used to display toast
   */
  private displayToast(errorMessage) {
    this.translate.get(errorMessage).subscribe(value => {
      this.toastService.presentToast(value);
    });
  }

  /**
   * @function validateForm
   * validateForm method used to check the basic form validation
   */
  public get validateForm() {
    return this.changePasswordForm.controls;
  }

  /**
   * @function onClosePopUp
   * This  method used to close the pop up
   */
  public onClosePopUp() {
    this.modalService.dismissModal();
  }

  /**
   * @function checkPassword
   * @return {boolean}
   * this Method is used to check the password with confirm password as same
   */
  get checkPassword() {
    return this.changePasswordForm.get('newpassword').value === this.changePasswordForm.get('confirmpassword').value
      ? null : { notSame: true };
  }

}
