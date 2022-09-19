import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectWithSearchBarComponent } from '@components/UI/inputs/select-with-search-bar/select-with-search-bar.component';
import { APP_CONFIG } from '@config/app.config';
import { environment } from '@environment/environment';
import { ModalController } from '@ionic/angular';
import { CountryModel } from '@models/auth/signup';
import { TranslateService } from '@ngx-translate/core';
import { AuthProvider } from '@providers/apis/auth/auth';
import { AuthService } from '@providers/service/auth/auth.service';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';
import { EVENTS } from '@shared/constants/events-constants';
import { MIN_AGE, MIN_AGE_TO_GOOGLE_SIGNUP } from '@shared/constants/helper-constants';
import { LocationModel } from '@shared/models/analytics/analytics';
import { LoadingService } from '@shared/providers/service/loader.service';
import { ModalService } from '@shared/providers/service/modal.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import * as moment from 'moment';

export interface SearchSelectModel {
  id: string;
  name: string;
}

@Component({
  selector: 'sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})

export class SignUpPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public signUpForm: FormGroup;
  public submitted: boolean;
  public countries: Array<CountryModel>;
  public day: Date;
  public month: Date;
  public year: Date;
  public maxYear: string;
  public emailId: string;
  public selectedCountryDetail: SearchSelectModel;
  public showSuccessAlert: boolean;
  public successMessage: string;
  public isIosDevice: boolean;
  public showGoogleSignUp: boolean;
  public minAgeToGoogleSignup: number;
  public minAge: number;
  public isShowAccountExistsPullUp: boolean;
  public isEmailAutoFocus: boolean;
  public translationParams: {
    productName: string;
  };
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private parseService: ParseService,
    private utilsService: UtilsService,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private authProvider: AuthProvider,
    private translate: TranslateService,
    private loader: LoadingService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private router: Router
  ) {
    this.isIosDevice = !this.utilsService.isAndroid();
    const required = !this.isIosDevice ? Validators.required : null;
    this.signUpForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      year: ['', required],
    });
    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.emailId = queryParams.email ? queryParams.email : '';
    this.successMessage = this.translate.instant('SIGN_UP_VERIFICATION_EMAIL_MSG');
    this.translationParams = {
      productName: APP_CONFIG.productName
    };
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.minAgeToGoogleSignup = MIN_AGE_TO_GOOGLE_SIGNUP;
    this.minAge = MIN_AGE;
    const date = new Date();
    const maxYear = date.getFullYear() - this.minAge;
    this.maxYear = maxYear.toString();
    this.authProvider.fetchCountries().then((countriesModel) => {
      this.countries = countriesModel;
      this.fetchCurrentLocation();
    });
    this.showGoogleSignUp = this.isIosDevice;
  }

  /**
   * @function fetchCurrentLocation
   * this Method is used to fetch the current location
   */
  private fetchCurrentLocation() {
    this.parseService.fetchLocationInfo().then((locationInfo: LocationModel) => {
      const countryCode = locationInfo.countryCode;
      this.selectedCountryDetail = this.countries.find((countryModel) => {
        return countryModel.code.includes(countryCode);
      });
    });
  }

  /**
   * @function validateForm
   * @return {boolean}
   * Method to check the basic form validation
   */
  get validateForm() {
    return this.signUpForm.controls;
  }

  /**
   * @function checkPassword
   * @return {boolean}
   * this Method is used to check the password with confirm password as same
   */
  get checkPassword() {
    return this.signUpForm.get('password').value === this.signUpForm.get('confirmPassword').value
      ? null : { notSame: true };
  }

  /**
   * @function onChangeDate
   * this Method is used to handle date of birth
   */
  public onChangeDate() {
    if (!this.isIosDevice) {
      const formValues = this.signUpForm.value;
      const dateOfBirth = this.getUserDOB(formValues, 'YYY-MM-DD');
      const age = moment().diff(dateOfBirth, 'years');
      this.showGoogleSignUp = (age >= this.minAgeToGoogleSignup);
    }
  }

  /**
   * @function trackNewUserEvent
   * This method is used to track the new user signed up
   */
  private trackNewUserEvent() {
    this.parseService.trackEvent(EVENTS.NEW_USER_CREATE);
  }

  /**
   * @function signUp
   * Method to handle signup functionality
   */
  public signUp() {
    this.submitted = true;
    this.isEmailAutoFocus = false;
    if (this.signUpForm.valid && !this.checkPassword) {
      this.loader.displayLoader();
      const formValues = this.signUpForm.value;
      this.emailId = formValues.email.trim();
      const dateOfBirth = this.getUserDOB(formValues, 'MM/DD/YYY');
      const signUpFormContent = {
        email: this.emailId,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        password: formValues.password,
        tenant_id: environment.GOORU_TENANT_ID
      };
      if (dateOfBirth) {
        signUpFormContent['birth_date'] = dateOfBirth;
      }
      const profileDetails = {
        country: this.selectedCountryDetail.name,
        country_id: this.selectedCountryDetail.id,
        user_category: 'student'
      };
      this.authService.signUpWithCredential(signUpFormContent, profileDetails).then((response) => {
        this.showSuccessAlert = true;
        this.signUpForm.reset();
        this.submitted = false;
        this.trackNewUserEvent();
      }).catch((error) => {
        if (error) {
          if (error.status === 409) {
            this.isShowAccountExistsPullUp = true;
          }
        }
      }).finally(() => {
        this.loader.dismissLoader();
      });
    }
  }

  /**
   * @function closeAccountExistsPullUp
   * Method to close the account exists pullup
   */
  public closeAccountExistsPullUp() {
    this.emailId = null;
    this.isEmailAutoFocus = true;
    this.isShowAccountExistsPullUp = false;
  }

  /**
   * @function togglePullUp
   * Method to open the search list model
   */
  public async togglePullUp() {
    const props = {
      dataList: this.countries,
      selectedValue: this.selectedCountryDetail
    };
    const modal = await this.modalCtrl.create({
      component: SelectWithSearchBarComponent,
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: props
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data) {
        this.selectedCountryDetail = dismissContent.data.selectedValue;
      }
    });
    await modal.present();
  }

  /**
   * @function getUserDOB
   * Method to get user DOB
   */
  private getUserDOB(formValues, format) {
    const isDOB = (formValues.year);
    if (isDOB) {
      // We set month and date using the default value 01.
      return `01/01/${moment(formValues.year).format('YYYY')}`;
    }
    return;
  }

  /**
   * @function doGoogleSignUp
   * Method to handle google signup
   */
  public doGoogleSignUp() {
    this.authService.googleLogin(false);
  }

  /**
   * @function doAppleLogin
   * This method triggers when user try to do login by using apple account
   */
  public doAppleLogin() {
    this.authService.appleLogin(false);
  }

  /**
   * @function dismissAlert
   * Method to close alert
   */
  public dismissAlert(value) {
    if (value) {
      this.modalService.dismiss();
      this.showSuccessAlert = false;
    }
    this.router.navigate(['/login/username'], { queryParams: { email: this.emailId, fromSignUp: true } });
  }
}
