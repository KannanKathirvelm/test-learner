import { Injectable } from '@angular/core';
import {
  DEFAULT_IMAGES,
  OA,
  OA_TASK_SUBMISSION_TYPES, OFFLINE_ACTIVITY,
  ROLES,
  RUBRIC,
  SUBMISSION_TYPES
} from '@shared/constants/helper-constants';
import { GradeItemDeatilsModel, SubmissionModel, SubmissionsModel } from '@shared/models/offline-activity/offline-activity';
import { HttpService } from '@shared/providers/apis/http';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { SessionService } from '@shared/providers/service/session/session.service';
import { addHttpsProtocol, calculateAverageScore } from '@shared/utils/global';

@Injectable({
  providedIn: 'root'
})

export class OfflineActivityProvider {

  // -------------------------------------------------------------------------
  // Properties

  private oaNamespace = 'api/nucleus/v2/oa';
  private caNamespace = 'api/nucleus-insights/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private sessionService: SessionService,
    private performanceProvider: PerformanceProvider,
    private taxonomyProvider: TaxonomyProvider,
    private httpService: HttpService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchOaGradeActivity
   * This method is used to fetch the course list
   */
  public fetchOaSubmissions(classId, activityId, dataParam?): Promise<SubmissionsModel> {
    const userId = this.sessionService.userSession.user_id;
    let endpoint = this.caNamespace;
    if (!dataParam) {
      endpoint += '/dca';
    }
    endpoint += `/class/${classId}/oa/${activityId}/student/${userId}/submissions`;
    return new Promise((resolve, reject) => {
      this.httpService.get(endpoint, dataParam).then((res) => {
        const oaSubmitedData = res.data;
        const parseData: SubmissionsModel = {
          tasks: [],
          oaRubrics: this.normalizeOaRubrics(oaSubmitedData.oaRubrics)
        };
        if (oaSubmitedData.tasks && oaSubmitedData.tasks.length) {
          const normalizedSubmissions = this.normalizeOaSubmissions(oaSubmitedData);
          parseData.tasks = normalizedSubmissions.map((task) => {
            const filteredData: SubmissionModel[] = [];
            SUBMISSION_TYPES.forEach((type) => {
              const typeData = task.filter((submission) => {
                return submission.submissionType === type;
              });
              typeData.type = type;
              let submissionKey = type;
              submissionKey = type === OA.FREE_FORM_TEXT ? OA.FORM_TEXT : type;
              filteredData[submissionKey] = typeData;
              return filteredData;
            });
            const submissions = {
              submissions: filteredData,
              taskId: task.taskId
            };
            return submissions;
          });
        }
        resolve(parseData);
      }, reject);
    });
  }

  /**
   * Normalize offline activity oa rubrics
   * @return {oaRubricsData}
   */
  private normalizeOaRubrics(oaRubricsData) {
    if (oaRubricsData.studentGrades) {
      const studentGrades = {
        categoryScore: oaRubricsData.studentGrades.categoryScore,
        grader: oaRubricsData.studentGrades.grader,
        maxScore: oaRubricsData.studentGrades.maxScore,
        overallComment: oaRubricsData.studentGrades.overallComment,
        rubricId: oaRubricsData.studentGrades.rubricId,
        studentScore: oaRubricsData.studentGrades.studentScore,
        scoreInPercentage: calculateAverageScore(Number(oaRubricsData.studentGrades.studentScore), Number(oaRubricsData.studentGrades.maxScore)),
        submittedOn: oaRubricsData.studentGrades.submittedOn,
        timeSpent: oaRubricsData.studentGrades.timeSpent
      };
      oaRubricsData.studentGrades = studentGrades;
    }
    if (oaRubricsData.teacherGrades) {
      const teacherGrades = {
        categoryScore: oaRubricsData.teacherGrades.categoryScore,
        grader: oaRubricsData.teacherGrades.grader,
        maxScore: oaRubricsData.teacherGrades.maxScore,
        overallComment: oaRubricsData.teacherGrades.overallComment,
        rubricId: oaRubricsData.teacherGrades.rubricId,
        studentScore: oaRubricsData.teacherGrades.studentScore,
        scoreInPercentage: calculateAverageScore(Number(oaRubricsData.teacherGrades.studentScore), Number(oaRubricsData.teacherGrades.maxScore)),
        submittedOn: oaRubricsData.teacherGrades.submittedOn,
        timeSpent: oaRubricsData.teacherGrades.timeSpent
      };
      oaRubricsData.teacherGrades = teacherGrades;
    }
    return oaRubricsData;
  }

  /**
   * Normalize offline activity performance
   * @return {submissions}
   */
  private normalizeOaSubmissions(oaSubmitedData) {
    const normalizeData = oaSubmitedData.tasks.map((data) => {
      const submissions = data.submissions.map((item) => {
        let submissionLocation = item.submissionInfo;
        if (item.submissionType === OA.UPLOADS) {
          const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
          submissionLocation = addHttpsProtocol(cdnUrl + item.submissionInfo, cdnUrl);
        }
        const submissionTypeData = OA_TASK_SUBMISSION_TYPES.find((oaTask) => {
          return oaTask.value === item.submissionSubtype;
        });
        const submissionIcon = submissionTypeData ? submissionTypeData.icon : null;
        return {
          submissionInfo: submissionLocation,
          submissionSubtype: item.submissionSubtype,
          submissionType: item.submissionType,
          submittedOn: item.submittedOn,
          submissionIcon
        };
      });
      submissions.taskId = data.taskId;
      return submissions;
    });
    return normalizeData;
  }

  /**
   * @function fetchOaGradeActivity
   * This method is used to fetch the course list
   */
  public fetchOaGradeActivity(activityId): Promise<GradeItemDeatilsModel> {
    const endpoint = `${this.oaNamespace}/${activityId}/detail`;
    return this.httpService.get(endpoint).then((res) => {
      return this.normalizeOaGradeActivity(res.data);
    });
  }

  /**
   * @function findStudentActivityPerformanceSummary
   * This method is used to fetch the performance for assessment and collection
   */
  public findStudentActivityPerformanceSummary(
    userId,
    classId,
    collectionIds,
    activityType,
    startDate,
    endDate) {
    const endpoint = `${this.caNamespace}/class/${classId}/activity`;
    const param = {
      userId,
      collectionType: activityType,
      startDate,
      endDate,
      collectionIds
    };
    return this.httpService.post(endpoint, param).then((res) => {
      return this.normalizeOAPerformance(res.data.usageData)[0];
    });
  }

  /**
   * @function fetchStudentOfflineActivitiesPerformance
   * This method is used to fetch the performance for offline activity
   */
  public fetchStudentOfflineActivitiesPerformance(
    classId,
    classActivityIds,
    userId) {
    const endpoint = `${this.caNamespace}/class/${classId}/activity`;
    const param = {
      dcaContentIds: classActivityIds,
      collectionType: OFFLINE_ACTIVITY,
      userId
    };
    return this.httpService.post(endpoint, param).then((res) => {
      return this.normalizeOAPerformance(res.data.usageData)[0];
    });
  }

  /**
   * @function markCompleted
   * Method to mark offline activity status as completed
   */
  public markCompleted(requestPayload) {
    const endpoint = `${this.caNamespace}/oa/complete`;
    return this.httpService.post(endpoint, JSON.stringify(requestPayload));
  }

  /**
   * @function getCompletedStudents
   * Method to get list of students who have marked the activity as completed
   */
  public getCompletedStudents(classId, oaId, itemId, dataParam): Promise<void | string[]> {
    const caCompletedListUrl = `/dca/class/${classId}/oa/${oaId}/item/${itemId}/students`;
    const cmCompletedListUrl = `/class/${classId}/oa/${oaId}/students`;
    const endpoint = `${this.caNamespace}${itemId ? caCompletedListUrl : cmCompletedListUrl}`;
    return this.httpService.get(endpoint, dataParam).then((response) => {
      return response.data.students;
    });
  }

  /**
   * normalizeOAPerformance
   * @return {CAperformance}
   */
  public normalizeOAPerformance(payload) {
    return payload.map((activitySummary) => {
      const userId = activitySummary.userId;
      const activitiesData = activitySummary.activity || [];
      return activitiesData.map((activity) => {
        return this.normalizeOAPerformanceSummary(userId, activity);
      });
    });
  }

  /**
   * Normalize offline activity performance
   * @return {performance}
   */
  private normalizeOAPerformanceSummary(userId, activity) {
    return {
      userId,
      date: activity.date ? activity.date : null,
      activation_date: activity.date ? activity.date : null,
      dcaContentId: activity.dcaContentId || null,
      collectionPerformanceSummary:
        this.normalizeCollectionPerformanceSummary(activity)
    };
  }

  /**
   * Normalize collection performance
   * @return {performance}
   */
  private normalizeCollectionPerformanceSummary(activity) {
    return {
      id: activity.collectionId || activity.collection_id,
      collectionId: activity.collectionId || activity.collection_id,
      timeSpent: activity.timeSpent,
      attempts: activity.attempts,
      pathId: activity.pathId,
      views: activity.views,
      score: activity.scoreInPercentage,
      sessionId: activity.lastSessionId || activity.sessionId,
      status: activity.status
    };
  }

  /**
   * this method is used to normalize the activity data
   * @returns {activityData}
   */
  public normalizeOaGradeActivity(activityData) {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = activityData.thumbnail
      ? cdnUrl + activityData.thumbnail
      : DEFAULT_IMAGES.OFFLINE_ACTIVITY;
    const settings = activityData.setting || {};
    const rubric = this.performanceProvider.normalizeActivityRubric(activityData.rubrics);
    const teacherRubric = rubric.find((item) => {
      return item.gradeType === RUBRIC.TEACHER;
    });
    const studentRubric = rubric.find((item) => {
      return item.gradeType === RUBRIC.STUDENT;
    });
    const normalizedActivity: GradeItemDeatilsModel = {
      id:
        activityData.target_collection_id ||
        activityData.suggested_content_id ||
        activityData.id,
      pathId: activityData.id,
      title: activityData.title,
      learningObjectives: activityData.learning_objective,
      isVisibleOnProfile:
        activityData.visible_on_profile !== 'undefined'
          ? activityData.visible_on_profile
          : true,
      tasks: this.normalizeTasks(activityData.oa_tasks),
      taskCount: activityData.oa_tasks ? activityData.oa_tasks.length : 0,

      sequence: activityData.sequence_id,
      thumbnailUrl,

      classroom_play_enabled:
        settings.classroom_play_enabled !== undefined
          ? settings.classroom_play_enabled
          : true,
      standards: this
        .taxonomyProvider
        .normalizeTaxonomy(activityData.taxonomy),
      format:
        activityData.format ||
        activityData.target_content_type ||
        activityData.suggested_content_type ||
        OFFLINE_ACTIVITY,
      subFormat: activityData.subformat,
      reference: activityData.reference,
      exemplar: activityData.exemplar,
      references: this.normalizeReferences(activityData.oa_references),
      teacherRubric,
      studentRubric,
      url: activityData.url,
      ownerId: activityData.owner_id,
      courseId:
        activityData.target_course_id ||
        activityData.suggested_course_id ||
        activityData.course_id,
      unitId:
        activityData.target_unit_id ||
        activityData.suggested_unit_id ||
        activityData.unit_id,
      lessonId:
        activityData.target_lesson_id ||
        activityData.suggested_lesson_id ||
        activityData.lesson_id,
      collectionSubType:
        activityData.target_content_subtype ||
        activityData.suggested_content_subtype,
      attempts: settings.attempts_allowed || -1,
      bidirectional: settings.bidirectional_play || false,
      showFeedback: settings.show_feedback || '',
      showKey: settings.show_key === '',
      authorEtlSecs: activityData.author_etl_secs || 0,
      maxScore: activityData.max_score || 1
    };
    return normalizedActivity;
  }

  /**
   * this method is used to normalize the activity references
   * @returns {reference}
   */
  public normalizeReferences(payload) {
    if (payload) {
      const studentReferences = payload.filter((item) => item.oa_reference_usertype === ROLES.STUDENT);
      return studentReferences.map((item) => {
        return this.normalizeReadReferences(item);
      });
    }
    return [];
  }

  /**
   * this method is used to normalize the activity reference
   * @param item
   * @returns {reference}
   */
  public normalizeReadReferences(item) {
    return {
      id: item.id,
      oaId: item.oa_id,
      type: item.oa_reference_type,
      subType: item.oa_reference_subtype,
      location: addHttpsProtocol(item.location),
      name: item.oa_reference_name
    };
  }

  /**
   * this method is used to normalize the tasks
   * @returns {tasks}
   */
  public normalizeTasks(payload) {
    if (payload) {
      const taskArray = payload.map((item) => {
        return this.normalizeReadTask(item);
      });
      return taskArray.sort((a, b) => a.id - b.id);
    }
    return [];
  }

  /**
   * Normalize the task data
   * @returns {task}
   */
  public normalizeReadTask(item) {
    return {
      id: item.id,
      oaId: item.oa_id,
      title: item.title,
      description: item.description,
      oaTaskSubmissions: this.normalizeSubmissions(item.oa_tasks_submissions),
      submissionCount: item.oa_tasks_submissions
        ? item.oa_tasks_submissions.length
        : 0
    };
  }

  /**
   * Normalize the submissions
   * @param payload
   * @returns {submissions}
   */
  public normalizeSubmissions(payload) {
    if (payload) {
      return payload.map((item) => {
        return this.normalizeReadSubmissions(item);
      });
    }
    return [];
  }

  /**
   * Normalize the submission
   * @returns {submission}
   */
  public normalizeReadSubmissions(item) {
    return {
      id: item.id,
      oaTaskId: item.oa_task_id,
      taskSubmissionType: item.oa_task_submission_type,
      taskSubmissionSubType: item.oa_task_submission_subtype
    };
  }
}
