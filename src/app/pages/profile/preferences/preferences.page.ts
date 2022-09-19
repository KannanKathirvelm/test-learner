import { Component } from '@angular/core';
import { ClassificationTypeModel, StandardPreferenceModel } from '@models/preferences/preferences';
import { PreferencesProvider } from '@providers/apis/preferences/preferences';
import { SETTINGS } from '@shared/constants/helper-constants';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { LoadingService } from '@shared/providers/service/loader.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';

@Component({
  selector: 'preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})
export class PreferencesPage {
  // -------------------------------------------------------------------------
  // Properties
  public classificationType: Array<ClassificationTypeModel>;
  public preferences: StandardPreferenceModel;
  public dataVisibility: boolean;
  public tenantValue: string;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileService: ProfileService,
    private preferencesProvider: PreferencesProvider,
    private loader: LoadingService,
    private lookupService: LookupService
  ) {
    this.tenantValue = SETTINGS.ON;
  }

  // -------------------------------------------------------------------------
  // Hooks

  public ionViewDidEnter() {
    this.classificationType = [];
    this.fetchPreferences();
    this.fetchTenantSettings();
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings value
   */
  public fetchTenantSettings() {
    this.lookupService.getTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      if (tenantSettings) {
        this.tenantValue = tenantSettings.useLearnerDataVisibiltyPref ? tenantSettings.useLearnerDataVisibiltyPref : SETTINGS.ON ;
      }
    });
  }

  /**
   * @function fetchPreferences
   * This method is used to fetch Preferences
   */
  public fetchPreferences() {
    this.preferences = this.profileService.profilePreferences;
    if (this.preferences) {
      this.loader.displayLoader();
      const learnerDataVisibilty = this.preferences ? this.preferences.learner_data_visibilty_pref : null;
      if (learnerDataVisibilty) {
        const showScore = learnerDataVisibilty.show_score;
        const showTimespent = learnerDataVisibilty.show_timespent;
        const showProficiency = learnerDataVisibilty.show_proficiency;
        this.dataVisibility = showScore || showTimespent || showProficiency;
      }
      this.fetchClassifications().then((classifications) => {
        const serializeData = this.preferencesProvider.serializeClassificationsList(
          this.preferences.standard_preference,
          classifications
        );
        serializeData.classificationData.map((value) => {
          this.fetchClassificationType(value.id, value.title);
        });
        this.loader.dismissLoader();
      });
    }
  }

  /**
   * @function fetchClassifications
   * @param {Array} preferences
   * This method is used to fetch fetch Classifications
   */
  public fetchClassifications() {
    return new Promise((resolve, reject) => {
      return this.preferencesProvider
        .fetchClassifications()
        .then((response) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @function onSelectFramework
   * Method to set the selected framework
   */
  public async onSelectFramework(selectedSubject) {
    const preferences = this.preferences.standard_preference;
    preferences[selectedSubject.subjectId] = selectedSubject.frameworkId;
    await this.preferencesProvider.savePreferences(preferences);
    this.profileService.fetchProfilePreference();
  }

  /**
   * @function fetchClassificationType
   * This method is used to fetch fetch Classification Type
   */
  public fetchClassificationType(type, title) {
    const preferences = this.preferences.standard_preference;
    this.preferencesProvider
      .fetchClassificationType(type)
      .then((response) => {
        const subjectDetails = response;
        const classificationsDetails = [];
        Object.keys(preferences).forEach((item) => {
          const classificationsData = subjectDetails.find(
            (classifications) => item === classifications.id
          );
          if (classificationsData) {
            classificationsData.value = preferences[item];
            classificationsDetails.push(classificationsData);
          }
        });
        const data = {
          title,
          subjects: classificationsDetails,
        };
        this.classificationType.push(data);
      });
  }

  /**
   * @function onDeleteCategory
   * This method is used to delete Category
   */
  public onDeleteCategory(data) {
    const preferences = this.preferences;
    data.category.forEach((item) => {
      delete preferences[item.id];
    });
    this.classificationType.splice(data.classificationIndex, 1);
    this.preferencesProvider.savePreferences(preferences);
  }

  /**
   * @function onToggleDataVisibility
   * Method to change data visibility
   */
  public onToggleDataVisibility(event) {
    this.dataVisibility = event.detail.checked;
    let consent;
    if (this.dataVisibility) {
      consent = { show_email: true, show_timespent: true, show_score: true, show_proficiency: true };
    } else {
      consent = { show_email: false, show_timespent: false, show_score: false, show_proficiency: false };
    }
    this.preferencesProvider.fetchVisibilityPreference(consent);
    const visibilityPreference = {
      learner_data_visibilty_pref: consent,
    };
    this.preferencesProvider.dataVisibilityPreference(visibilityPreference);
  }
}
