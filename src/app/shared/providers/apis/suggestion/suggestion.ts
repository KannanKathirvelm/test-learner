import { Injectable } from '@angular/core';
import { ASSESSMENT, ASSESSMENT_EXTERNAL, COLLECTION, COLLECTION_EXTERNAL, DEFAULT_IMAGES, OFFLINE_ACTIVITY, SUGGESTION_SCOPE } from '@shared/constants/helper-constants';
import { CASuggestionModel, SuggestionModel, SuggestionsModel } from '@shared/models/suggestion/suggestion';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})

export class SuggestionProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/stracker/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private sessionService: SessionService, private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchTeacherSuggestions
   * This method is used to fetch the teacher suggestion
   */
  public fetchTeacherSuggestions(code, param): Promise<Array<SuggestionModel>> {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.namespace}/user/${userId}/code/${code}/codetype/competency`;
    return this.httpService.get<Array<SuggestionModel>>(endpoint, param).then((res) => {
      return this.normalizeProficiencySuggestionList(res.data.suggestions);
    });
  }

  /**
   * @function fetchClassActivitySuggestion
   * This method is used to fetch class activity suggestion
   */
  public fetchClassActivitySuggestion(classId, classActivityIds, detail) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.namespace}/ca/class/${classId}`;
    const params = {
      caIds: classActivityIds,
      scope: SUGGESTION_SCOPE.CLASS_ACTIVITY,
      detail,
      userId
    };
    return this.httpService.post<Array<CASuggestionModel>>(endpoint, params).then((res) => {
      return this.normalizeCASuggestions(res.data.suggestions);
    });
  }

  /**
   * @function normalizeCASuggestions
   * This method is used to normalize the ca suggestions
   */
  public normalizeCASuggestions(payload): Array<CASuggestionModel> {
    return payload.map((item) => {
      const caSuggestion: CASuggestionModel = {
        caId: item.caId,
        suggestedContents: item.suggestedContents,
        total: item.total
      };
      return caSuggestion;
    });
  }

  /**
   * @function normalizeProficiencySuggestionList
   * This method is used to normalize the proficiency suggestions
   */
  private normalizeProficiencySuggestionList(suggestions) {
    return suggestions.map((suggestion) => {
      const suggestionModel: SuggestionModel = {
        id: suggestion.id,
        unitId: suggestion.unitId,
        lessonId: suggestion.lessonId,
        collectionId: suggestion.collectionId,
        classId: suggestion.classId,
        suggestedContentId: suggestion.suggestedContentId,
        suggestedContentType: suggestion.suggestedContentType.toLowerCase(),
        isCollection: suggestion.suggestedContentType === COLLECTION,
        isAssessment: suggestion.suggestedContentType === ASSESSMENT,
        isOfflineActivity: suggestion.suggestedContentType === OFFLINE_ACTIVITY,
        isExternalAssessment: suggestion.suggestedContentType === ASSESSMENT_EXTERNAL,
        isExternalCollection: suggestion.suggestedContentType === COLLECTION_EXTERNAL,
        suggestedTo: suggestion.suggestedTo,
        suggestionArea: suggestion.suggestionArea,
        suggestionCriteria: suggestion.suggestionCriteria,
        suggestionOrigin: suggestion.suggestionOrigin,
        suggestionOriginatorId: suggestion.suggestionOriginatorId,
        pathId: suggestion.pathId,
        userId: suggestion.userId,
        questionType: suggestion.question_count,
        resourceCount: suggestion.resource_count,
        questionCount: suggestion.question_count,
        courseId: suggestion.courseId,
        createdAt: suggestion.createdAt,
        txCodeType: suggestion.txCodeType,
        txCode: suggestion.txCode,
        acceptedAt: suggestion.acceptedAt,
        accepted: suggestion.accepted,
        updatedAt: suggestion.updatedAt,
        title: suggestion.title
      };
      return suggestionModel;
    });
  }

  /**
   * @function fetchSuggestions
   * This method is used to fetch the suggestion
   */
  public fetchSuggestions(classId, params): Promise<SuggestionsModel> {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.namespace}/user/${userId}/class/${classId}`;
    return this.httpService.get<SuggestionsModel>(endpoint, params).then((res) => {
      const suggestionResponse = res.data;
      return this.normalizeSuggestionContents(suggestionResponse);
    });
  }

  /**
   * @function normalizeSuggestionContents
   * This method is used to normalize the suggestions
   */
  private normalizeSuggestionContents(payload) {
    const result: SuggestionsModel = {
      suggestions: this.normalizeSuggestionList(payload.suggestions),
      total: payload.total
    };
    return result;
  }

  /**
   * @function normalizeSuggestionList
   * This method is used to normalize the proficiency suggestions
   */
  private normalizeSuggestionList(suggestions) {
    const path = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const suggestionList = suggestions.map((suggestion) => {
      const suggestionModel: SuggestionModel = {
        id: suggestion.id,
        unitId: suggestion.unitId,
        lessonId: suggestion.lessonId,
        collectionId: suggestion.collectionId,
        classId: suggestion.classId,
        caId: suggestion.caId,
        suggestedContentId: suggestion.suggestedContentId,
        suggestedContentType: suggestion.suggestedContentType.toLowerCase(),
        suggestedTo: suggestion.suggestedTo,
        suggestionArea: suggestion.suggestionArea,
        suggestionCriteria: suggestion.suggestionCriteria,
        suggestionOrigin: suggestion.suggestionOrigin,
        suggestionOriginatorId: suggestion.suggestionOriginatorId,
        pathId: suggestion.pathId,
        userId: suggestion.userId,
        questionType: suggestion.question_count,
        resourceCount: suggestion.resource_count,
        questionCount: suggestion.question_count,
        courseId: suggestion.courseId,
        createdAt: suggestion.createdAt,
        txCodeType: suggestion.txCodeType,
        txCode: suggestion.txCode,
        ctxPathId: suggestion.ctxPathId,
        ctxPathType: suggestion.ctxPathType,
        acceptedAt: suggestion.acceptedAt,
        accepted: suggestion.accepted,
        updatedAt: suggestion.updatedAt,
        title: suggestion.title,
        isCollection: suggestion.suggestedContentType === COLLECTION,
        isAssessment: suggestion.suggestedContentType === ASSESSMENT,
        isOfflineActivity: suggestion.suggestedContentType === OFFLINE_ACTIVITY,
        isExternalAssessment: suggestion.suggestedContentType === ASSESSMENT_EXTERNAL,
        isExternalCollection: suggestion.suggestedContentType === COLLECTION_EXTERNAL,
        isCourseMap: suggestion.suggestionArea === SUGGESTION_SCOPE.COURSE_MAP,
        isClassActivity: suggestion.suggestionArea === SUGGESTION_SCOPE.CLASS_ACTIVITY,
        isProficiency: suggestion.suggestionArea === SUGGESTION_SCOPE.PROFICIENCY,
        thumbnail: suggestion.thumbnail ? path + suggestion.thumbnail : (suggestion.suggestedContentType === COLLECTION ? DEFAULT_IMAGES.COLLECTION : DEFAULT_IMAGES.ASSESSMENT)
      };
      return suggestionModel;
    });
    return suggestionList;
  }
}
