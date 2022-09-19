import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environment/environment';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AuthProvider } from '@providers/apis/auth/auth';
import { routerPath } from '@shared/constants/router-constants';
import { AppService } from '@shared/providers/service/app.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { ToastService } from '@shared/providers/service/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private appService: AppService,
    private spinnerDialog: SpinnerDialog,
    private dialogs: Dialogs,
    private translate: TranslateService,
    private router: Router,
    private authProvider: AuthProvider,
    private sessionService: SessionService,
    private inAppBrowser: InAppBrowser,
    private loadingService: LoadingService,
    private collectionService: CollectionPlayerService,
    private toastService: ToastService,
    private profileService: ProfileService
  ) { }

  /**
   * @function tenantLogin
   * This method used to do tenant login
   */
  public tenantLogin(tenantUrl: string, emailId?: string, isDeeplinkUrl?: boolean, queryParams?) {
    let url = `${tenantUrl}?long_lived_access=true`;
    if (queryParams) {
      url = `${url}&${queryParams}`;
    }
    this.loginViaInAppBrowser(url, isDeeplinkUrl, emailId);
  }

  /*
   * This method is used to display the error message
   */
  public displayMessage(errorMessageKey) {
    this.translate.get(errorMessageKey).subscribe((value) => {
      this.toastService.presentToast(value);
    });
  }

  /**
   * @function googleLogin
   * This method used to do google login
   */
  public googleLogin(isDeeplinkUrl) {
    const options = this.collectionService.getInAppBrowserOptions();
    const googleAPI = `${environment.API_END_POINT}/api/nucleus-auth-idp/v1/google`;
    const browser = this.inAppBrowser.create(googleAPI, '_blank', options);
    browser.on('loadstart').subscribe(() => {
      this.spinnerDialog.show();
    });
    browser.on('loadstop').subscribe(event => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf('access_token') > -1) {
        browser.close();
        let accessToken = event.url.split('access_token=')[1];
        this.loadingService.displayLoader();
        // adding # for first time login in access token, to remove that
        accessToken = accessToken.replace('#', '');
        this.accessTokenAuthentication(accessToken, isDeeplinkUrl);
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
    });
  }

  /**
   * @function doSchoolPassportLogin
   * This method used to do school passport login
   */
  public doSchoolPassportLogin(isDeeplinkUrl) {
    const options = this.collectionService.getInAppBrowserOptions();
    const appleAPI = `${environment.API_END_POINT}/api/nucleus-auth-idp/v2/saml/gg4l`;
    const browser = this.inAppBrowser.create(appleAPI, '_blank', options);
    browser.on('loadstart').subscribe(() => {
      this.spinnerDialog.show();
    });
    browser.on('loadstop').subscribe(event => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf('access_token') > -1) {
        browser.close();
        let accessToken = event.url.split('access_token=')[1];
        this.loadingService.displayLoader();
        // adding # for first time login in access token, to remove that
        accessToken = accessToken.replace('#', '');
        this.accessTokenAuthentication(accessToken, isDeeplinkUrl);
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
    });
  }

  /**
   * @function appleLogin
   * This method used to do apple login
   */
  public appleLogin(isDeeplinkUrl) {
    const options = this.collectionService.getInAppBrowserOptions();
    const appleAPI = `${environment.API_END_POINT}/api/nucleus-auth-idp/v1/apple`;
    const browser = this.inAppBrowser.create(appleAPI, '_blank', options);
    browser.on('loadstart').subscribe(() => {
      this.spinnerDialog.show();
    });
    browser.on('loadstop').subscribe(event => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf('access_token') > -1) {
        browser.close();
        let accessToken = event.url.split('access_token=')[1];
        this.loadingService.displayLoader();
        // adding # for first time login in access token, to remove that
        accessToken = accessToken.replace('#', '');
        this.accessTokenAuthentication(accessToken, isDeeplinkUrl);
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
    });
  }

  /**
   * @function loginViaInAppBrowser
   * this method used to login via in app browser
   */
  public  loginViaInAppBrowser(tenantUrl, isDeeplinkUrl?, emailId?) {
    const options = this.collectionService.getInAppBrowserOptions();
    const browser = this.inAppBrowser.create(tenantUrl, '_blank', options);
    const alertMessage = this.translate.instant('IN_APP_BROWSER_ALERT_MSG');
    this.spinnerDialog.show();
    browser.on('loadstart').subscribe((event) => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf('nonce') > -1) {
        browser.close();
        const nonceToken = event.url.split('nonce=')[1];
        this.nonceTokenAuthentication(nonceToken, emailId, isDeeplinkUrl);
      } else if (event.url != null && event.url.indexOf('access_token') > -1) {
        browser.close();
        let accessToken = event.url.split('access_token=')[1];
        // adding # for first time login in access token, to remove that
        accessToken = accessToken.replace('#', '');
        this.accessTokenAuthentication(accessToken, isDeeplinkUrl);
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
      this.dialogs.alert(alertMessage);
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
    });
  }

  /**
   * @function nonceBasedAuthentication
   * this method used to authenticate signInAnonymousUsingNonce login
   */
  public nonceTokenAuthentication(nonceToken: string, emailId?: string, isDeeplinkUrl?: boolean) {
    this.authProvider.signInAnonymousUsingNonce(nonceToken).then((sessionModel) => {
      this.loadingService.dismissLoader();
      this.sessionService.setSession(sessionModel);
      const tenantDetail = sessionModel.tenant;
      this.router.navigate([routerPath('loginWithTenantUsername')],
        {
          queryParams: {
            image: tenantDetail.image_url,
            'short-name': tenantDetail.short_name,
            tenantId: tenantDetail.tenantId,
            emailId,
            isDeeplinkUrl
          }
        });
    });
  }

  /**
   * @function accessTokenAuthentication
   * this method used to authenticate signInWithToken login
   */
  public accessTokenAuthentication(accessToken: string, isDeeplinkUrl?: boolean) {
    this.authProvider.signInWithToken(accessToken).then((sessionModel) => {
      this.loadingService.dismissLoader();
      this.sessionService.setSession(sessionModel);
      this.appService.checkDeeplinkUrl(isDeeplinkUrl);
      if (!sessionModel.user_category) {
        this.authProvider.updateUserProfile({ user_category: 'student' }, accessToken);
      }
    });
  }

  /**
   * @function signUpWithCredential
   * this method used to sign up flow
   */
  public signUpWithCredential(signUpFormContent, profileDetails) {
    return this.authProvider.signUpWithCredential(signUpFormContent).then((response) => {
      const emailId = response.email;
      const token = response.access_token;
      return this.authProvider.updateUserProfile(profileDetails, token).then(() => {
        return this.profileService.verifyUserEmail(emailId, token);
      });
    });
  }
}
