import { Injectable } from '@angular/core';
import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL, COLLECTION,
  COLLECTION_EXTERNAL,
  OFFLINE_ACTIVITY
} from '@shared/constants/helper-constants';
import { ClassActivity } from '@shared/models/class-activity/class-activity';
import { ClassActivityProvider } from '@shared/providers/apis/class-activity/class-activity';
import { OfflineActivityProvider } from '@shared/providers/apis/offline-activity/offline-activity';
import { SuggestionProvider } from '@shared/providers/apis/suggestion/suggestion';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ClassActivityService {


  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private offlineActivityProvider: OfflineActivityProvider,
    private sessionService: SessionService,
    private classActivityProvider: ClassActivityProvider,
    private suggestionProvider: SuggestionProvider,
    private performanceService: PerformanceService
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Retrieve the student class activity list for a month
   * @param {string}classId
   * @param {string}startDate
   * @param {string}endDate
   * @return {ClassActivity[]}
   */
  public fetchMonthActivityList(classId, startDate, endDate?): Promise<Array<ClassActivity>> {
    return this.classActivityProvider.fetchClassActivityList(classId, startDate, endDate);
  }

  /**
   * Retrieve the student class activity list
   * @param {string}classId
   * @param {string}startDate
   * @param {string}endDate
   * @return {ClassActivity[]}
   */
  public fetchActivityList(classId, startDate, endDate?, callSuggestion = true): Promise<Array<ClassActivity>> {
    return new Promise((resolve, reject) => {
      endDate = endDate ? endDate : startDate;
      const userId = this.sessionService.userSession.user_id;
      return this.classActivityProvider.fetchClassActivityList(classId, startDate, endDate).then((activityList) => {
        const offlineActivityIds = this.getOfflineClassActivityIds(activityList);
        const assessmentIds = this.getClassActivitiesIds(activityList, ASSESSMENT, ASSESSMENT_EXTERNAL);
        const collectionIds = this.getClassActivitiesIds(activityList, COLLECTION, COLLECTION_EXTERNAL);
        const activityMinDate = this.getMinDateOfActivity(activityList) || startDate;
        const activityMaxDate = this.getMaxDateOfActivity(activityList) || endDate;
        if (callSuggestion) {
          this.setSuggestionToCA(classId, activityList, false);
        }
        if (collectionIds.length) {
          this.offlineActivityProvider.findStudentActivityPerformanceSummary(
            userId,
            classId,
            collectionIds,
            COLLECTION,
            activityMinDate,
            activityMaxDate
          ).then(performance => {
            this.normalizePerformanceSummary(performance, activityList);
          }, reject);
        }
        if (assessmentIds.length) {
          this.offlineActivityProvider.findStudentActivityPerformanceSummary(
            userId,
            classId,
            assessmentIds,
            ASSESSMENT,
            activityMinDate,
            activityMaxDate
          ).then(performance => {
            this.normalizePerformanceSummary(performance, activityList);
          }, reject);
        }
        if (offlineActivityIds.length) {
          this.offlineActivityProvider.fetchStudentOfflineActivitiesPerformance(
            classId,
            offlineActivityIds,
            userId).then(performance => {
              this.normalizeOfflineClassActivityPerformanceSummary(performance, activityList);
            }, reject);
        }
        resolve(activityList);
      }, reject);
    });
  }

  /**
   * This method is used to get max date of activity
   * @param {activityList}
   */
  private getMaxDateOfActivity(activities) {
    const sortedActivities = activities.sort((a, b) => {
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });
    return sortedActivities.length ? sortedActivities[0].endDate : null;
  }

  /**
   * This method is used to get min date of activity
   * @param {activityList}
   */
  private getMinDateOfActivity(activities) {
    const sortedActivities = activities.sort((a, b) => {
      return new Date(a.activationDate).getTime() - new Date(b.activationDate).getTime();
    });
    return sortedActivities.length ? sortedActivities[0].activationDate : null;
  }

  /**
   * This method is used to get the ids of offline activity
   * @param {activityList}
   * @return {ids}
   */
  private getOfflineClassActivityIds(activityList) {
    const offlineActivityIds = [];
    activityList.forEach(activity => {
      if (activity.contentType === OFFLINE_ACTIVITY && activity.isCompleted === true) {
        offlineActivityIds.push(activity.id);
      }
    });
    return offlineActivityIds;
  }

  /**
   * this method is used to get the ids of activity
   * @param {activityList}
   * @return {ids}
   */
  private getClassActivitiesIds(activityList, contentType, externalContentType) {
    const collections = activityList.filter((item) => item.contentType === contentType || item.contentType === externalContentType);
    const activityIds = collections.map((item) => item.collection.id);
    return activityIds;
  }

  /**
   * Normalize activity performance
   * @param {performanceSummary,activityList}
   * @return {performance}
   */
  private normalizePerformanceSummary(performanceSummary, activityList) {
    performanceSummary.forEach((performance) => {
      const activity = activityList.find((item) => {
        // TEMP: Handled the activity performance based on the date.
        const activationDate = item.activationDate;
        const endDate = moment(item.endDate);
        const playedDate = performance.activation_date;
        const isStartDateSameOrBefore = moment(playedDate).isSameOrBefore(activationDate, 'day');
        const isEndDateSameOrAfter = endDate.isSameOrAfter(playedDate, 'day');
        return ((isStartDateSameOrBefore || isEndDateSameOrAfter)
          && (item.collection.id === performance.collectionPerformanceSummary.collectionId)
          && !item.collection.performance);
      });
      if (activity) {
        activity.collection.performance = performance.collectionPerformanceSummary;
      }
    });
  }

  /**
   * Normalize offline activity performance
   * @param {performanceSummary,activityList}
   * @return {performance}
   */
  private normalizeOfflineClassActivityPerformanceSummary(performanceSummary, activityList) {
    performanceSummary.forEach(performance => {
      const activity = activityList.find((item) => {
        return item.id === performance.dcaContentId;
      });
      if (activity) {
        activity.collection.performance = performance.collectionPerformanceSummary;
      }
    });
  }

  /**
   * Retrieve the student grade list
   * @param {string}classId
   * @param {string}userId
   * @return {GradeList}
   */
  public fetchGradeList(classId, userId) {
    return this.classActivityProvider.fetchGradeList(classId, userId).then((gradeList) => {
      return gradeList;
    });
  }

  /**
   * Retrieve the grade details
   * @param {grade}
   * @param {string}userId
   * @return {GradeDetails}
   */
  public fetchGradeDetails(grade, classId, userId) {
    return this.offlineActivityProvider.fetchOaGradeActivity(grade.collectionId).then((oaGradeList) => {
      const gradeDetails = this.normalizeGradeItem(grade, oaGradeList, classId);
      return gradeDetails;
    });
  }

  /**
   * @function fetchOaSubmissions
   * This method is used to fetch fetch oa submissions
   */
  public fetchOaSubmissions(classId, dcaContentId, userId) {
    return this.offlineActivityProvider.fetchOaSubmissions(classId, dcaContentId).then(oaSubmitedData => {
      return oaSubmitedData;
    });
  }

  /**
   * Normalize grade item
   * @param {grade}
   * @param {content}
   * @param {string} classId
   * @return {performance}
   */
  private normalizeGradeItem(grade, content, classId) {
    const collectionId = grade.collectionId;
    const contentType = grade.collectionType;
    const dcaContentId = grade.dcaContentId;
    return {
      classId,
      dcaContentId,
      content,
      contentType,
      collectionId
    };
  }

  /**
   * @function setSuggestionToCA
   * This method is used to set suggestion to class activity
   */
  public setSuggestionToCA(classId, classActivities, detail) {
    const caIds = classActivities.map((item) => item.id);
    return this.suggestionProvider.fetchClassActivitySuggestion(classId, caIds, detail).then((caSuggestionList) => {
      classActivities.forEach((classActivity) => {
        const caSuggestion = caSuggestionList.find((suggestion) => suggestion.caId === classActivity.id);
        if (caSuggestion) {
          classActivity.suggestion = caSuggestion;
        }
      });
      if (detail) {
        const suggestions = classActivities[0].suggestion.suggestedContents;
        this.performanceService.fetchCASuggestionPerformance(suggestions, classId);
      }
    });
  }
}
