import { Injectable, Injector } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from '@environment/environment';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslationService } from '@providers/service/translation.service';
import { routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';
import { SessionModel } from '@shared/models/auth/session';
import { TenantListModel } from '@shared/models/auth/tenant';
import { HttpService } from '@shared/providers/apis/http';
import { addHttpsProtocol } from '@shared/utils/global';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  // -------------------------------------------------------------------------
  // Properties
  private readonly SESSION_STORAGE_KEY = 'gooru_user_session';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly RESTRICTED_KEYS = ['tour', 'competency_count', 'translation'];
  private readonly TOUR_KEY = 'tour';
  private currentSessionSubject: BehaviorSubject<SessionModel>;
  public currentSession: Observable<SessionModel>;
  private authNamespace = 'api/nucleus-auth';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private httpService: HttpService,
    private injector: Injector,
    private storage: Storage,
    private navCtrl: NavController,
    private translationService: TranslationService
  ) {
    this.initSession();
  }

  private get _router() { return this.injector.get(Router); }

  public initSession() {
    return this.getSession().then((session) => {
      this.currentSessionSubject = new BehaviorSubject<SessionModel>(session);
      this.currentSession = this.currentSessionSubject.asObservable();
    });
  }

  /**
   * @function currentSessionValue
   * This Method is used to get the current session detailse
   */
  get userSession(): SessionModel {
    return this.currentSessionSubject ? this.currentSessionSubject.value : null;
  }

  /**
   * @function getUserId
   * This Method is used to get the userid from the ionic storage
   */
  public getUserId() {
    return this.storage.get(this.SESSION_STORAGE_KEY).then((session) => {
      return session.user_id;
    });
  }

  /**
   * @function getAccessToken
   * This Method is used to get the basic session details from the ionic storage
   */
  public getAccessToken() {
    return this.storage.get(this.SESSION_STORAGE_KEY).then((session) => {
      if (session === null) {
        return this.signInAsAnonymous().then((sessionModel) => {
          this.storage.set(this.SESSION_STORAGE_KEY, sessionModel);
          return sessionModel.access_token;
        });
      } else {
        return session.access_token;
      }
    });
  }

  /**
   * @function getSession
   * This Method is used to get the session details from the ionic storage
   */
  public getSession(): Promise<SessionModel> {
    return this.storage.get(this.SESSION_STORAGE_KEY).then(session => {
      return session;
    });
  }

  /**
   * @function getSession
   * This Method is used to set the session
   * @params storeSession are used by guardian app
   */
  public setSession(sessionModel, storeSession = true) {
    sessionModel.login_ref_url = this._router.url;
    const thumbnail = addHttpsProtocol(sessionModel.thumbnail);
    sessionModel.thumbnail = thumbnail;
    const parsedUrls = {
      content_cdn_url: addHttpsProtocol(sessionModel.cdn_urls.content_cdn_url),
      user_cdn_url: addHttpsProtocol(sessionModel.cdn_urls.user_cdn_url)
    };
    sessionModel.cdn_urls = parsedUrls;
    this.currentSessionSubject.next(sessionModel);
    if (storeSession) {
      this.storage.set(this.SESSION_STORAGE_KEY, sessionModel);
    }
  }

  /**
   * @function clearStorage
   * This Method is used to clear the session storage
   */
  public clearStorage() {
    const storagePromise = new Promise((resolve) => {
      this.storage.forEach((value, storagekey) => {
        const isKeyClearRestrict = this.RESTRICTED_KEYS.find((restrictedKey) => {
          return storagekey.includes(restrictedKey);
        });
        if (!isKeyClearRestrict) {
          this.storage.remove(storagekey);
        }
      }).then(() => {
        resolve();
      });
    });
    this.translationService.initTranslate();
    this.currentSessionSubject.next(null);
    return storagePromise;
  }

  /**
   * @function clearTourFromSession
   * This Method is used to clear the tour from session storage
   */
  public clearTourFromSession() {
    return new Promise((resolve) => {
      this.storage.forEach((value, storagekey) => {
        const isTourOverlay = storagekey.includes(this.TOUR_KEY);
        if (isTourOverlay) {
          this.storage.remove(storagekey);
        }
      }).then(() => {
        resolve();
      });
    });
  }

  /**
   * @function sessionInValidate
   * This Method is used to clear the storage and redirectTo home page
   */
  public sessionInValidate() {
    this.clearStorage().then(() => {
      this.navCtrl.navigateRoot(routerPath('login'));
    });
  }

  /**
   * @function refreshToken
   * This Method is used to call refresh token
   */
  public refreshToken() {
    this.storage.get(this.REFRESH_TOKEN_KEY).then((token) => {
      this.getAccessTokenByRefreshToken(token).then((response) => {
        this.storage.set(this.SESSION_STORAGE_KEY, response);
        const navigationExtras: NavigationExtras = {
          queryParams: { isReload: true }
        };
        this.navCtrl.navigateRoot(routerPath('studentHome'), navigationExtras);
      }, () => {
        this.sessionInValidate();
      });
    });
  }

  /**
   * @function setRefreshTokenInSession
   * This Method is used to set refresh
   */
  public setRefreshTokenInSession(token) {
    this.storage.set(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * @function isAuthenticated
   * This Method is used to check the user is authenticated or not
   */
  public isAuthenticated(): Promise<boolean> {
    return this.storage.get(this.SESSION_STORAGE_KEY).then(session => {
      return this.isLoggedInUser(session);
    });
  }


  /**
   * @function isLoggedInUser
   * This Method is used to check the user is logged in or not
   */
  public isLoggedInUser(session) {
    return (session !== null && session.user_id !== 'anonymous');
  }

  /**
   * @function signInAsAnonymous
   * This Method is used to get the basic session details using anonymous token
   */
  public signInAsAnonymous(): Promise<SessionModel> {
    const postData = {
      client_id: environment.CLIENT_ID,
      client_key: environment.CLIENT_KEY,
      grant_type: 'anonymous'
    };
    const endpoint = `${this.authNamespace}/v2/signin`;
    return this.httpService.post<SessionModel>(endpoint, postData).then((res) => {
      const data = res.data;
      const result: SessionModel = {
        partnerId: data.partner_id,
        appId: data.app_id,
        access_token: data.access_token,
        access_token_validity: data.access_token_validity,
        cdn_urls: data.cdn_urls,
        provided_at: data.provided_at,
        user_id: data.user_id
      };
      return result;
    });
  }

  /**
   * @function getAccessTokenByRefreshToken
   * This Method is used to get the access token by refresh token
   */
  private getAccessTokenByRefreshToken(refreshToken) {
    const endpoint = `${this.authNamespace}/v2/token`;
    const headers = this.httpService.getRefreshTokenHeaders(refreshToken);
    return this.httpService.post<SessionModel>(endpoint, {}, { headers }).then((res) => {
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
}
