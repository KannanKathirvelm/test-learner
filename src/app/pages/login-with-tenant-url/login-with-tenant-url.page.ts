import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@config/app.config';
import { environment } from '@environment/environment';
import { AuthService } from '@providers/service/auth/auth.service';
@Component({
  selector: 'app-login-with-tenant-url',
  templateUrl: './login-with-tenant-url.page.html',
  styleUrls: ['./login-with-tenant-url.page.scss'],
})
export class LoginWithTenantUrlPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public tenantSignInForm: FormGroup;
  public submitted: boolean;
  public tenantAPI = environment.TENANT_DOMAIN_NAME;
  public appLogo: string;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.tenantSignInForm = this.formBuilder.group({
      tenantUrl: ['', Validators.required],
    });
    this.appLogo = APP_CONFIG.appLogo;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.submitted = false;
    const tenantShortName = this.activatedRoute.snapshot.queryParams.t;
    if (tenantShortName) {
      this.tenantSignInForm.get('tenantUrl').setValue(tenantShortName);
      this.tenantLogin(tenantShortName, false);
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function validateForm
   * validateForm method used to check the basic form validation
   */
  public get validateForm() {
    return this.tenantSignInForm.controls;
  }

  /**
   * @function doTenantLogin
   * This method will trigger when user click on the submit button
   */
  public doTenantLogin() {
    const isDeeplinkUrl = this.activatedRoute.snapshot.queryParams.isDeeplinkUrl;
    this.submitted = true;
    if (this.tenantSignInForm.valid) {
      const tenantURL = this.tenantSignInForm.value.tenantUrl.toLowerCase();
      this.tenantLogin(tenantURL, isDeeplinkUrl);
    }
  }

  /**
   * @function tenantLogin
   * This method is used to do tenant login
   */
  public tenantLogin(tenantURL, isDeeplinkUrl) {
    const requestTenantUrl = `${environment.TENANT_URL}${tenantURL}`;
    this.authService.tenantLogin(requestTenantUrl, null, isDeeplinkUrl);
  }
}
