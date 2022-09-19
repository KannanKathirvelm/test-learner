import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@config/app.config';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';
import { ModalService } from '@shared/providers/service/modal.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { ToastService } from '@shared/providers/service/toast.service';
@Component({
  selector: 'app-guardian-invites',
  templateUrl: './guardian-invites.page.html',
  styleUrls: ['./guardian-invites.page.scss'],
})
export class GuardianInvitesPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public token: string;
  public successMessage: string;
  public showSuccessAlert: boolean;
  public appLogo: string;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private modalService: ModalService,
    private translate: TranslateService,
    private toastService: ToastService,
    private navCtrl: NavController
  ) {
    this.token = this.activatedRoute.snapshot.queryParams.token;
    this.successMessage = this.translate.instant('GUARDIAN_APPROVE_SUCCESS_MSG');
    this.appLogo = APP_CONFIG.appLogo;
  }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    setTimeout(() => {
      this.approveGuardian();
    }, 5000);
  }

  /**
   * @function approveGuardian
   * This method is used to approve guardian
   */
  public approveGuardian() {
    this.profileService.approveGuardian(this.token).then(() => {
      this.showSuccessAlert = true;
    }).catch((error) => {
      const errorMsg = error.data.message;
      this.toastService.presentToast(errorMsg);
    });
  }

  /**
   * @function dismissAlert
   * Method to close alert
   */
  public dismissAlert(value) {
    if (value) {
      this.redirectToLogin();
      this.modalService.dismiss();
      this.showSuccessAlert = false;
    }
  }

  /**
   * @function redirectToLogin
   * this Method is used to navigate to the username login page
   */
  public redirectToLogin() {
    this.navCtrl.navigateForward([routerPath('loginWithUsername')]);
  }
}
