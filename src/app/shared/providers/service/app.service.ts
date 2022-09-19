import { Injectable, NgZone } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from '@environment/environment';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Market } from '@ionic-native/market/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { deeplinkRoutes, NO_AUTHENTICATION_NEED_ROUTES } from '@shared/constants/deeplink-constants';
import { routerPathIdReplace, routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';
import { AppConfigModel } from '@shared/models/config/config';
import { ClassService } from '@shared/providers/service/class/class.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { ToastService } from '@shared/providers/service/toast.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { checkRouterUrl, cloneObject, compareVersions, getInBetweenValue } from '@shared/utils/global';
import { BehaviorSubject } from 'rxjs';

export interface DeeplinkModel {
  $link: any;
  $args: any;
  $route: any;
}

@Injectable()
export class AppService {

  // -------------------------------------------------------------------------
  // Properties

  private deeplinkSubject: BehaviorSubject<DeeplinkModel>;
  private appNotificationCount: number;
  private readonly ROUTE_NAVIGATORS = [
    {
      route: 'study-player',
      navigationRoute: 'home'
    }
  ];
  private readonly APP_NOTIFICATION_KEY = 'app_notification';

  /**
   * @property deeplink
   * This property is used to get deeplinks
   */
  get deeplink() {
    return this.deeplinkSubject ? cloneObject(this.deeplinkSubject.value) : null;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private storage: Storage,
    private toastService: ToastService,
    private classService: ClassService,
    private platform: Platform,
    private lookupService: LookupService,
    private navCtrl: NavController,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private statusBar: StatusBar,
    private market: Market,
    private translate: TranslateService,
    private alertController: AlertController,
    private deeplinks: Deeplinks,
    private zone: NgZone,
    private router: Router,
  ) {
    this.deeplinkSubject = new BehaviorSubject<DeeplinkModel>(null);
    this.appNotificationCount = 0;
  }

  /**
   * @function lockOrientation
   * This Method is used to lock orientation
   */
  public lockOrientation() {
    this.utilsService.lockOrientationInPortrait();
  }

  /**
   * @function handleHardWareBackEvent
   * This Method is used to handle the hardware back event in mobile
   */
  public handleHardWareBackEvent() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      const classId = this.classService.class.id;
      const url = this.router.url;
      this.ROUTE_NAVIGATORS.forEach((navigation) => {
        const currentRoute = checkRouterUrl(url, navigation.route);
        if (currentRoute) {
          const classPageURL = routerPathIdReplace(navigation.navigationRoute, classId);
          this.router.navigate([classPageURL]);
        }
      });
    });
  }

  /**
   * @function checkDeeplinkUrl
   * This Method is used to check the deeplink url
   */
  public checkDeeplinkUrl(isDeeplinkUrl) {
    if (isDeeplinkUrl) {
      this.handleDeeplinkUrl();
    } else {
      this.navCtrl.navigateRoot(routerPath('studentHome'));
    }
  }

  /**
   * @function handleStatusBar
   * This Method is used to handle the status bar
   */
  public handleStatusBar() {
    const isAndroid = this.utilsService.isAndroid();
    if (isAndroid) {
      this.statusBar.styleLightContent();
    } else {
      this.statusBar.styleDefault();
    }
  }

  /**
   * @function handleAppNotification
   * This Method is used to handle app notification
   */
  public handleAppNotification() {
    this.lookupService
      .fetchAppConfig()
      .then(async (appConfig: AppConfigModel) => {
        if (appConfig) {
          const isEnableMaintenanceMode = appConfig.enable_maintenance_mode;
          const isEnableNotification = appConfig.enable_notification;
          if (isEnableNotification && isEnableNotification.value.option) {
            const isNotified = await this.storage.get(this.APP_NOTIFICATION_KEY);
            if (!isNotified) {
              const notificationMessage = appConfig.notification_message.value.message;
              this.toastService.presentToast(notificationMessage);
              this.appNotificationCount += 1;
              if (this.appNotificationCount === 2) {
                this.storage.set(this.APP_NOTIFICATION_KEY, true);
              }
            }
          } else {
            this.storage.set(this.APP_NOTIFICATION_KEY, false);
          }
          if (isEnableMaintenanceMode && isEnableMaintenanceMode.value.option) {
            const message = appConfig.maintenance_message.value.message;
            this.displayMaintenanceAlert(message);
          }
        }
      });
  }

  /**
   * @function initialize
   * This Method is used to initialize update
   */
  public async initialize() {
    const appConfig = await this.lookupService.fetchAppConfig();
    if (appConfig) {
      const isReleaseInfo = appConfig && appConfig.release_info;
      if (isReleaseInfo) {
        const releaseInfo = appConfig.release_info;
        const minVersion = releaseInfo.value.minVersion;
        const appVersion = environment.APP_VERSION;
        const showAlert = compareVersions(minVersion, '>', appVersion);
        if (showAlert) {
          this.displayUpdateAlert();
        }
      }
    }
    return;
  }

  /**
   * @function displayUpdateAlert
   * This Method is used to display the alert update
   */
  public async displayUpdateAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('ALERT'),
      message: this.translate.instant('NAVIGATOR_UPDATE'),
      buttons: [
        {
          text: this.translate.instant('UPDATE'),
          handler: () => {
            this.market.open(environment.PACKAGE_NAME);
            return false;
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  /**
   * @function displayMaintenanceAlert
   * This Method is used to display the maintenance break alert
   */
  public async displayMaintenanceAlert(message) {
    const isAndroid = this.utilsService.isAndroid();
    const translateMsg = isAndroid ? 'CLOSE_APP' : 'OKAY';
    const alert = await this.alertController.create({
      header: this.translate.instant('MAINTENANCE_ALERT'),
      message,
      buttons: [
        {
          text: this.translate.instant(translateMsg),
          handler: () => {
            navigator['app'].exitApp();
          },
        },
      ],
      backdropDismiss: false,
      cssClass: 'maintenance-alert'
    });
    await alert.present();
  }

  /**
   * @function handleDeeplinkUrl
   * This Method is used to handle deeplink urls
   */
  public handleDeeplinkUrl() {
    const deeplink = this.deeplink;
    const deeplinkId = deeplink.$args.id;
    const deeplinkPath = deeplink.$link.path;
    this.navigateDeeplinkUrl(deeplinkId, deeplinkPath);
  }

  /**
   * @function navigateDeeplinkUrl
   * This Method is used to navigate to deeplink url
   */
  public navigateDeeplinkUrl(id, path) {
    const params = {
      id
    };
    this.router.navigate([path], {
      queryParams: params
    });
  }

  /**
   * @function registerDeeplinks
   * This Method is used to register deeplinks
   * We are facing issue with latest deeplink version so currently we are using stable version 1.0.20.
   * Also, check out {@link https://github.com/ionic-team/ionic-plugin-deeplinks/pull/191#issuecomment-619795962}
   */
  public async registerDeeplinks() {
    this.deeplinks.route(deeplinkRoutes()).subscribe((match) => {
      this.zone.run(() => {
        this.sessionService.currentSession.subscribe((session) => {
          const isAuthenticated = this.sessionService.isLoggedInUser(session);
          if (isAuthenticated || NO_AUTHENTICATION_NEED_ROUTES.includes(match.$link.path)) {
            // these steps used to avoid decode in URL
            const deeplinkPath = match.$link.path;
            if (deeplinkPath === routerPath('resetPassword')) {
              const queryString = match.$link.queryString;
              const parseToken = getInBetweenValue(queryString, 'token=', '&');
              match.$args.token = parseToken;
            }
            this.navCtrl.navigateRoot([match.$link.path], { queryParams: match.$args });
          } else {
            this.deeplinkSubject.next(match);
            const navigationExtras: NavigationExtras = {
              queryParams: { isDeeplinkUrl: true }
            };
            this.navCtrl.navigateRoot(routerPath('login'), navigationExtras);
          }
        });
      });
    }, nomatch => {
      const error = `Got a deeplink that didn\'t match ${JSON.stringify(nomatch)}`;
      // tslint:disable-next-line
      console.error(error);
    });
  }

}
