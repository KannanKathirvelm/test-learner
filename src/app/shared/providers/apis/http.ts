import { Injectable, Injector } from '@angular/core';
import { environment } from '@environment/environment';
import { HTTP } from '@ionic-native/http/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { CustomHTTPResponse, SessionModel } from '@shared/models/auth/session';
import { ToastService } from '@shared/providers/service/toast.service';
import { getLastSegmentFromUrl } from '@shared/utils/global';
import axios from 'axios';
declare var cordova: any;
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class HttpService {

  // -------------------------------------------------------------------------
  // Properties
  private readonly SESSION_STORAGE_KEY = 'gooru_user_session';
  private readonly CACHE_ERROR_URL = ['skipped', 'rtd', 'signin', 'token', 'accounts', 'search', 'signup', 'members', 'guardians', 'change-password', 'topics', 'competencies'];
  private readonly CACHE_URLS = ['crosswalk', 'pedagogy-search'];
  private readonly NO_AUTH_URLS = ['/signin', '/token', 'parse/'];
  public isRefreshTokenCalled: boolean;
  private authNamespace = 'api/nucleus-auth';
  private parseNamespace: string;
  private DEFAULT_SERIALIZE_TYPE = 'json';
  private refreshTokenSubject: BehaviorSubject<number>;
  public refreshToken: Observable<number>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HTTP,
    private platform: Platform,
    private storage: Storage,
    private injector: Injector,
    private toastService: ToastService,
    private utilsService: UtilsService
  ) {
    this.parseNamespace = environment.PARSE_API_PATH;
    this.refreshTokenSubject = new BehaviorSubject<number>(null);
    this.refreshToken = this.refreshTokenSubject.asObservable();
  }

  // -------------------------------------------------------------------------
  // Methods

  public get translate(): TranslateService {
    return this.injector.get(TranslateService);
  }

  /**
   * @function get
   * This Method is used for get method on HTTP request
   */
  public get<T>(url: string, params?: any, apiHeaders?: any): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = apiHeaders ? apiHeaders.headers ? apiHeaders.headers : apiHeaders : {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.platform.is('ios')) {
          const queryParams = this.convertParamsToString(params);
          this.httpService.get(endpoint, queryParams, tokenHeaders).then((result) => {
            const resultData = this.normaliseResponse(result);
            result.data = resultData;
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error, url);
            reject(errorResponse);
          });
        } else {
          const options = {
            headers: tokenHeaders,
            params,
          };
          axios.get(endpoint, options).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }

  /**
   * @function post
   * This Method is used for post method on HTTP request
   */
  public post<T>(url: string, data: any = null, headers: any = null,
                 serializerType: string = this.DEFAULT_SERIALIZE_TYPE):
    Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.platform.is('ios')) {
          this.setSerializerType(serializerType);
          const requestBody = this.convertParamsToObject(data);
          this.httpService.post(endpoint, requestBody, tokenHeaders).then((result) => {
            const resultData = this.normaliseResponse(result);
            result.data = resultData;
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error, url);
            reject(errorResponse);
          });
        } else {
          axios.post(endpoint, data, {
            headers: tokenHeaders
          }).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }
  /**
   * @function put
   * This Method is used for put method on HTTP request
   */
  public put<T>(url: string, data: any = null, headers: any = null,
                serializerType: string = this.DEFAULT_SERIALIZE_TYPE): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.platform.is('ios')) {
          this.setSerializerType(serializerType);
          const requestBody = this.convertParamsToObject(data);
          this.httpService.put(endpoint, requestBody, tokenHeaders).then((result) => {
            const resultData = this.normaliseResponse(result);
            result.data = resultData;
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error, url);
            reject(errorResponse);
          });
        } else {
          axios.put(endpoint, data, {
            headers: tokenHeaders
          }).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }

  /**
   * @function delete
   * This Method is used for delete method on HTTP request
   */
  public delete<T>(url: string, data: any = null, headers: any = null,
                   serializerType: string = this.DEFAULT_SERIALIZE_TYPE): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        if (this.platform.is('ios')) {
          this.setSerializerType(serializerType);
          const requestBody = this.convertParamsToObject(data);
          this.httpService.delete(endpoint, requestBody, tokenHeaders)
            .then((result) => {
              const resultData = this.normaliseResponse(result);
              result.data = resultData;
              resolve(result);
            }).catch((error) => {
              const errorResponse = this.handleErrorResponse(error, url);
              reject(errorResponse);
            });
        } else {
          const options = {
            headers: tokenHeaders,
            data,
          };
          axios.delete(endpoint, options).then((result) => {
            resolve(result);
          }).catch((error) => {
            const errorResponse = this.handleErrorResponse(error.response, url);
            reject(errorResponse);
          });
        }
      });
    });
  }

  /**
   * @function post
   * This Method is used for post method on HTTP request
   */
  public postUsingAxios<T>(url: string, data: any = null, headers: any = null, uploadProgressCb?): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      this.setAccessToken(url, customHeaders).then((tokenHeaders) => {
        const options = {
          headers: tokenHeaders,
          onUploadProgressCb: (progressEvent) => {
            if (uploadProgressCb) {
              uploadProgressCb(progressEvent);
            }
          }
        };
        axios.post(endpoint, data, options
        ).then((result) => {
          resolve(result);
        }).catch((error) => {
          const errorResponse = this.handleErrorResponse(error.response, url);
          reject(errorResponse);
        });
      });
    });
  }

  public getAppIdHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': environment.APP_ID,
    };
  }

  /**
   * @function getBasicHeaders
   * This Method is used to get the basic headers
   */
  public getBasicHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${window.btoa(token)}`,
    };
  }

  /**
   * @function getTokenHeaders
   * This Method is used to get the token headers
   */
  public getTokenHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    };
  }

  /**
   * @function getBasicHeaders
   * This Method is used to get the refresh token headers
   */
  public getRefreshTokenHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `RefreshToken ${token}`
    };
  }

  /**
   * @function getNonceHeaders
   * This Method is used to get the nonce headers
   */
  public getNonceHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Nonce ${token}`
    };
  }

  /**
   * @function formURL
   * This Method is used to form url endpoint
   */
  private formURL(url: string) {
    const apiUrl = (!environment.APP_LEARNER && this.utilsService.isBrowser()) ? environment.GUARDIAN_API_END_POINT : environment.API_END_POINT;
    if (apiUrl && !url.includes('http') && !url.includes('assets')) {
      url = `${apiUrl}/${url}`;
    }
    return url;
  }

  /**
   * @function setAccessToken
   * This Method is set access token for the header
   */
  public setAccessToken(url, headers) {
    return new Promise((resolve, reject) => {
      const hasBasicAuth = this.NO_AUTH_URLS.find((path) => {
        return url.indexOf(path) >= 0;
      });
      const authorization = headers && headers.Authorization || null;
      if (!hasBasicAuth && !authorization) {
        return this.getAccessToken().then((accessToken) => {
          if (accessToken) {
            const tokenHeader = this.getTokenHeaders(accessToken);
            Object.assign(headers, tokenHeader);
          }
          resolve(headers);
        }, reject);
      }
      resolve(headers);
    });
  }

  /**
   * @function handleErrorResponse
   * This Method is handle errors for the response.
   */
  public handleErrorResponse(error, url) {
    if (this.platform.is('ios')) {
      const errorResponse = error.error;
      error.data = errorResponse && JSON.parse(errorResponse);
    }
    const statusCode = error.status;
    const lastSegment = getLastSegmentFromUrl(url);
    const hasRestrictedUrl = this.CACHE_URLS.find((restrictedURL) => {
      return url.includes(restrictedURL);
    });
    if (!this.CACHE_ERROR_URL.includes(lastSegment) && statusCode === 401) {
      if (!this.isRefreshTokenCalled) {
        const timeInMillis = moment().valueOf();
        this.refreshTokenSubject.next(timeInMillis);
        this.isRefreshTokenCalled = true;
      }
    } else if (this.CACHE_ERROR_URL.includes(lastSegment) || hasRestrictedUrl) {
      return error;
    } else {
      this.displayMessage('SOMETHING_WENT_WRONG');
    }
    return error;
  }

  /**
   * @function displayMessage
   * This method is used to display the error message
   */
  public displayMessage(errorMessageKey) {
    this.translate.get(errorMessageKey).subscribe((value) => {
      this.toastService.presentToast(value);
    });
  }

  /**
   * @function trackErrorLog
   * This method is used to post the error
   */
  public async trackErrorLog(params) {
    const isTrackPermissionEnabled = await this.isAppTrackTransparencyEnabled();
    if (isTrackPermissionEnabled) {
      const headers = this.getAppIdHeaders();
      const reqOpts = { headers };
      const endpoint = `${this.parseNamespace}/error/log`;
      return this.post(endpoint, params, reqOpts);
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Set the data serializer which will be used for all future PATCH,
   * POST and PUT requests.
   * Takes a string representing the type of the serializer.
   * @param serializerType
   */
  private setSerializerType(serializerType: string) {
    switch (serializerType) {
      case 'json':
        this.httpService.setDataSerializer('json');
        break;
      case 'multipart':
        this.httpService.setDataSerializer('multipart');
        break;
      case 'raw':
        this.httpService.setDataSerializer('raw');
        break;
      case 'urlencoded':
        this.httpService.setDataSerializer('urlencoded');
        break;
      case 'utf8':
        this.httpService.setDataSerializer('utf8');
        break;
    }
  }

  /**
   * @function normaliseResponse
   * This method is used to normalise response
   */
  public normaliseResponse(result) {
    if (result && result.data !== '' && result.headers['content-type'] !== 'text/html') {
      return JSON.parse(result.data);
    }
    return null;
  }

  /**
   * @function isAppTrackTransparencyEnabled
   * This method is used to enable apptrack transparency
   */
  public isAppTrackTransparencyEnabled() {
    if (this.platform.is('ios')) {
      const idfaPlugin = cordova.plugins.idfa;
      return idfaPlugin.getInfo().then((info) => {
        return info.trackingPermission === idfaPlugin.TRACKING_PERMISSION_AUTHORIZED;
      });
    }
    return Promise.resolve(true);
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
    return this.post<SessionModel>(endpoint, postData).then((res) => {
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
   * @function convertParamsToObject
   * This Method is used to form params into object
   */
  public convertParamsToObject(params) {
    return params
      ? typeof (params) === 'string'
        ? JSON.parse(params)
        : params
      : null;
  }

  /**
   * @function convertParamsToString
   * This Method is used to convert query params to string
   */
  public convertParamsToString(params) {
    if (!params) {
      return;
    }
    const transformedParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        transformedParams[key] = params[key].toString();
      }
    });
    return transformedParams;
  }
}
