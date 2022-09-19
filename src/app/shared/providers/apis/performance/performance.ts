import { Injectable } from '@angular/core';
import {
  MasteredStatsModel,
  StreakStatsModel,
  StudentClassReportModel,
  StudentDatewiseDataModel,
  StudentDatewiseTimespentModel,
  StudentDetailModel,
  StudentOverallCompetenciesModel,
  StudentsReportModel,
  StudentsTimeSpentModel,
  SuggestionStatsModel,
  TimespentModel} from '@app/shared/models/class-progress/class-progress';
import { environment } from '@environment/environment';
import { ASSESSMENT, ATTEMP_STATUS, COMPETENCY_STATUS_VALUE, DIAGNOSTIC_STATUS, GUT, NO_PROFILE } from '@shared/constants/helper-constants';
import { CollectionSessionModel } from '@shared/models/analytics/analytics';
import {
  AnalyticsModel,
  CAPerformanceModel,
  ClassLessonStatsModel,
  ClassTimeSpentModel,
  CollectionPerformanceUsageDataModel,
  EvidenceModel,
  LessonPerformanceUsageDataModel,
  MilestonePerformanceModel,
  PerformanceModel,
  PerformancesModel,
  UnitLessonPerformance,
  UnitPerformance
} from '@shared/models/performance/performance';
import { PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { calculateAverageScore, calculatePercentage } from '@shared/utils/global';

@Injectable({
  providedIn: 'root'
})

export class PerformanceProvider {

  // -------------------------------------------------------------------------
  // Properties

  private performanceNamespace = 'api/nucleus-insights/v2';
  private dsUserNameSpace = 'api/ds/users/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetctClassTimespent
   * This method is used to fetch student's timespent in the class
   */
  public fetctClassTimespent(classIds, userId) {
    const endpoint = `${this.dsUserNameSpace}/stats/class/timespent`;
    const params = {
      classIds,
      userId
    };
    return this.httpService.post<ClassTimeSpentModel>(endpoint, params).then((res) => {
      const timeSpent = res.data;
      return timeSpent.data.map(timespentPayload => {
        return this.normalizeClassTimespent(timespentPayload);
      });
    });
  }

  /**
   * @function fetctClassLessonStats
   * This method is used to fetch the lessons completed for class
   */
  public fetctClassLessonStats(classIds, userId) {
    const endpoint = `${this.dsUserNameSpace}/stats/class/lesson`;
    const params = {
      classIds,
      userId
    };
    return this.httpService.post<ClassLessonStatsModel>(endpoint, params).then((res) => {
      const lessonStat = res.data;
      return lessonStat.data.map(lessonStatPayload => {
        return this.normalizeClassLessonStats(lessonStatPayload);
      });
    });
  }


  /**
   * @function getStreakStats
   * This method is used to get the streakstats
   */
  public getStreakStats(params) {
    const endpoint = `${this.dsUserNameSpace}/stats/class/streakcompetencies`;
    return this.httpService.post<StreakStatsModel>(endpoint, params).then((res) => {
      const streakStats = res.data;
      return streakStats.data.map(streakStatsPayload => {
        return this.normalizeStreakStats(streakStatsPayload);
      });
    });
  }

  /**
   * @function getSuggestionStats
   * This method is used to get the suggetionstats
   */
  public getSuggestionStats(params) {
    const endpoint = `${this.dsUserNameSpace}/stats/class/suggestions`;
    return this.httpService.post<SuggestionStatsModel>(endpoint, params).then((res) => {
      const suggestionStats = res.data;
      return suggestionStats.data.map(suggestionsStatsPayload => {
        return this.normalizeSuggestionStats(suggestionsStatsPayload);
      });
    });
  }

  /**
   * @function fetchMasteredStats
   * This method is used to fetch materedStats
   */
  public fetchMasteredStats(params) {
    const endpoint = `${this.dsUserNameSpace}/stats/class/competency/greaterthan90`;
    return this.httpService.post<MasteredStatsModel>(endpoint, params).then((res) => {
      const masteredStats = res.data;
      return masteredStats.data.map(masteredStatsPayload => {
        return this.normalizeMasteredStats(masteredStatsPayload);
      });
    });
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param timespentPayload is the endpoint response in JSON format
   * @returns {TimeSpent} a class timespent model object
   */
  private normalizeClassTimespent(timespentPayload) {
    const timeSpent: ClassTimeSpentModel = {
      classId: timespentPayload.class_id,
      totalTimespent: timespentPayload.total_timespent,
      collectionTimespent: timespentPayload.collection_timespent,
      assessmentTimespent: timespentPayload.assessment_timespent,
      caTimespent: timespentPayload.ca_timespent,
      ljTimespent: timespentPayload.lj_timespent,
      destinationEta: timespentPayload.destination_eta
    };
    return timeSpent;
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param lessonPayload is the endpoint response in JSON format
   * @returns {LessonStats} a class lesson stats model object
   */
  private normalizeClassLessonStats(lessonPayload) {
    const lessonStats: ClassLessonStatsModel = {
      classId: lessonPayload.class_id,
      completedLessons: lessonPayload.completed_lessons,
      totalLessons: lessonPayload.total_lessons,
      totalPercentage: calculatePercentage(lessonPayload.completed_lessons, lessonPayload.total_lessons)
    };
    return lessonStats;
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param streakPayload is the endpoint response in JSON format
   * @returns {StreakStatsModel} a class streak stats model object
   */
  private normalizeStreakStats(streakPayload) {
    const streakStats: StreakStatsModel = {
      classId: streakPayload.class_id,
      streakCompetencies: streakPayload.streak_competencies
    };
    return streakStats;
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param masteredPayload is the endpoint response in JSON format
   * @returns {MasteredStatsModel} a class mastered stats model object
   */
  private normalizeMasteredStats(masteredPayload) {
    const masteredStats: MasteredStatsModel = {
      classId: masteredPayload.class_id,
      completedCompetencies: masteredPayload.completed_competencies
    };
    return masteredStats;
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param suggestionStats is the endpoint response in JSON format
   * @returns {SuggestionStatsModel} a class suggestion stats model object
   */
  private normalizeSuggestionStats(suggestionStats) {
    const suggestions: SuggestionStatsModel = {
      classId: suggestionStats.class_id,
      acceptedSuggestions: suggestionStats.accepted_suggestions,
      totalSuggestions: suggestionStats.total_suggestions
    };
    return suggestions;
  }

  /**
   * @function fetchUserCurrentLocationByClassIds
   * This method is used to fetch the location by id
   */
  public fetchUserCurrentLocationByClassIds(classCourseIdsFwCode, userId): Promise<any> {
    const endpoint = `${this.performanceNamespace}/classes/location?userId=${userId}`;
    const paramsData = { classes: classCourseIdsFwCode };
    return this.httpService.post<AnalyticsModel>(endpoint, paramsData).then((res) => {
      const currentLocation = res.data;
      return currentLocation.usageData.map(locationPayload => {
        return this.normalizeCurrentLocation(locationPayload);
      });
    });
  }

  /**
   * @function fetchUserSessionIds
   * This Method is used to get list of session ids
   */
  public fetchUserSessionIds(contentType, assessmentId, context, openSession = false) {
    const endpoint = `${this.performanceNamespace}/${contentType}/${assessmentId}/sessions`;
    const userId = this.sessionService.userSession.user_id;
    const paramsData = {
      userUid: userId,
      classGooruId: context.classId,
      courseGooruId: context.courseId,
      unitGooruId: context.unitId,
      lessonGooruId: context.lessonId,
      openSession
    };
    return this.httpService.get(endpoint, paramsData).then((response) => {
      return response.data.content.map((item) => {
        const session: CollectionSessionModel = {
          eventTime: item.eventTime,
          sequence: Number(item.sequence),
          sessionId: item.sessionId
        };
        return session;
      });
    });
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param locationPayload is the endpoint response in JSON format
   * @returns {CurrentLocation} a current location model object
   */
  private normalizeCurrentLocation(locationPayload) {
    const currentLocation = {
      classId: locationPayload.classId,
      courseId: locationPayload.courseId,
      unitId: locationPayload.unitId,
      lessonId: locationPayload.lessonId,
      collectionId: locationPayload.collectionId
        ? locationPayload.collectionId
        : locationPayload.assessmentId,
      collectionType: locationPayload.collectionType
        ? locationPayload.collectionType
        : locationPayload.collectionId
          ? 'collection'
          : 'assessment',
      status: locationPayload.status,
      pathId: locationPayload.pathId || 0,
      pathType: locationPayload.pathType || null,
      ctxPathId: locationPayload.ctxPathId || 0,
      ctxPathType: locationPayload.ctxPathType || null,
      scoreInPercentage: locationPayload.scoreInPercentage || null,
      collectionTitle:
        locationPayload.collectionTitle || locationPayload.assessmentTitle,
      milestoneId: locationPayload.milestoneId || null
    };
    return currentLocation;
  }

  /**
   * Fetch class performance
   */
  public fetchClassPerformance(classCourseIds) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/classes/performance?userId=${userId}`;
    const param = JSON.stringify({
      classes: classCourseIds
    });
    return this.httpService.post<PerformanceModel>(endpoint, param).then((res) => {
      const response = res.data;
      return response.usageData.map((classPerformanceSummary) => {
        return this.normalizeClassPerformanceSummary(classPerformanceSummary);
      });
    });
  }

  /**
   * Fetch dca collections performance
   */
  public fetchDCACollectionPerformance(collectionType, collectionId, params) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/dca/${collectionType}/${collectionId}/user/${userId}`;
    return this.httpService.get<PortfolioPerformanceSummaryModel>(endpoint, params).then((response) => {
      return this.normalizeActivitySummary(response.data.content[0], collectionType);
    });
  }

  /**
   * Fetch collection performance based on context
   */
  public fetchCollectionPerformanceByContext(contentId, collectionType, params) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/${collectionType}/${contentId}/user/${userId}`;
    return this.httpService.get<PortfolioPerformanceSummaryModel>(endpoint, params).then((response) => {
      return this.normalizeActivitySummary(response.data.content[0], collectionType);
    });
  }

  /**
   * @function fetchCAPerformance
   * Fetch Performance of Class Activities
   */
  public fetchCAPerformance(classIds) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/dca/classes/performance`;
    const param = JSON.stringify({
      classIds,
      userId
    });
    return this.httpService.post<Array<CAPerformanceModel>>(endpoint, param).then((res) => {
      return this.normalizeCAPerformance(res.data);
    });
  }

  /**
   * Normalizes a rubric activities
   */
  public normalizeActivityRubric(activities) {
    return activities.map((activity) => {
      return this.normalizeRubric(activity);
    });
  }

  private normalizeRubric(data) {
    const metadata = data.metadata || null;
    const categories = data.categories;
    const basePath = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const thumbnail = data.thumbnail ? basePath + data.thumbnail : null;
    const url =
      data.url && !data.is_remote ? basePath + data.url : data.url || null;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      thumbnail,
      audience: metadata ? metadata.audience : null,
      url,
      isPublished: data.publishStatus === 'published',
      publishDate: data.publish_date ? data.publish_date : null,
      rubricOn: data.is_rubric,
      uploaded: !data.is_remote,
      feedback: data.feedback_guidance,
      requiresFeedback: data.overall_feedback_required,
      maxScore: data.max_score,
      increment: data.increment,
      scoring: data.scoring,
      categories: categories
        ? categories.map(category =>
          this.normalizeRubricCategory(category)
        )
        : [],
      createdDate: data.created_at,
      updatedDate: data.updated_at,
      tenant: data.tenant,
      gutCodes: data.gut_codes,
      modifierId: data.modifier_id,
      originalCreatorId: data.original_creator_id,
      originalRubricId: data.original_rubric_id,
      parentRubricId: data.parent_rubric_id,
      tenantRoor: data.tenant_root,
      grader: data.grader || null,
      gradeType: data.grader
    };
  }

  /**
   * Normalizes a rubric category
   */
  private normalizeRubricCategory(data) {
    const levels = [];
    if (data.levels) {
      data.levels.map((level) => {
        levels.push({
          name: level.level_name,
          score: Number(level.level_score),
          description: level.level_description
        });
      });
    }
    return {
      title: data.category_title,
      feedbackGuidance: data.feedback_guidance,
      requiresFeedback: data.required_feedback,
      allowsLevels: data.level === true,
      allowsScoring: data.scoring === true,
      levels: this.sortLevels(levels)
    };
  }


  /**
   * @function sortLevels
   * This method is used to sort the level score
   */
  private sortLevels(levels) {
    return levels.sort((a, b) => {
      return a.score - b.score;
    });
  }

  /**
   * Normalize class CA performance
   */
  private normalizeCAPerformance(payload): Array<CAPerformanceModel> {
    return payload.usageData.map((caPerformance) => {
      const performanceModel: CAPerformanceModel = {
        classId: caPerformance.classId,
        completedCount: caPerformance.completedCount,
        scoreInPercentage: caPerformance.scoreInPercentage
      };
      return performanceModel;
    });
  }

  /**
   * Normalize class performance
   * @param {performance} payload
   * @return {performance}
   */
  private normalizeClassPerformanceSummary(payload): PerformanceModel {
    return {
      id: payload.classId,
      classId: payload.classId,
      timeSpent: payload.timeSpent,
      score: payload.scoreInPercentage,
      sessionId: payload.lastSessionId,
      totalCompleted: payload.completedCount,
      total:
        payload.totalCount ||
        payload.completedCount
    };
  }

  /**
   * @function fetchMilestonePerformance
   * Fetch performance of milestone
   */
  public fetchMilestonePerformance(classId: string, courseId: string, fwCode: string, collectionType?: string) {
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/milestone/performance`;
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      collectionType: collectionType ? collectionType : ASSESSMENT,
      userUid: userId,
      fwCode: fwCode || GUT
    };
    return this.httpService.get(endpoint, postData).then((res: any) => {
      const response = res.data;
      return response.content.map((milestonePerformanceSummary) => {
        const performanceDetails = {
          milestoneId: milestonePerformanceSummary.milestoneId,
          usageData: this.normalizeMilestonePerformance(milestonePerformanceSummary.usageData)
        };
        return performanceDetails;
      });
    });
  }
  /**
   * Normalize class CA performance
   * @param {MilestonePerformance} payload
   * @return {MilestonePerformance}
   */
  private normalizeMilestonePerformance(payload): Array<MilestonePerformanceModel> {
    return payload.map((milestonePerformance) => {
      const completedCount = milestonePerformance.completedCount ? milestonePerformance.completedCount : 0;
      const totalCount = milestonePerformance.totalCount ? milestonePerformance.totalCount : 0;
      const performanceModel: MilestonePerformanceModel = {
        attempts: milestonePerformance.attempts,
        completedCount,
        reaction: milestonePerformance.reaction,
        scoreInPercentage: milestonePerformance.scoreInPercentage,
        timeSpent: milestonePerformance.timeSpent,
        totalCount,
        completedInPrecentage: Math.round((completedCount / totalCount) * 100)
      };
      return performanceModel;
    });
  }

  /**
   * @function fetchLessonPerformance
   * Fetch performance of milestone lesson
   */
  public fetchLessonPerformance(classId: string, courseId: string, milestoneId: string, fwCode: string, collectionType: string) {
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/milestone/${milestoneId}/performance`;
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      collectionType, userUid: userId,
      fwCode
    };
    return this.httpService.get(endpoint, postData).then((res) => {
      const response = res.data;
      return response.content.map((lessonPerformanceSummary) => {
        const performanceDetails = {
          usageData: this.normalizeLessonPerformance(lessonPerformanceSummary.usageData)
        };
        return performanceDetails;
      });
    });
  }

  /**
   * Normalize class Lesson performance
   * @param {LessonPerformance} payload
   * @return {LessonPerformance}
   */
  private normalizeLessonPerformance(payload): Array<LessonPerformanceUsageDataModel> {
    return payload.map((lessonPerformance) => {
      const performanceModel: LessonPerformanceUsageDataModel = {
        attempts: lessonPerformance.attempts,
        completedCount: lessonPerformance.completedCount,
        lessonId: lessonPerformance.lessonId,
        reaction: lessonPerformance.reaction,
        scoreInPercentage: lessonPerformance.scoreInPercentage,
        timeSpent: lessonPerformance.timeSpent,
        totalCount: lessonPerformance.totalCount,
        unitId: lessonPerformance.unitId
      };
      return performanceModel;
    });
  }


  /**
   * @function fetchCollectionPerformance
   * performance Data of milestone
   */
  public fetchCollectionPerformance(classId: string, courseId: string, lessonId: string, unitId: string, format: string) {
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/unit/${unitId}/lesson/${lessonId}/performance`;
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      collectionType: format,
      userUid: userId
    };
    return this.httpService.get(endpoint, postData).then((res) => {
      const content = res.data.content[0];
      return {
        usageData: this.normalizeCollectionPerformance(content.usageData) || []
      };
    });
  }

  /**
   * Normalize class Lesson performance
   */
  private normalizeCollectionPerformance(payload): Array<CollectionPerformanceUsageDataModel> {
    return payload.map((collectionPerformance) => {
      const performanceModel: CollectionPerformanceUsageDataModel = {
        attemptStatus: collectionPerformance.attemptStatus,
        collectionId: collectionPerformance.collectionId ||
          collectionPerformance.assessmentId,
        completedCount: collectionPerformance.completedCount,
        gradingStatus: collectionPerformance.gradingStatus,
        reaction: collectionPerformance.reaction,
        scoreInPercentage: collectionPerformance.scoreInPercentage,
        score: collectionPerformance.scoreInPercentage,
        timeSpent: collectionPerformance.timeSpent,
        totalCount: collectionPerformance.totalCount,
        views: collectionPerformance.views
      };
      return performanceModel;
    });
  }

  /**
   * @function fetchActivitySummary
   * Fetch performance summary based on content source and sessionId
   */
  public fetchActivitySummary(contentType, itemId, sessionId, contentSource) {
    const endpoint = `${this.dsUserNameSpace}/content/portfolio/${contentType}/summary`;
    const userId = this.sessionService.userSession.user_id;
    const paramsData = {
      userId,
      itemId,
      sessionId,
      contentSource
    };
    return this.httpService.get<PortfolioPerformanceSummaryModel>(endpoint, paramsData).then((response) => {
      return this.normalizeActivitySummary(response.data.content, contentType);
    });
  }

  /**
   * @function normalizeActivitySummary
   * Normalize activity summary
   */
  public normalizeActivitySummary(payload, contentType) {
    const content = payload[contentType];
    const subContents = payload.resources || payload.questions;
    const subType = contentType === ASSESSMENT ? 'questions' : 'resources';
    const result: PortfolioPerformanceSummaryModel = {
      [contentType]: {
        eventTime: content ? content.eventTime : null,
        id: content ? content.id || content.collectionId : null,
        reaction: content ? content.reaction : null,
        score: content ? Math.round(content.score) : null,
        timespent: content ? content.timespent || content.timeSpent : null,
        type: content ? content.type : null,
        sessionId: content ? content.sessionId : null
      },
      [subType]: subContents ? this.normalizeSubFormatContent(subContents, contentType) : null,
    };
    return result;
  }

  /**
   * @function normalizeSubFormatContent
   * Normalize subformat content object
   */
  private normalizeSubFormatContent(subContents, contentType) {
    return subContents.map((subContent) => {
      const subQuestions = subContent.subQuestions || null;
      return {
        answerStatus: subContent.answerStatus,
        isSkipped: subContent.answerStatus === ATTEMP_STATUS.SKIPPED,
        answerObject: subContent.answerObject ? this.normalizeAnswerObject(subContent.answerObject) : null,
        eventTime: subContent.eventTime,
        id: subContent.id || subContent.resourceId || subContent.gooruOId,
        isGraded: subContent.isGraded,
        maxScore: subContent.maxScore,
        questionType: subContent.questionType,
        reaction: subContent.reaction,
        resourceType: subContent.resourceType,
        score: subContent.score,
        percentScore: subContent.percentScore,
        timespent: subContent.timespent || subContent.timeSpent,
        title: subContent.title,
        averageScore: this.calculateAverageScore(subContent, contentType),
        subQuestions: subQuestions ? this.normalizeSubFormatContent(subQuestions, contentType) : null,
        evidence: subContent.evidence ? this.normalizeEvidence(subContent.evidence) : null
      };
    });
  }

  /**
   * @function normalizeEvidence
   * Normalize evidence content object
   */
  private normalizeEvidence(evidenceList) {
    const environmentCdnUrl = environment.CDN_URL + '/';
    const cdnUrl = this.sessionService.userSession.cdn_urls ? this.sessionService.userSession.cdn_urls.content_cdn_url : environmentCdnUrl;
    return evidenceList.map((evidence) => {
      const evidenceItem: EvidenceModel = {
        filename: evidence.filename,
        originalFilename: evidence.original_filename,
        url: evidence.url ? evidence.url : cdnUrl + evidence.filename
      };
      return evidenceItem;
    });
  }

  /**
   * @function calculateAverageScore
   * calculate average score
   */
  private calculateAverageScore(content, contentType) {
    return content.answerStatus !== ATTEMP_STATUS.SKIPPED
      ? content.score !== null && content.maxScore
        ? calculateAverageScore(content.score, content.maxScore)
        : content.score
      : null;
  }

  /**
   * @function normalizeAnswerObject
   * Normalize answer object
   */
  private normalizeAnswerObject(answers) {
    return answers.map((answer) => {
      return {
        answerId: answer.answerId,
        order: answer.order,
        skip: answer.skip,
        status: answer.status,
        answer_text: answer.text,
        timeStamp: answer.timeStamp
      };
    });
  }

  /**
   * @function fetchSuggestionCollectionPerformance
   * This method is used to fetch suggestion performance
   */
  public fetchSuggestionCollectionPerformance(pathId, collectionType, source, classId) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/suggestions/performance`;
    const params = {
      source,
      classId,
      userId,
      pathIds: pathId,
      collectionType
    };
    return this.httpService.post(endpoint, params).then((res) => {
      return res.data.content;
    });
  }


  /**
   * @function fetchUnitPerformance
   * Fetch Performance of units
   */
  public fetchUnitPerformance(classId, courseId) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/performance`;
    const param = {
      collectionType: ASSESSMENT,
      userUid: userId
    };
    return this.httpService.get<Array<UnitPerformance>>(endpoint, param).then((response) => {
      let unitPerformances = [];
      const content = response.data.content;
      content.map((performance) => {
        const normalizeUnitPerformances = this.normalizeUnitPerformance(performance.usageData);
        unitPerformances = normalizeUnitPerformances;
      });
      return unitPerformances;
    });
  }

  /**
   * @function fetchPerformance
   * @param {Performance} payload
   * Fetch Performance of units
   */
  public normalizeUnitPerformance(payload): Array<UnitPerformance> {
    return payload.map((item) => {
      const performance: UnitPerformance = {
        attemptStatus: item.attemptStatus,
        attempts: item.attempts,
        completedCount: item.completedCount,
        reaction: item.reaction,
        scoreInPercentage: item.scoreInPercentage,
        timeSpent: item.timeSpent,
        totalCount: item.totalCount,
        unitId: item.unitId
      };
      return performance;
    });
  }

  /**
   * @function fetchUnitLessonPerformance
   * This method is used to fetch unit lesson performance
   */
  public fetchUnitLessonPerformance(classId, courseId, unitId) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/unit/${unitId}/performance`;
    const params = {
      collectionType: ASSESSMENT,
      userUid: userId
    };
    return this.httpService.get<UnitLessonPerformance>(endpoint, params).then((response) => {
      let lessonPerformances = [];
      const content = response.data.content;
      content.map((performance) => {
        const normalizeLessonPerformances = this.normalizeUnitLessonPerformance(performance.usageData);
        lessonPerformances = normalizeLessonPerformances;
      });
      return lessonPerformances;
    });
  }

  /**
   * @function normalizeUnitLessonPerformance
   * @param {Performance} payload
   * Fetch Performance of unit lesson
   */
  public normalizeUnitLessonPerformance(payload): Array<UnitLessonPerformance> {
    return payload.map((item) => {
      const performance: UnitLessonPerformance = {
        attemptStatus: item.attemptStatus,
        attempts: item.attempts,
        completedCount: item.completedCount,
        reaction: item.reaction,
        scoreInPercentage: item.scoreInPercentage,
        timeSpent: item.timeSpent,
        totalCount: item.totalCount,
        lessonId: item.lessonId
      };
      return performance;
    });
  }

  /**
   * @function fetchStudentsSummaryReport
   * Method to fetch students summary report
   */
  public fetchStudentsSummaryReport(classId, param) {
    const endpoint = `${this.dsUserNameSpace}/class/${classId}/student/summary`;
    return this.httpService.get<StudentsReportModel>(endpoint, param).then((response) => {
      return this.normalizeStudentsSummaryReport(response.data);
    });
  }

  /**
   * @function normalizeStudentsSummaryReport
   * Method to normalize students summary report data
   */
  public normalizeStudentsSummaryReport(payload) {
    const studentsSummaryData = payload.students;
    const serializedStudentsSumaryReportData = studentsSummaryData.map(studentSummaryData => {
      const normalizedStudentData = this.normalizeStudentSummaryItem(
        studentSummaryData.student
      );
      const normalizedSummaryData = this.normalizeSummaryData(
        studentSummaryData.summaryData
      );
      return {
          student: normalizedStudentData,
          summaryData: normalizedSummaryData
        };
    });
    return {
      class: payload.class,
      course: payload.course,
      studentsSummaryData: serializedStudentsSumaryReportData,
      teacher: payload.teacher
    } as StudentsReportModel;
  }


  /**
   * @function normalizeStudentSummaryItem
   * Method to serialize student's profile data
   */
  public normalizeStudentSummaryItem(studentData) {
    const thumbnailUrl =
      studentData.profileImage || NO_PROFILE;
    return {
      email: studentData.email,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      fullName: `${studentData.lastName}, ${studentData.firstName}`,
      id: studentData.id,
      thumbnailUrl
    } as StudentDetailModel;
  }

  /**
   * @function serializeSummaryData
   * Method to serialize student's summary data
   */
  public normalizeSummaryData(summaryData) {
    let serializedSummaryData = {};
    if (summaryData) {
      serializedSummaryData = {
        masteredCompetencies: this.serializeCompetencies(
          summaryData.mastered,
          COMPETENCY_STATUS_VALUE.DEMONSTRATED
        ),
        completedCompetencies: this.serializeCompetencies(
          summaryData.completed,
          COMPETENCY_STATUS_VALUE.EARNED
        ),
        inferredCompetencies: this.serializeCompetencies(
          summaryData.inferred,
          COMPETENCY_STATUS_VALUE.INFERRED
        ),
        reInforcedCompetencies: this.serializeCompetencies(
          summaryData.reinforcedMastery,
          COMPETENCY_STATUS_VALUE.REINFERRED
        ),
        inprogressCompetencies: this.serializeCompetencies(
          summaryData.inprogress,
          COMPETENCY_STATUS_VALUE.IN_PROGRESS
        ),
        interactionData: {
          assessmentData: this.serializeInteraction(
            summaryData.interactions
              ? summaryData.interactions.assessment
              : null
          ),
          collectionData: this.serializeInteraction(
            summaryData.interactions
              ? summaryData.interactions.collection
              : null
          )
        },
        suggestionData: {
          assessmentData: this.serializeInteraction(
            summaryData.suggestions ? summaryData.suggestions.assessment : null
          ),
          collectionData: this.serializeInteraction(
            summaryData.suggestions ? summaryData.suggestions.collection : null
          )
        },
        startDate: summaryData.startDate,
        endDate: summaryData.endDate,
        diagnosticAssessmentStatus:
          DIAGNOSTIC_STATUS[summaryData.diagnosticAssessmentStatus]
      };
    }
    return serializedSummaryData;
  }

  /**
   * @function serializeInteraction
   * Method to serialize interaction contents
   */
  public serializeInteraction(interactionData) {
    const serializedInteracitonData = {
      averageScore: 0,
      count: 0,
      sessionsCount: 0,
      totalMaxScore: 0,
      totalTimespent: 0,
      isNotStarted: true
    };
    if (interactionData) {
      serializedInteracitonData.averageScore = interactionData.averageScore;
      serializedInteracitonData.count = interactionData.count;
      serializedInteracitonData.sessionsCount = interactionData.sessionsCount;
      serializedInteracitonData.totalMaxScore = interactionData.totalMaxScore;
      serializedInteracitonData.totalTimespent = interactionData.totalTimespent;
      serializedInteracitonData.isNotStarted = false;
    }
    return serializedInteracitonData;
  }

  /**
   * @function serializeCompetencies
   * Method to serialize competencies contents
   */
  public serializeCompetencies(competencies, status) {
    if (!competencies) {
      return [];
    }
    return competencies.map(competency => {
      return {
        id: competency.id,
        code: competency.code,
        contentSource: competency.content_source,
        status,
        description: competency.description || '',
        name: competency.name || ''
      };
    });
  }

  /**
   * @function fetchStudentCompetencies
   * Method to fetch students competencies
   */
  public fetchStudentCompetencies(param) {
    const endpoint = `${this.dsUserNameSpace}/class/user/competency/report`;
    return this.httpService.get<StudentOverallCompetenciesModel>(endpoint, param).then((response) => {
      return this.normalizeStudentReportCompetencies(response.data);
    });
  }

  /**
   * @function fetchStudentsTimespentSummaryreport
   * Method to fetch students timespent
   */
  public fetchStudentsTimespentSummaryreport(param) {
    const endpoint = `${this.dsUserNameSpace}/class/timespent`;
    return this.httpService.get<TimespentModel>(endpoint, param).then((response) => {
      return this.normalizeStudentsTimespentSummaryreport(response.data);
    });
  }

  /**
   * @function normalizeStudentsTimespentSummaryreport
   * Method to normalize students time spent summery report data
   */
  public normalizeStudentsTimespentSummaryreport(payload) {
    const studentsTimespentData = payload.members;
    const serializedStudentsTimespentReportData: Array<StudentsTimeSpentModel> = studentsTimespentData.map(timespentData => {
      return {
        id: timespentData.id,
        firstName: timespentData.first_name,
        lastName: timespentData.last_name,
        thumbnail: timespentData.thumbnail,
        totalCollectionTimespent: timespentData.total_collection_timespent,
        totalAssessmentTimespent: timespentData.total_assessment_timespent,
        totalOfflineActivityTimespent: timespentData.total_oa_timespent
      } as StudentsTimeSpentModel;
    });
    return serializedStudentsTimespentReportData;
  }

  /**
   * @function normalizeStudentReportCompetencies
   * Method to normalize students report competencies
   */
  public normalizeStudentReportCompetencies(payload) {
    const newCompetenies = this.normalizeStudentCompetencies(payload.new);
    return {
        diagnostics: this.normalizeStudentCompetencies(payload.diagnostic),
        reinforced: this.normalizeStudentCompetencies(payload.reinforced),
        mastered: this.masteredCompetencies(newCompetenies),
        growth: this.growthCompetencies(newCompetenies),
        concern: this.areaConcern(newCompetenies),
        inprogress: this.assessmentInProgress(newCompetenies)
      } as StudentOverallCompetenciesModel;
  }

  /**
   * @function normalizeStudentCompetencies
   * Method to normalize student competencies
   */
  public normalizeStudentCompetencies(payload) {
    return payload.map((competency) => {
      const studentCompetency: StudentClassReportModel = {
          reportDate: competency.report_date,
          code: competency.code,
          title: competency.title,
          description: competency.description,
          score: competency && competency.score !== null ? Math.round(competency.score) : null,
          status: competency.status,
          tries: competency.tries,
          assessmentId: competency.assessment_id
      };
      return studentCompetency;
    });
  }

  /**
   * @function masteredCompetencies
   * Method to get masteredCompetencies
   */
  public masteredCompetencies(newCompetenies) {
    return newCompetenies.filter(item => item.score >= 80 && item.status === 'complete');
  }

  /**
   * @function growthCompetencies
   * Method to get growthCompetencies
   */
  public growthCompetencies(newCompetenies) {
    return newCompetenies.filter( item => item.score <= 79 && item.score >= 51 && item.score !== null);
  }

  /**
   * @function areaConcern
   * Method to get areaConcern
   */
  public areaConcern(newCompetenies) {
    return newCompetenies.filter(item => item.score < 51 && item.score !== null);
  }

  /**
   * @function assessmentInProgress
   * Method to get assessmentInProgress
   */
  public assessmentInProgress(newCompetenies) {
    return newCompetenies.filter(item => item.score === null && item.status === 'inprogress');
  }

  /**
   * @function fetchStudentDatewiseTimespent
   * Method to fetch students date wise timespent
   */
  public fetchStudentDatewiseTimespent(param) {
    const endpoint = `${this.dsUserNameSpace}/class/user/timespent`;
    return this.httpService.get<StudentDatewiseTimespentModel>(endpoint, param).then((response) => {
      return this.normalizeStudentsTimespentReport(response.data);
    });
  }

  /**
   * @function normalizeStudentsTimespentReport
   * Method to normalize students time spent report data
   */
  private normalizeStudentsTimespentReport(payload) {
    const studentsTimespentData = payload.report;
    const serializedStudentsTimespentReportData: Array<StudentDatewiseTimespentModel> =
    studentsTimespentData.map(timespentData => {
      const normalizedTimespentData: Array<StudentDatewiseDataModel> = this.serializeTimespentData(
        timespentData.data
      );
      return {
        reportDate: timespentData.report_date,
        data: normalizedTimespentData
      } as StudentDatewiseTimespentModel;
    });
    return serializedStudentsTimespentReportData;
  }

  /**
   * @function serializeTimespentData
   * Method to serialize timespent data
   */
  private serializeTimespentData(timespentData) {
    return timespentData.map(data => {
      return {
        id: data.id,
        title: data.title,
        format: data.format,
        totalTimespent: data.total_timespent,
        sessions: data.sessions,
        competencies: data.competencies,
        score: data.score,
        source: data.source,
        status: data.status,
        tries: data.sessions ? data.sessions.length : 0,
        performance: this.normalizePerformanceData(data)
      } as StudentDatewiseDataModel;
    });
  }

  /**
   * @function normalizePerformanceData
   * Method to normalize performance data
   */
  private normalizePerformanceData(payload) {
      const performance: PerformancesModel = {
        score: payload.score,
        timeSpent: payload.total_timespent,
        collectionId: payload.id,
        attempts: payload.sessions.length || null
      };
      return performance;
  }
}

