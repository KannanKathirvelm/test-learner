import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPersonalDetailsComponent } from '@app/components/user-personal-details/user-personal-details.component';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { APP_CONFIG } from '@config/app.config';
import { environment } from '@environment/environment';
import { Market } from '@ionic-native/market/ngx';
import { NavController } from '@ionic/angular';
import { AuthService } from '@providers/service/auth/auth.service';
import { routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';
import { UtilsService } from '@shared/providers/service/utils/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public loginInForm: FormGroup;
  public submitted: boolean;
  public isDeeplinkUrl: boolean;
  public isIosDevice: boolean;
  public teacherSignUpUrl: string;
  public productLogo: string;
  public appLogo: string;
  public showSchoolPassportLogin: boolean;
  public showSignUp: boolean;
  public showNavigatorSignIn: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private router: Router,
    private market: Market,
    private modalService: ModalService
  ) {
    this.loginInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.isDeeplinkUrl = this.activatedRoute.snapshot.queryParams.isDeeplinkUrl;
    this.productLogo = APP_CONFIG.productLogo;
    this.appLogo = APP_CONFIG.appLogo;
    this.showSchoolPassportLogin = APP_CONFIG.enableSchoolPassportSignIn;
    this.showSignUp = APP_CONFIG.enableSignUp;
    this.showNavigatorSignIn = APP_CONFIG.enableNavigatorSignIn;
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.teacherSignUpUrl = environment.TEACHER_SIGNUP_URL;
    this.isIosDevice = !this.utilsService.isAndroid();
  }

  /**
   * @function onUserDetails
   * This method is used to view user details
   */
  public onUserDetails() {
    this.modalService.open(UserPersonalDetailsComponent, {});
  }

  /**
   * @function validateForm
   * This method is used to check the basic form validation
   */
  public get validateForm() {
    return this.loginInForm.controls;
  }

  /**
   * @function openLink
   * This method is used to open link
   */
  public openLink() {
    this.utilsService.openMeetingLink(this.teacherSignUpUrl);
  }

  /**
   * @function loginSubmit
   * This Method is used to navigate to the tenant list page
   */
  public loginSubmit() {
    this.submitted = true;
    if (this.loginInForm.valid) {
      const email = this.loginInForm.value.email.trim();
      const isDeeplinkUrl = this.isDeeplinkUrl;
      this.router.navigate([routerPath('loginWithTenantList')], { queryParams: { email, isDeeplinkUrl } });
    }
  }

  /**
   * @function onClickSignUp
   * This Method is used to navigate to the sign up page
   */
  public onClickSignUp() {
    this.navCtrl.navigateForward(routerPath('signUp'));
  }

  /**
   * @function goToUsernameLogin
   * This Method is used to navigate to the login with username page
   */
  public goToUsernameLogin() {
    const isDeeplinkUrl = this.isDeeplinkUrl;
    this.navCtrl.navigateForward([routerPath('loginWithUsername')], { queryParams: { isDeeplinkUrl } });
  }

  /**
   * @function goToTenantLogin
   * This Method is used to navigate to the login with tenant url
   */
  public goToTenantLogin() {
    this.navCtrl.navigateForward([routerPath('loginWithTenantUrl')], {
      queryParams: { isDeeplinkUrl: this.isDeeplinkUrl }
    });
  }

  /**
   * @function doAppleLogin
   * This method triggers when user try to do login by using apple account
   */
  public doAppleLogin() {
    this.authService.appleLogin(this.isDeeplinkUrl);
  }

  /**
   * @function doSchoolPassportLogin
   * This method triggers when user try to do login by using school passport
   */
  public doSchoolPassportLogin() {
    this.authService.doSchoolPassportLogin(this.isDeeplinkUrl);
  }

  /**
   * @function reDirectToStore
   * This method use to redirect play store / app store.
   */
  public reDirectToStore() {
    const packageName = this.utilsService.isAndroid() ? environment.INSTRUCTOR_PACKAGE_NAME : environment.INSTRUCTOR_APP_STORE_ID;
    this.market.open(packageName);
  }
}
