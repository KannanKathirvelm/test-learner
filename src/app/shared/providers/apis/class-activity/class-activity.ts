import { Injectable } from '@angular/core';
import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL,
  COLLECTION, COLLECTION_EXTERNAL,
  DEFAULT_IMAGES,
  OFFLINE_ACTIVITY
} from '@shared/constants/helper-constants';
import { ClassActivity, Collection } from '@shared/models/class-activity/class-activity';
import { GradeItemsModel } from '@shared/models/grade-items/grade-items';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})

export class ClassActivityProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v2/classes';
  private gradeNamespace = 'api/nucleus-insights/v2';
  private rubricNameSpace = 'api/nucleus-insights/v2/rubrics';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private sessionService: SessionService,
    private httpService: HttpService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCourseList
   * @returns {CourseModel}
   * This method is used to fetch the course list
   */
  public fetchClassActivityList(classId, startDate, endDate): Promise<Array<ClassActivity>> {
    const endpoint = `${this.namespace}/${classId}/contents/scheduled`;
    const param = {
      content_type: 'collection,assessment,offline-activity',
      start_date: startDate,
      end_date: endDate
    };
    return this.httpService.get(endpoint, param).then((res) => {
      return res.data.class_contents.map((activity) => {
        return this.normalizeClassActivity(activity, classId);
      });
    });
  }


  public submitOAGrade(oaRubric) {
    const endpoint = `${this.rubricNameSpace}/grades/collections`;
    return this.httpService.post(endpoint, oaRubric);
  }

  /**
   * @function fetchGradeList
   * @returns {GradeModel}
   * This method is used to fetch the course list
   */
  public fetchGradeList(classId, userId): Promise<Array<GradeItemsModel>> {
    const endpoint = `${this.gradeNamespace}/rubrics/items`;
    const param = {
      classId,
      userId
    };
    return this.httpService.get(endpoint, param).then((res) => {
      return res.data.gradeItems.map((grade) => {
        return this.normalizeGradeActivity(grade);
      });
    });
  }

  /**
   * Normalizes a grade activity
   * @return {gradeActivity}
   */
  public normalizeGradeActivity(data) {
    const gradeItem = {
      title: data.title,
      collectionId: data.collectionId,
      collectionType: data.collectionType,
      dcaContentId: data.dcaContentId,
      studentCount: data.studentCount
    };
    return gradeItem;
  }

  /**
   * this method is used to normalize the class activity
   * @function normalizeClassActivity
   */
  private normalizeClassActivity(payload, classId): ClassActivity {
    const path = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const activity: ClassActivity = {
      id: payload.id,
      classId: payload.class_id || classId,
      addedDate: payload.dca_added_date,
      activationDate: payload.activation_date,
      endDate: payload.end_date,
      collection: this.normalizeClassActivityCollection(payload, path),
      forYear: payload.for_year,
      contentId: payload.content_id,
      contentType: payload.content_type,
      forMonth: payload.for_month,
      isCompleted: payload.is_completed,
      questionCount: payload.question_count || 0,
      resourceCount: payload.resource_count || 0,
      taskCount: payload.task_count || 0,
      meeting_endtime: payload.meeting_endtime,
      meeting_starttime: payload.meeting_starttime,
      meeting_timezone: payload.meeting_timezone,
      meeting_url: payload.meeting_url,
      url: payload.url,
      title: payload.title,
      usersCount: payload.users_count,
      thumbnail: payload.thumbnail ? path + payload.thumbnail : null,
      allowMasteryAccrual: payload.allow_mastery_accrual
    };
    return activity;
  }

  private normalizeClassActivityCollection(payload, basePath): Collection {
    const contentType = payload.content_type;
    if (contentType === ASSESSMENT) {
      const assessmentModel = {
        id: payload.content_id,
        title: payload.title,
        url: payload.url,
        description: payload.learning_objective,
        resourceCount: payload.resource_count || 0,
        questionCount: payload.question_count || 0,
        oeQuestionCount: payload.oe_question_count || 0,
        collectionType: payload.content_type,
        format: payload.content_type,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: DEFAULT_IMAGES.ASSESSMENT,
        taskCount: payload.task_count
      };
      return assessmentModel;
    }
    if (contentType === COLLECTION) {
      const collectionModel = {
        id: payload.content_id,
        title: payload.title,
        url: payload.url,
        resourceCount: payload.resource_count,
        questionCount: payload.question_count,
        collectionType: payload.content_type,
        format: payload.content_type,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: DEFAULT_IMAGES.COLLECTION
      };
      return collectionModel;
    }
    if (contentType === OFFLINE_ACTIVITY) {
      const offlineActivity = {
        id: payload.content_id,
        title: payload.title,
        collectionType: payload.content_type,
        url: payload.url,
        format: payload.content_type,
        taskCount: payload.task_count || 0,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: DEFAULT_IMAGES.OFFLINE_ACTIVITY
      };
      return offlineActivity;
    }
    if (contentType === ASSESSMENT_EXTERNAL || contentType === COLLECTION_EXTERNAL) {
      const externalCollectionModel = {
        id: payload.content_id,
        title: payload.title,
        collectionType: payload.content_type,
        url: payload.url,
        format: payload.content_type,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: contentType === ASSESSMENT_EXTERNAL ? DEFAULT_IMAGES.ASSESSMENT
          : DEFAULT_IMAGES.COLLECTION
      };
      return externalCollectionModel;
    }
  }
}
