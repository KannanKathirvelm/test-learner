import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Storage } from '@ionic/storage';
import { ROLES } from '@shared/constants/helper-constants';
import { AppConfigModel } from '@shared/models/config/config';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import * as Driver from 'driver.js';

@Injectable({
  providedIn: 'root'
})

export class TourService {

  // -------------------------------------------------------------------------
  // Properties

  private readonly SESSION_STORAGE_KEY = 'gooru_user_session';
  private readonly GUARDIAN_STORAGE_KEY = 'gooru_guardian_session';
  private DEFAULT_OPTIONS = {
    animate: true,
    opacity: 0.75,
    padding: 5,
    allowClose: true,
    keyboardControl: true,
    overlayClickNext: true,
    stageBackground: '#ffffff',
    showButtons: true,
    closeBtnText: 'close'
  };

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private lookupService: LookupService,
    private storage: Storage
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function start
   * This method is used to start the tour overlays
   */
  public async start(className, steps, options?) {
    const isTourApplicable = await this.isTourApplicable(className);
    try {
      if (isTourApplicable) {
        const tourKey = await this.getTourKey(className);
        const driver = new Driver({
          className,
          ...this.DEFAULT_OPTIONS,
          ...options
        });
        driver.defineSteps(steps);
        driver.start();
        await this.storage.set(tourKey, true);
      }
    } catch (error) {
      // tslint:disable-next-line
      console.error(error);
    }
  }

  /**
   * @function isTourEnabled
   * This method is used to get is tour enabled key
   */
  public isTourEnabled() {
    const appConfig: AppConfigModel = this.lookupService.appConfig;
    return appConfig && appConfig.enable_tour_overlay ? appConfig.enable_tour_overlay.value.option : false;
  }

  /**
   * @function isTourApplicable
   * This method is used to check the tour view applicable
   */
  public async isTourApplicable(className) {
    const tourKey = await this.getTourKey(className);
    const isTourSelected = await this.storage.get(tourKey);
    const isTourApplicable = await this.isTourEnabled();
    return isTourApplicable && isTourSelected === null;
  }

  /**
   * @function getTourKey
   * This method is used to get tour key
   */
  public async getTourKey(className) {
    const storageKey = environment.APP_LEARNER ? this.SESSION_STORAGE_KEY : this.GUARDIAN_STORAGE_KEY;
    const appType = environment.APP_LEARNER ? ROLES.STUDENT : ROLES.GUARDIAN;
    const userKey = environment.APP_LEARNER ? 'user_id' : 'id';
    const session = await this.storage.get(storageKey);
    return `tour_${appType}-${session[userKey]}-${className}`;
  }
}
