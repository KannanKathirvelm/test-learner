import { Injectable } from '@angular/core';
import { PLAYER_EVENT_TYPES } from '@shared/constants/helper-constants';
import { NextCollectionModel, NextContextModel } from '@shared/models/navigate/navigate';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { getDefaultImage } from '@shared/utils/global';
@Injectable({
  providedIn: 'root'
})
export class NavigateProvider {

  // -------------------------------------------------------------------------
  // Properties

  private navigateNamespaceV2 = 'api/navigate-map/v3';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private httpService: HttpService,
              private collectionProvider: CollectionProvider,
              private sessionService: SessionService) { }


  /**
   * @function continueCourse
   * Returns the first/current map location for a course
   * This method is used to start a course or continue a course without knowing the exact location
   */
  public continueCourse(courseId, classId?, milestoneId?) {
    const mapContext = {
      course_id: courseId,
      class_id: classId,
      milestone_id: milestoneId,
      state: 'continue',
    };
    return this.fetchNextCollection(mapContext);
  }

  /**
   * @function contentServedResource
   * Returns the first / current map location for a course
   * This method is used to get collection for completed a course
   */
  public contentServedResource(mapContext) {
    mapContext.state = 'content-served';
    return this.fetchNextCollection(mapContext);
  }

  /**
   * @function fetchNextCollection
   * This method is used to fetch the collection based on given context
   */
  public fetchNextCollection(context) {
    const endpoint = `${this.navigateNamespaceV2}/next`;
    return this.httpService.post<NextCollectionModel>(endpoint, context).then((res) => {
      return this.normalizeNextCollection(res.data);
    });
  }

  /**
   * @function fetchSystemSuggestionPathId
   * This method is used to fetch the path id based on given context
   */
  public fetchSystemSuggestionPathId(context) {
    const endpoint = `${this.navigateNamespaceV2}/system/suggestions`;
    return this.httpService.post<NextCollectionModel>(endpoint, context).then((res) => {
      return Number(res.headers.location);
    });
  }

  /**
   * @function normalizeNextCollection
   * This method is used to normalize next collection
   */
  private normalizeNextCollection(result) {
    const collectionType = result.context.current_item_type;
    const nextCollection: NextCollectionModel = {
      content: this.collectionProvider.normalizeCollections(result.content, collectionType),
      context: this.normalizeNextContext(result.context),
      suggestions: this.normalizeSuggestions(result.suggestions),
    };
    return nextCollection;
  }

  /**
   * @function normalizeNextContext
   * This method is used to normalize next collection context
   */
  private normalizeNextContext(context) {
    const collectionType = context.current_item_type;
    const contextModel: NextContextModel = {
      class_id: context.class_id,
      collection_id: context.collection_id,
      context_data: context.context_data,
      course_id: context.course_id,
      current_item_id: context.current_item_id,
      current_item_subtype: context.current_item_subtype,
      current_item_type: collectionType,
      lesson_id: context.lesson_id,
      milestone_id: context.milestone_id,
      path_id: context.path_id !== null ? Number(context.path_id) : 0,
      path_type: context.path_id ? context.path_type : null,
      ctx_path_id: context.ctx_path_id !== null ? Number(context.ctx_path_id) : 0,
      ctx_path_type: context.ctx_path_type ? context.ctx_path_type : null,
      score_percent: context.score_percent,
      state: context.state,
      unit_id: context.unit_id,
      diagnostic: context.diagnostic || null,
    };
    return contextModel;
  }

  /**
   * @function normalizeSuggestions
   * This method is used to normalize the suggestions
   */
  private normalizeSuggestions(suggestions) {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return suggestions.map((suggestion) => {
      return {
        format: suggestion.format,
        id: suggestion.id,
        metadata: suggestion.metadata,
        questionCount: suggestion.questionCount,
        resourceCount: suggestion.resourceCount,
        subformat: suggestion.subformat,
        suggestedContentSubType: suggestion.suggestedContentSubType,
        taxonomy: suggestion.taxonomy,
        thumbnail: suggestion.thumbnail ? `${cdnUrl}${suggestion.thumbnail}` :
          getDefaultImage(suggestion.format),
        title: suggestion.title,
      };
    });
  }

  /**
   * @function getCurrentCollectionContext
   * Maps properties of location to navigateMap
   */
  public getCurrentCollectionContext(context) {
    const contextData = {
      class_id: context.classId,
      collection_id: context.collectionId,
      collection_subtype:
        context.pathType === 'system'
          ? context.collectionType === 'collection'
            ? 'signature-collection'
            : 'signature-assessment'
          : null, // inference based on pathType & collectionType
      collection_type: context.collectionType,
      course_id: context.courseId,
      current_item_id: context.collectionId,
      current_item_type: context.collectionType,
      lesson_id: context.lessonId,
      ctx_path_id: context.ctxPathId,
      ctx_path_type: context.ctxPathType,
      milestone_id: context.milestoneId || null,
      path_id: context.pathId,
      path_type: context.pathType,
      score_percent: Number(context.scoreInPercentage),
      state: context.state || PLAYER_EVENT_TYPES.START,
      unit_id: context.unitId,
      diagnostic: context.diagnostic || null
    };
    return contextData;
  }

  /**
   * @function serializeContextForQueryParams
   * Serialize context data to pass as queryParams in studyplayer
   */
  public serializeContextForQueryParams(params) {
    return {
      collectionId: params.collection_id || null,
      classId: params.class_id || null,
      milestoneId: params.milestone_id || null,
      lessonId: params.lesson_id || null,
      courseId: params.course_id || null,
      pathId: params.path_id || 0,
      pathType: params.path_type || null,
      unitId: params.unit_id || null,
      collectionType: params.collection_type || params.current_item_type,
      scoreInPercentage: params.score_percent || null,
      state: params.state,
      ctxPathId: params.ctx_path_id || 0,
      ctxPathType: params.ctx_path_type || null
    };
  }

  /**
   * @function generateStudentRoute
   * method is used to generate student route
   */
  public generateStudentRoute(params) {
    const endpoint = `${this.navigateNamespaceV2}/diagnostic/route/check`;
    return this.httpService.get(endpoint, params).then((response) => {
      return response.data;
    });
  }
}
