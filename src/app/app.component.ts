import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router, RoutesRecognized } from '@angular/router';
import { AppLogout } from '@app/app.logout';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Platform } from '@ionic/angular';
import { TranslationService } from '@providers/service/translation.service';
import { EVENTS } from '@shared/constants/events-constants';
import { routerEventPath } from '@shared/constants/router-constants';
import { SessionModel } from '@shared/models/auth/session';
import { AppService } from '@shared/providers/service/app.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { getRouteFromUrl } from '@shared/utils/global';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';
declare var cordova: any;
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from '@shared/providers/apis/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  // -------------------------------------------------------------------------
  // Properties
  public isAuthenticated: boolean;
  public userSession: SessionModel;
  public activeRouterPath: string;
  public startTime: number;
  private routerEventsSubscription: AnonymousSubscription;
  public isLogOut: boolean;
  private isRefreshTokenCalled: boolean;
  private refreshTokenSubscription: AnonymousSubscription;
  private isLangLoaded: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private lookupService: LookupService,
    private parseService: ParseService,
    private router: Router,
    private appLogoutService: AppLogout,
    private sessionService: SessionService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private keyboard: Keyboard,
    private translationService: TranslationService,
    private appService: AppService,
    private httpService: HttpService,
    private translate: TranslateService
  ) {
    this.initializeApp();
    this.isLangLoaded = false;
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.sessionService.currentSession.subscribe(async (session) => {
      this.isAuthenticated = this.sessionService.isLoggedInUser(session);
      this.userSession = session;
      if (this.isAuthenticated && !this.isLangLoaded) {
        this.isLangLoaded = true;
        const lang = await this.translationService.getLanguage();
        this.translate.reloadLang(lang);
      }
    });
    this.subscribeToRefreshToken();
    this.handlePageViewEvent();
    this.parseService.fetchLocationInfo();
    this.lookupService.fetchTourMessages();
  }

  public ngOnDestroy() {
    this.routerEventsSubscription.unsubscribe();
    this.refreshTokenSubscription.unsubscribe();
  }

  public ngAfterViewInit() {
    // We loading the mathjax script on after view is loaded
    import('assets/js/mathjax-loader.js');
  }

  /**
   * @function initializeApp
   * This Method is used to initialize the app
   */
  public initializeApp() {
    this.platform.ready().then(() => {
      this.startTime = moment().valueOf();
      this.initTranslate();
      this.hideSplashScreen();
      this.appService.handleStatusBar();
      this.appService.lockOrientation();
      this.appService.registerDeeplinks();
      this.appService.handleHardWareBackEvent();
      this.keyboard.disableScroll(true);
      this.requestAppTrackingTransparency();
    });
  }

  /**
   * @function requestAppTrackingTransparency
   * This Method is used to request the app tracking transparency
   */
  private requestAppTrackingTransparency() {
    if (this.platform.is('ios')) {
      const idfaPlugin = cordova.plugins.idfa;
      idfaPlugin.getInfo().then((info) => {
        if (info.trackingPermission !== idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
          idfaPlugin.requestPermission();
        }
      });
    }
  }

  /**
   * @function subscribeToRefreshToken
   * This Method is used to subscribe to refresh token
   */
  public subscribeToRefreshToken() {
    this.refreshTokenSubscription = this.httpService.refreshToken.subscribe((tokenTime) => {
      if (!this.isRefreshTokenCalled && tokenTime) {
        this.sessionService.refreshToken();
        this.isRefreshTokenCalled = true;
      }
    });
  }

  /**
   * @function handlePageViewEvent
   * This Method is used to handle the page view event
   */
  public handlePageViewEvent() {
    this.routerEventsSubscription = this.router.events.subscribe((route) => {
      if (route instanceof RoutesRecognized && !this.activeRouterPath) {
        this.activeRouterPath = getRouteFromUrl(route.url);
      }
      if (route instanceof NavigationStart) {
        const routerPath = getRouteFromUrl(route.url);
        if (this.activeRouterPath !== routerPath) {
          if (!this.isLogOut) {
            this.trackPageViewEvent();
          } else {
            this.isLogOut = false;
          }
          this.activeRouterPath = routerPath;
        }
      }
    });
  }
  /**
   * @function trackPageViewEvent
   * This Method is used to track the page view event
   */
  public trackPageViewEvent() {
    const context = this.getPageViewEventContext();
    this.parseService.trackEvent(EVENTS.PAGE_VIEW, context).then(() => {
      this.startTime = moment().valueOf();
    });
  }
  /**
   * @function getPageViewEventContext
   * This method is used to get the context of page view event
   */
  private getPageViewEventContext() {
    const endTime = moment().valueOf();
    const pageName = this.activeRouterPath ? routerEventPath(this.activeRouterPath) : null;
    return {
      pageName,
      startTime: this.startTime,
      endTime
    };
  }
  /**
   * @function hideSplashScreen
   * This Method is used to show splash screen
   */
  private hideSplashScreen() {
    this.splashScreen.hide();
  }
  /**
   * @function initTranslate
   * This Method is used to init translation
   */
  private initTranslate() {
    this.translationService.initTranslate();
  }
  /**
   * @function onLogout
   * This Method is used to logout from the app
   */
  public onLogout() {
    this.isAuthenticated = false;
    this.isLogOut = true;
    this.isLangLoaded = false;
    this.trackLogoutEvent().then(() => {
      this.appLogoutService.execute();
    });
  }
  /**
   * @function trackLogoutEvent
   * This Method is used to logout from the app
   */
  public trackLogoutEvent() {
    return this.parseService.trackEvent(EVENTS.USER_LOGOUT);
  }
}
