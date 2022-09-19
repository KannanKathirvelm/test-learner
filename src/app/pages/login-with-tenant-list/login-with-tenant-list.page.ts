import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environment/environment';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthProvider } from '@providers/apis/auth/auth';
import { AuthService } from '@providers/service/auth/auth.service';
import { routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';
import { TenantListModel } from '@shared/models/auth/tenant';
import { ToastService } from '@shared/providers/service/toast.service';

@Component({
  selector: 'login-with-tenant-list',
  templateUrl: './login-with-tenant-list.page.html',
  styleUrls: ['./login-with-tenant-list.page.scss']
})
export class LoginWithTenantListPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public isLoaded: boolean;
  public skeletonViewCount = 3;
  public tenantEmail: string;
  public tenantList: Array<TenantListModel>;
  public avatarInitialCount = 1;
  public avatarSize = 48;
  public isDeeplinkUrl: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private navCtrl: NavController,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private authProvider: AuthProvider,
    private toastService: ToastService,
    private router: Router,
    private authService: AuthService
  ) { }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.fetchTenantListUsingEmail();
  }

  /**
   * @function fetchTenantListUsingEmail
   * this Method is used to get the list of tenant using email
   */

  public fetchTenantListUsingEmail() {
    this.tenantEmail = this.activatedRoute.snapshot.queryParams.email;
    this.isDeeplinkUrl = this.activatedRoute.snapshot.queryParams.isDeeplinkUrl;
    this.isLoaded = true;
    if (this.tenantEmail) {
      this.authProvider.fetchTenantList(this.tenantEmail).then((response) => {
        this.tenantList = response;
        this.isLoaded = false;
        if (response.length === 1) {
          const tenantRequest = response[0];
          this.doTenantLogin(tenantRequest);
        }
      }, () => {
        this.isLoaded = false;
        this.displayToast('LOGIN_VIA_TENANT_NOT_VALID');
        this.router.navigate([routerPath('login')], { queryParams: { isDeeplinkUrl: this.isDeeplinkUrl } });
      });
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function goToUsernameLogin
   * this Method is used to navigate to the username login page
   */
  public goToUsernameLogin() {
    this.navCtrl.navigateForward([routerPath('loginWithUsername')], { queryParams: { isDeeplinkUrl: this.isDeeplinkUrl } });
  }

  /**
   * @function doTenantLogin
   * this Method is used to do tenant login
   */
  public doTenantLogin(tenant: TenantListModel) {
    const isDeeplinkUrl = this.isDeeplinkUrl;
    const requestTenantUrl = `${environment.TENANT_URL}${tenant.tenant_short_name}`;
    this.authService.tenantLogin(requestTenantUrl, this.tenantEmail, isDeeplinkUrl, `lt=${tenant.login_type}`);
  }

  /**
   * @function displayToast
   * This method is used to display toast
   */
  private displayToast(errorMessage) {
    this.translate
      .get(errorMessage)
      .subscribe(value => {
        const toastDurationTime = 7000;
        this.toastService.presentToast(value, toastDurationTime).then(() => {
          this.router.navigate([routerPath('signUp')], { queryParams: { email: this.tenantEmail } });
        });
      });
  }
}
