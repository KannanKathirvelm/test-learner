import { Injectable } from '@angular/core';
import { ClassificationTypeModel, DataVisibilityModel, SubjectClassificationsModel, VisibilityPreferenceModel } from '@models/preferences/preferences';
import { HttpService } from '@shared/providers/apis/http';

@Injectable({
  providedIn: 'root'
})
export class PreferencesProvider {

  // -------------------------------------------------------------------------
  // Properties
  private namespaceV1 = 'api/nucleus/v1';
  private namespaceV2 = 'api/nucleus/v2';
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchClassifications
   * This method is used to fetch the Classifications
   */
  public fetchClassifications() {
    const endpoint = `${this.namespaceV2}/taxonomy/classifications`;
    return this.httpService.get<SubjectClassificationsModel>(endpoint).then((response) => {
      return response.data;
    });
  }

  /**
   * @function fetchVisibilityPreference
   * This method is used to fetch the boolean value for visibility
   */
  public fetchVisibilityPreference(params) {
    const endpoint = `${this.namespaceV2}/classes/consent`;
    return this.httpService.put<VisibilityPreferenceModel>(endpoint, params).then((response) => {
      return response.data;
    });
  }

  /**
   * @function dataVisibilityPreference
   * This method is used for data visibility preference
   */
  public dataVisibilityPreference(params) {
    const endpoint = `${this.namespaceV2}/profiles/preference`;
    return this.httpService.put<DataVisibilityModel>(endpoint, params).then((response) => {
      return response.data;
    });
  }

  /**
   * @function serializeClassificationsList
   * @param {Array} subject
   * This method is used to serialize Classifications List
   */
  public serializeClassificationsList(preferences, subjects) {
    const subjectDetails = subjects.subject_classifications;
    const classificationsDetails = [];
    if (preferences) {
      Object.keys(preferences).forEach((item) => {
        const key = item.split('.');
        const code = key[0];
        const classificationsData = subjectDetails.find((classifications) => {
          return code === classifications.code;
        });
        if (classificationsData) {
          classificationsDetails.push(classificationsData);
        }
      });
    }
    const classificationData = classificationsDetails.reduce((classifications, value) => {
      if (!classifications.find(element => element.id === value.id)) {
        classifications.push(value);
      }
      return classifications;
    }, []);
    const classificationValue = {
      classificationData,
      preferences
    };
    return classificationValue;
  }

  /**
   * @function fetchClassificationType
   * This method is used to fetch the Classification Type
   */
  public fetchClassificationType(classificationType) {
    const params = {
      classification_type: classificationType
    };
    const endpoint = `${this.namespaceV1}/taxonomy/subjects`;
    return this.httpService.get<ClassificationTypeModel>(endpoint, params).then((response) => {
      return this.serializeSubject(response.data.subjects);
    });
  }


  /**
   * @function savePreferences
   * This method is used to update the preferences
   */
  public savePreferences(preferences) {
    const params = {
      language_preference: null,
      standard_preference: preferences
    };
    const endpoint = `${this.namespaceV2}/profiles/preference`;
    return this.httpService.put<ClassificationTypeModel>(endpoint, params);
  }

  /**
   * @function serializeSubject
   * This method is used to fetch the Classification Type
   */
  public serializeSubject(subject) {
    const serializedSubject = [];
    subject.map(subjects => {
      serializedSubject.push(
        this.serializeSubjectItem(subjects)
      );
    });
    return serializedSubject;
  }

  /**
   * @function serializeSubjectItem
   * This method is used to fetch the Classification Type
   */
  public serializeSubjectItem(subjects) {
    let serializedItem = {};
    if (subjects) {
      serializedItem = {
        id: subjects.id,
        title: subjects.title,
        description: subjects.description,
        code: subjects.code,
        standardFrameworkId: subjects.standard_framework_id,
        value: null,
        frameworks: this.serializeFramework(subjects.frameworks)
      };
    }
    return serializedItem;
  }

  /**
   * @function serializeFramework
   * This method is used to serialize Framework
   */
  public serializeFramework(framework) {
    const serializedFramework = [];
    framework.map(frameworks => {
      serializedFramework.push(
        this.serializeFrameworkItem(frameworks)
      );
    });
    return serializedFramework;
  }

  /**
   * @function serializeFrameworkItem
   * This method is used to serialize Framework Item
   */
  public serializeFrameworkItem(framework) {
    let serializedItem = {};
    if (framework) {
      serializedItem = {
        standardFrameworkId: framework.standard_framework_id,
        taxonomySubjectId: framework.taxonomy_subject_id,
        taxonomySubjectTitle: framework.taxonomy_subject_title,
        title: framework.title
      };
    }
    return serializedItem;
  }
}
