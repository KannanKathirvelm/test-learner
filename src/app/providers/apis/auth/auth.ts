import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { CountryModel, KnowMoreQuestionDetailModel } from '@models/auth/signup';
import { SessionModel } from '@shared/models/auth/session';
import { TenantListModel } from '@shared/models/auth/tenant';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthProvider {

  // -------------------------------------------------------------------------
  // Properties

  private authNamespace = 'api/nucleus-auth';
  private lookupNamespace = 'api/nucleus/v1/lookups';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService, private sessionService: SessionService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function AnonymousUsingNonce
   * This Method is used to get the basic session details using anonymous token
   */
  public signInAnonymousUsingNonce(token: string): Promise<SessionModel> {
    const postData = {
      grant_type: 'anonymous'
    };
    const endpoint = `${this.authNamespace}/v2/signin`;
    const headers = this.httpService.getNonceHeaders(token);
    const reqOpts = { headers };
    return this.httpService.post<SessionModel>(endpoint, postData, reqOpts).then((res) => {
      const data = res.data;
      const result: SessionModel = {
        partnerId: data.partner_id,
        appId: data.app_id,
        access_token: data.access_token,
        access_token_validity: data.access_token_validity,
        cdn_urls: data.cdn_urls,
        provided_at: data.provided_at,
        refresh_token: data.refresh_token,
        user_id: data.user_id,
        tenant: this.normalizeTenant(data.tenant || {})
      };
      return result;
    });
  }

  /**
   * @function tenantLogin
   * This Method is used to do tenant login
   */
  public tenantLogin(tenantUrl) {
    return this.httpService.get(tenantUrl);
  }

  /**
   * @function fetchCountries
   * This Method is used to get the countries list
   */
  public fetchCountries(): Promise<Array<CountryModel>> {
    const endpoint = `${this.lookupNamespace}/countries`;
    return this.httpService.get<CountryModel>(endpoint).then((res) => {
      return res.data.countries;
    });
  }

  /**
   * @function signUpWithCredential
   * This method is used to sign up with credential
   */
  public signUpWithCredential(signUpFormContent): Promise<SessionModel> {
    const endpoint = `${this.authNamespace}/v2/signup`;
    return this.httpService.post<SessionModel>(endpoint, signUpFormContent).then((res) => {
      const data = res.data;
      const result: SessionModel = {
        partnerId: data.partner_id,
        appId: data.app_id,
        access_token: data.access_token,
        access_token_validity: data.access_token_validity,
        cdn_urls: data.cdn_urls,
        provided_at: data.provided_at,
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        user_category: data.user_category,
        tenant: this.normalizeTenant(data.tenant || {}),
        thumbnail: data.cdn_urls.user_cdn_url + data.thumbnail,
      };
      return result;
    });
  }

  /**
   * @function signInWithCredential
   * This method is used to sign in with username and password
   */
  public signInWithCredential(
    usernameOrEmail: string,
    password: string,
    accessToken: string = null
  ): Promise<SessionModel> {
    const postData: any = {};
    postData.grant_type = 'credential';
    postData.long_lived_access = true;
    if (accessToken) {
      postData.anonymous_token = accessToken;
    } else {
      postData.client_id = environment.CLIENT_ID;
      postData.client_key = environment.CLIENT_KEY;
    }
    const endpoint = `${this.authNamespace}/v2/signin`;
    const token = `${usernameOrEmail}:${password}`;
    const headers = this.httpService.getBasicHeaders(token);
    const reqOpts = { headers };
    return this.httpService.post<SessionModel>(endpoint, postData, reqOpts)
      .then((res) => {
        const response = res.data;
        const result: SessionModel = {
          partnerId: response.partner_id,
          appId: response.app_id,
          access_token: response.access_token,
          access_token_validity: response.access_token_validity,
          cdn_urls: response.cdn_urls,
          provided_at: response.provided_at,
          user_id: response.user_id,
          username: response.username,
          email: response.email,
          first_name: response.first_name,
          last_name: response.last_name,
          user_category: response.user_category,
          tenant: this.normalizeTenant(response.tenant || {}),
          thumbnail: response.thumbnail ? `${response.cdn_urls.user_cdn_url}${response.thumbnail}` : null,
        };
        this.sessionService.setSession(result);
        this.sessionService.setRefreshTokenInSession(response.refresh_token);
        return result;
      });
  }

  /**
   * @function updateUserProfile
   * This method is used to update profile details
   */
  public updateUserProfile(userDetails, token?) {
    const endpoint = `${this.authNamespace}/v2/users`;
    let reqOpts;
    if (token) {
      const headers = this.httpService.getTokenHeaders(token);
      reqOpts = { headers };
    }
    return this.httpService.put(endpoint, userDetails, reqOpts);
  }

  /**
   * @function signInWithToken
   * This method is used to sign in with token and it returns the basic session data
   */
  public signInWithToken(token: string): Promise<SessionModel> {
    const endpoint = `${this.authNamespace}/v2/token`;
    const headers = this.httpService.getTokenHeaders(token);
    return this.httpService.get<SessionModel>(endpoint, null, headers)
      .then((res) => {
        const response = res.data;
        const result: SessionModel = {
          partnerId: response.partner_id,
          appId: response.app_id,
          access_token: token,
          access_token_validity: response.access_token_validity,
          cdn_urls: response.cdn_urls,
          provided_at: response.provided_at,
          user_id: response.user_id,
          username: response.username,
          email: response.email,
          first_name: response.first_name,
          last_name: response.last_name,
          user_category: response.user_category,
          tenant: this.normalizeTenant(response.tenant || {}),
          thumbnail: response.cdn_urls.user_cdn_url + response.thumbnail,
        };
        return result;
      });
  }

  /**
   * @function signOut
   * This method is used to sign out.
   */
  public signOut() {
    const endpoint = `${this.authNamespace}/v2/signout`;
    return this.httpService.delete<any>(endpoint, null);
  }

  /**
   * @function revokeRefreshToken
   * This method is used to revoke the refresh token access.
   */
  public revokeRefreshToken() {
    const endpoint = `${this.authNamespace}/v2/refresh-token/revoke`;
    return this.httpService.delete<any>(endpoint, null);
  }

  /**
   * @function authorize
   * This Method is used to authorize both google login and signup
   */
  public authorize(user: object): Promise<any> {
    const postData = {
      client_id: environment.CLIENT_ID,
      client_key: environment.CLIENT_KEY,
      grant_type: 'google',
      user
    };
    const endpoint = `${this.authNamespace}/v2/authorize`;
    return this.httpService.post<SessionModel>(endpoint, postData).then((res) => {
      const response = res.data;
      const result: SessionModel = {
        partnerId: response.partner_id,
        appId: response.app_id,
        access_token: response.access_token,
        access_token_validity: response.access_token_validity,
        cdn_urls: response.cdn_urls,
        provided_at: response.provided_at,
        user_id: response.user_id,
        username: response.username,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        user_category: response.user_category,
        tenant: this.normalizeTenant(response.tenant || {}),
        thumbnail: response.thumbnail ? `${response.cdn_urls.user_cdn_url}${response.thumbnail}` : null,
      };
      return result;
    });
  }

  /**
   * @function normalizeTenant
   * This Method is used to normalize the tenant
   */
  public normalizeTenant(tenant) {
    const tenantModel: TenantListModel = {
      tenantId: tenant.tenant_id,
      image_url: tenant.image_url,
      login_type: tenant.login_type,
      tenant_name: tenant.tenant_name,
      short_name: tenant.short_name,
      settings: tenant.settings,
      tenant_short_name: tenant.tenant_short_name || tenant.short_name,
    };
    return tenantModel;
  }

  /**
   * @function fetchTenantList
   * This Method is used to get tenant list based on tenant
   */
  public fetchTenantList(email: string) {
    const postData = {
      email
    };
    const endpoint = `${this.authNamespace}/v2/users/accounts`;
    return this.httpService.post<Array<TenantListModel>>(endpoint, postData)
      .then((tenantListResponse) => {
        const tenantList = tenantListResponse.data.user_accounts;
        return tenantList.map((item) => {
          return this.normalizeTenant(item);
        });
      });
  }

  /**
   * @function fetchMoreUserDetails
   * This Method is used to fetch more user details
   */
  public fetchMoreUserDetails() {
    const endpoint = `${this.lookupNamespace}/know-more-about-user-questions?refresh=true`;
    return this.httpService.get<KnowMoreQuestionDetailModel>(endpoint).then((response) => {
      const userList = response.data;
      return this.normalizeUserDetails(userList);

    });
  }

  /**
   * @function normalizeUserDetails
   * This Method is used to normalize the user details
   */
  public normalizeUserDetails(payload) {
    const knowMoreAboutUserQuestions =  payload.knowMoreAboutUserQuestions || [];
    return knowMoreAboutUserQuestions.map(data => {
      const userData: KnowMoreQuestionDetailModel = {
        question: data.question,
        storeKey: data.store_key,
        seqId: data.seq_id,
        defaultValue: data.default_value,
        isEditable: data.is_editable,
        inputFormat: data.input_format,
        options: data.options,
        additionalInfo: data.additional_info
      };
      return userData;
    });
  }

  /*
  * @function changePassword
  * This method is used to change password
  */
  public changePassword(params) {
    const endpoint = `${this.authNamespace}/v2/users/change-password`;
    return this.httpService.put(endpoint, params);
  }
}

