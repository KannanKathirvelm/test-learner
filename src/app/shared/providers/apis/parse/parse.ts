import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Platform } from '@ionic/angular';
import { AnalyticEventsModel, LocationModel } from '@shared/models/analytics/analytics';
declare var cordova: any;
import { HTTP } from '@ionic-native/http/ngx';
import { CustomHTTPResponse } from '@shared/models/auth/session';
import axios from 'axios';


@Injectable({
  providedIn: 'root'
})

export class ParseProvider {

  // -------------------------------------------------------------------------
  // Properties

  private parseNamespace: string;
  private locationNamespace = 'http://ip-api.com/json';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HTTP, private platform: Platform) {
    this.parseNamespace = environment.PARSE_API_PATH;
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function trackEvent
   * This method is used to post the events
   */
  public async trackEvent(params) {
    const isTrackPermissionEnabled = await this.isAppTrackTransparencyEnabled();
    if (isTrackPermissionEnabled) {
      const endpoint = `${this.parseNamespace}/event`;
      const headers = this.getAppIdHeaders();
      const reqOpts = { headers };
      return this.post<AnalyticEventsModel>(endpoint, params, reqOpts).then((result) => {
        return result;
      });
    } else {
      return Promise.resolve();
    }
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
   * @function isAppTrackTransparencyEnabled
   * This method is used to track app transparency
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
   * @function fetchLocationInfo
   * This method is used to fetch location Info
   */
  public async fetchLocationInfo() {
    const isTrackPermissionEnabled = await this.isAppTrackTransparencyEnabled();
    if (isTrackPermissionEnabled) {
      const endpoint = `${this.locationNamespace}`;
      const reqOpts = {
        headers: {
          Authorization: '' // To Restrict Anonymous SignIn
        }
      };
      return this.get<LocationModel>(endpoint, {}, reqOpts).then((res) => {
        return this.normalizeLocationInfo(res && res.data || {});
      });
    } else {
      return Promise.resolve({} as LocationModel);
    }
  }

  /**
   * @function normalizeLocationInfo
   * This method is used to normalize the location info
   */
  private normalizeLocationInfo(payload): LocationModel {
    return {
      city: payload.city || null,
      country: payload.country || null,
      countryCode: payload.countryCode || null,
      isp: payload.isp || null,
      lat: payload.lat || null,
      lon: payload.lon || null,
      org: payload.org || null,
      query: payload.query || null,
      region: payload.region || null,
      regionName: payload.regionName || null,
      timezone: payload.timezone || null,
      pin: payload.zip || null
    };
  }

  /**
   * @function get
   * This Method is used for get method on HTTP request
   */
  public get<T>(url: string, params?: any, apiHeaders?: any): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = apiHeaders ? apiHeaders.headers ? apiHeaders.headers : apiHeaders : {};
      if (this.platform.is('ios')) {
        const queryParams = this.convertParamsToString(params);
        this.httpService.get(endpoint, queryParams, customHeaders).then((result) => {
          const resultData = result.data && JSON.parse(result.data);
          result.data = resultData;
          resolve(result);
        }).catch((error) => {
          const errorResponse = this.handleErrorResponse(error, url);
          reject(errorResponse);
        });
      } else {
        const options = {
          headers: customHeaders,
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
  }

  /**
   * @function post
   * This Method is used for post method on HTTP request
   */
  public post<T>(url: string, data?: any, headers?: any): Promise<CustomHTTPResponse> {
    return new Promise((resolve, reject) => {
      const endpoint = this.formURL(url);
      const customHeaders = headers && headers.headers || {};
      if (this.platform.is('ios')) {
        this.httpService.setDataSerializer('json');
        this.httpService.post(endpoint, data, customHeaders).catch((error) => {
          const errorResponse = this.handleErrorResponse(error, url);
          reject(errorResponse);
        });
        resolve();
      } else {
        axios.post(endpoint, data, {
          headers: customHeaders
        }).then((result) => {
          resolve(result);
        }).catch((error) => {
          const errorResponse = this.handleErrorResponse(error.response, url);
          reject(errorResponse);
        });
      }
    });
  }

  /**
   * @function formURL
   * This Method is used to form url endpoint
   */
  private formURL(url: string) {
    const apiUrl = environment.API_END_POINT;
    if (apiUrl && !url.includes('http') && !url.includes('assets')) {
      url = `${apiUrl}/${url}`;
    }
    return url;
  }

  /**
   * @function handleErrorResponse
   * This Method is handle errors for the response.
   */
  public handleErrorResponse(error, url) {
    if (this.platform.is('ios')) {
      const errorResponse = error.error;
      error.data = errorResponse && JSON.parse(errorResponse);
      return error;
    }
    return error;
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
      if (params[key]) {
        transformedParams[key] = params[key].toString();
      }
    });
    return transformedParams;
  }

  /**
   * @function getAppIdHeaders
   * This Method is used to get app id headers
   */
  public getAppIdHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': environment.APP_ID,
    };
  }
}
