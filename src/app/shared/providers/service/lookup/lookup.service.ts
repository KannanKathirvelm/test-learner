import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SCORES } from '@shared/constants/helper-constants';
import { AppConfigModel } from '@shared/models/config/config';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { TourMessagesModel } from '@shared/models/tour/tour';
import { LookupProvider } from '@shared/providers/apis/lookup/lookup';
import { setTenantSettings } from '@shared/stores/actions/lookup.action';
import { setTourDetails } from '@shared/stores/actions/tour.action';
import { getTenantSettings } from '@shared/stores/reducers/lookup.reducer';
import { getTourMessagesByKey } from '@shared/stores/reducers/tour.reducer';
import { cloneObject, concatFwSub } from '@shared/utils/global';
import { getSubjectCode } from '@shared/utils/taxonomyUtils';
import { BehaviorSubject } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  // -------------------------------------------------------------------------
  // Properties
  private tenantSettingsStoreSubscription: AnonymousSubscription;
  private tourDetailsStoreSubscription: AnonymousSubscription;
  public appConfigSubject: BehaviorSubject<AppConfigModel>;
  public readonly TAKE_TOUR = 'take_tour';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private lookupProvider: LookupProvider, private store: Store) {
    this.appConfigSubject = new BehaviorSubject<AppConfigModel>(null);
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  public fetchTenantSettings() {
    return new Promise((resolve) => {
      this.getTenantSettings().then((tenantSettings) => {
        if (!tenantSettings) {
          this.lookupProvider.fetchTenantSettings().then((result) => {
            this.store.dispatch(setTenantSettings({ data: result }));
            resolve(result);
          });
        } else {
          resolve(tenantSettings);
        }
      });
    });
  }

  /**
   * @function fetchTourMessages
   * This method used to get the tour messages
   */
  public fetchTourMessages(screen?): Promise<TourMessagesModel> {
    return new Promise((resolve) => {
      this.getTourMessages(screen).then((tourDetails: TourMessagesModel) => {
        if (!tourDetails) {
          this.lookupProvider.fetchTourMessages().then((result: Array<TourMessagesModel>) => {
            this.store.dispatch(setTourDetails({ data: result }));
            const tourMessage = this.getTourMessagesByKey(result, screen);
            resolve(tourMessage);
          });
        } else {
          resolve(tourDetails);
        }
      });
    });
  }

  /**
   * @function getTourMessagesByKey
   * This method used to get tour messages by key
   */
  private getTourMessagesByKey(tourDetails, screen) {
    if (!tourDetails) {
      return {};
    }
    return tourDetails.find((tour) => {
      return tour.key === screen;
    });
  }

  /**
   * @function fetchAppConfig
   * This method used to get the app config
   */
  public async fetchAppConfig(): Promise<AppConfigModel> {
    const appConfig = await this.lookupProvider.fetchAppConfig();
    this.appConfigSubject.next(appConfig);
    return appConfig;
  }

  get appConfig() {
    return this.appConfigSubject ? this.appConfigSubject.value : null;
  }

  /**
   * @function unSubscribeEvent
   * This Method is used to un subscribe the store event
   */
  public unSubscribeEvent() {
    if (this.tenantSettingsStoreSubscription) {
      this.tenantSettingsStoreSubscription.unsubscribe();
    }
    if (this.tourDetailsStoreSubscription) {
      this.tourDetailsStoreSubscription.unsubscribe();
    }
  }

  /**
   * @function getTenantSettings
   * This method used to get the tenant settings
   */
  public getTenantSettings() {
    return new Promise((resolve, reject) => {
      this.tenantSettingsStoreSubscription = this.store.select(getTenantSettings())
        .subscribe((tenantSettings) => {
          resolve(cloneObject(tenantSettings));
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @function getTourMessages
   * This method used to get the tour messages
   */
  public getTourMessages(screen): Promise<TourMessagesModel> {
    return new Promise((resolve, reject) => {
      this.tourDetailsStoreSubscription = this.store.select(getTourMessagesByKey(screen))
        .subscribe((tourDetails) => {
          resolve(cloneObject(tourDetails));
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @function getMasteryCompletionScore
   * This method used to get the completion score
   */
  public getMasteryCompletionScore(classDetails, collection) {
    return new Promise((resolve, reject) => {
      if (collection.taxonomy) {
        const assessmentSubjectKeys = Object.keys(collection.taxonomy);
        // Here we check the assessment subject if it is not present it should return default minscore
        return this.getTenantSettings().then((tenantSettings: TenantSettingsModel) => {
          if (assessmentSubjectKeys && assessmentSubjectKeys.length && tenantSettings) {
            const classPreference = classDetails ? classDetails.preference : null;
            const assessmentSubject = this.getAssessmentSubjectCode(assessmentSubjectKeys, classPreference);
            const tenantSubFwPref = tenantSettings.twFwPref;
            let framework = null;
            // Here we check the class subject and framework if it is not present we will get the tenant framework and subject
            if (classPreference && classPreference.subject && classPreference.framework) {
              // Here we check the class subject equals to assessment subject
              if (classPreference.subject === assessmentSubject && classPreference.framework) {
                framework = classPreference.framework;
              } else {
                // If the class subject is not equals to assessment subject we will get the tenant frameworks
                framework = this.getTenantFwPrefBySubject(assessmentSubject, tenantSubFwPref);
              }
            } else if (tenantSubFwPref) {
              framework = this.getTenantFwPrefBySubject(assessmentSubject, tenantSubFwPref);
            }
            let minScore = tenantSettings.competencyCompletionDefaultMinScore || SCORES.VERY_GOOD;
            const competencyCompletionMinScores = tenantSettings.competencyCompletionMinScore;
            if (framework) {
              // Here we get the minScore by matching the assessment subject with given frameworks from tenant
              const masteryMinScore = this.getMinScoreByTenantFwSub(
                concatFwSub(framework, assessmentSubject),
                competencyCompletionMinScores
              );
              if (masteryMinScore) {
                minScore = masteryMinScore;
              }
            }
            resolve(Number(minScore));
          } else {
            resolve(Number(SCORES.VERY_GOOD));
          }
        }, (error) => {
          // tslint:disable-next-line
          console.error(error);
          resolve(Number(SCORES.VERY_GOOD));
        });
      } else {
        resolve(null);
      }
    });
  }

  /**
   * @function getAssessmentSubjectCode
   * This method used to get assessment subject code
   */
  private getAssessmentSubjectCode(taxonomys, classPreference) {
    const taxonomyCount = taxonomys.length;
    let subjectCode = getSubjectCode(taxonomys[0]);
    if (taxonomyCount > 1) {
      if (classPreference && classPreference.subject) {
        taxonomys.forEach((taxonomy) => {
          const taxonomySubjectCode = getSubjectCode(taxonomy);
          if (taxonomySubjectCode === classPreference.subject) {
            subjectCode = taxonomySubjectCode;
          }
        });
      }
    }
    return subjectCode;
  }

  /**
   * @function getTenantFwPrefBySubject
   * This method used to get get the tenant preference using subject
   */
  private getTenantFwPrefBySubject(assessmentSubject, tenantFwPref) {
    let fwSubject;
    if (tenantFwPref) {
      const subjectFramework = tenantFwPref[assessmentSubject];
      fwSubject = subjectFramework ? subjectFramework.default_fw_id : null;
    }
    return fwSubject;
  }

  /**
   * @function getMinScoreByTenantFwSub
   * This method used to get MinScore by matching tenant's subject framework otherwise null
   */
  private getMinScoreByTenantFwSub(fwSub, minScores) {
    if (minScores && fwSub) {
      return Number(minScores[fwSub]);
    }
    return null;
  }
}
