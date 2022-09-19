import { Injectable } from '@angular/core';
import { AppLauncher, AppLauncherOptions } from '@ionic-native/app-launcher/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Market } from '@ionic-native/market/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EXTERNAL_APP_PACKAGES } from '@shared/constants/helper-constants';
import { ToastService } from '@shared/providers/service/toast.service';
import { generateUUID } from '@shared/utils/global';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  // -------------------------------------------------------------------------
  // Properties

  private sessionIdSubject: BehaviorSubject<string>;
  private proficiencyOccurrenceSubject: BehaviorSubject<number>;
  private diagnosticOccurrenceSubject: BehaviorSubject<number>;
  public onSessionId: Observable<string>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private diagnostic: Diagnostic,
    private toastService: ToastService,
    private translate: TranslateService,
    private clipboard: Clipboard,
    private device: Device,
    private platform: Platform,
    private appLauncher: AppLauncher,
    private market: Market,
    private screenOrientation: ScreenOrientation
  ) {
    this.proficiencyOccurrenceSubject = new BehaviorSubject<number>(0);
    this.diagnosticOccurrenceSubject = new BehaviorSubject<number>(0);
    this.sessionIdSubject = new BehaviorSubject<string>(null);
    this.onSessionId = this.sessionIdSubject.asObservable();
  }

  /**
   * @function isAndroid
   * This Method is used to find out the device is Android
   */
  public isAndroid() {
    const platform = this.device.platform;
    return platform === 'Android';
  }

  /**
   * @function deviceInfo
   * This Method is used to find out the device information
   */
  public deviceInfo() {
    const deviceInfo = {
      platform: this.device.platform,
      deviceName: this.device.manufacturer,
      deviceId: this.device.model,
      version: this.device.version,
    };
    return deviceInfo;
  }

  /**
   * @function getSessionId
   * This method used to get the session id
   */
  public getSessionId() {
    if (this.sessionId) {
      return this.sessionId;
    }
    const sessionId = generateUUID();
    this.sessionIdSubject.next(sessionId);
    return sessionId;
  }

  get sessionId() {
    return this.sessionIdSubject ? this.sessionIdSubject.value : null;
  }

  /**
   * @function isDesktop
   * This Method is used to find out the device is desktop
   */
  public isDesktop() {
    return this.platform.is('desktop');
  }

  /**
   * @function showInfoPopover
   * This method used to get the diagnostic info popover
   */
  public showInfoPopover(count) {
    const occurrencrCount = this.diagnosticOccurrenceSubject.value + count;
    this.diagnosticOccurrenceSubject.next(occurrencrCount);
    return this.diagnosticOccurrenceSubject.value <= 2;
  }

  /**
   * @function isIosDevice
   * This Method is used to find out the device is desktop
   */
  public isIosDevice() {
    return this.platform.is('ios');
  }

  /**
   * @function showExpandedPopover
   * This method used to get the show expanded popover
   */
  public showExpandedPopover(count) {
    const occurrencrCount = this.proficiencyOccurrenceSubject.value + count;
    this.proficiencyOccurrenceSubject.next(occurrencrCount);
    return this.proficiencyOccurrenceSubject.value <= 2;
  }

  /**
   * @function copyToClipBoard
   * This method used to copy the content to clipboard
   */
  public copyToClipBoard(content) {
    this.clipboard.copy(content);
    const copiedText = this.translate.instant('COPIED_TO_CLIPBOARD');
    this.toastService.presentToast(copiedText);
  }

  /**
   * @function openMeetingLink
   * This method used to open the meeting link
   */
  public openMeetingLink(link) {
    const options: AppLauncherOptions = {};
    if (this.isAndroid()) {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_ANDROID_APP;
    } else {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_IOS_APP;
    }
    options.uri = link;
    this.launchApp(options, EXTERNAL_APP_PACKAGES.GOOGLE_MEET_ANDROID_APP,
      EXTERNAL_APP_PACKAGES.GOOGLE_MEET_IOS_APP);
  }

  /**
   * @function checkMicrophoneAndStoragePermission
   * This method is used to check permissions
   */
  public checkMicrophoneAndStoragePermission() {
    this.diagnostic.requestRuntimePermissions([
      this.diagnostic.permission.RECORD_AUDIO,
      this.diagnostic.permission.WRITE_EXTERNAL_STORAGE,
      this.diagnostic.permission.READ_EXTERNAL_STORAGE
    ]).catch((error) => {
      // tslint:disable-next-line
      console.error("error in permission request", error);
    });
  }

  /**
   * @function convertSecondsToHm
   * This method is used to convert seconds to HM (hours and mins)
   */
  public convertSecondsToHm(timeInSec) {
    const time = Number(timeInSec);
    const h = Math.floor(time / 3600);
    const m = Math.floor(time % 3600 / 60);
    const hDisplay = h > 0 ? h + 'h ' : '';
    const mDisplay = m > 0 ? m + 'm' : '';
    return hDisplay + mDisplay;
  }

  /**
   * @function openPDFLink
   * This method used to open the chrome
   */
  public openPDFLink(link) {
    const options: AppLauncherOptions = {};
    if (this.isAndroid()) {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_ANDROID_APP;
    } else {
      options.packageName = EXTERNAL_APP_PACKAGES.SAFARI_APP;
    }
    options.uri = link;
    this.launchApp(options, EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_ANDROID_APP,
      EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_IOS_APP);
  }

  /**
   * @function launchApp
   * This Method is used to launch the external app
   */
  public launchApp(options: AppLauncherOptions, defaultAndroidURI, defaultIOSURI) {
    this.appLauncher.launch(options).catch(() => {
      const packageName = this.isAndroid() ? defaultAndroidURI : defaultIOSURI;
      this.market.open(packageName);
    });
  }

  /**
   * @function lockOrientationInPortrait
   * This Method is used to lock orientation in potrait
   */
  public lockOrientationInPortrait() {
    if (!this.isDesktop()) {
      this.screenOrientation.lock(
        this.screenOrientation.ORIENTATIONS.PORTRAIT
      );
    }
  }

  /**
   * @function lockOrientationInLandscape
   * This Method is used to lock orientation in landscape
   */
  public lockOrientationInLandscape() {
    if (!this.isDesktop()) {
      this.screenOrientation.lock(
        this.screenOrientation.ORIENTATIONS.LANDSCAPE
      );
    }
  }

  /**
   * @function isH5PContent
   * This Method is used to check isH5PContent
   */
  public isH5PContent(contentFormat) {
    return contentFormat === 'h5p_interactive_video' || contentFormat === 'h5p_interactive_slide';
  }

  /**
   * @function isiOS
   * This Method is used to find out the device is iOS
   */
  public isiOS() {
    const platform = this.device.platform;
    return platform === 'iOS';
  }

  /**
   * @function isBrowser
   * This Method is used to find out the device is Browser
   */
  public isBrowser() {
    const isCordova = this.isAndroid() || this.isiOS();
    const isDesktopOrMobile = this.platform.is('desktop') || this.platform.is('mobile');
    return (!isCordova && isDesktopOrMobile);
  }
}
