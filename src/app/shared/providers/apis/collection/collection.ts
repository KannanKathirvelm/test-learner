import { Injectable } from '@angular/core';
import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL,
  COLLECTION,
  COLLECTION_EXTERNAL,
  COLLECTION_TYPES,
  MULTIPLE_SELECT_IMAGES,
  OFFLINE_ACTIVITY,
  PATH_TYPES,
  SORTING_TYPES
} from '@shared/constants/helper-constants';
import {
  AnswerModel,
  CollectionListModel,
  CollectionModel,
  CollectionSettings,
  CollectionsModel,
  CollectionSuggestionModel,
  CollectionSummaryModel,
  ContentModel,
} from '@shared/models/collection/collection';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import {
  addHttpsProtocol,
  getDefaultImage,
  getDefaultImageXS,
  sortByNumber
} from '@shared/utils/global';

@Injectable({
  providedIn: 'root',
})
export class CollectionProvider {
  // -------------------------------------------------------------------------
  // Properties

  private courseMapNamespace = 'api/nucleus/v2/course-map';
  private namespace = 'api/nucleus/v1';
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService
  ) { }

  // -------------------------------------------------------------------------
  // Methods
  public fetchCollectionList(
    classId: string,
    courseId: string,
    lessonId: string,
    unitId: string
  ) {
    const endpoint = `${this.courseMapNamespace}/${courseId}/units/${unitId}/lessons/${lessonId}`;
    const params = {
      classId,
    };
    return this.httpService
      .get<CollectionListModel>(endpoint, params)
      .then((res) => {
        const collectionList: CollectionListModel = {
          alternatePaths: {
            systemSuggestions: res.data.alternate_paths
              .system_suggestions
              ? this.normalizeSuggestionSummary(
                res.data.alternate_paths.system_suggestions,
                false
              )
              : [],
            teacherSuggestions: res.data.alternate_paths
              .teacher_suggestions
              ? this.normalizeSuggestionSummary(
                res.data.alternate_paths.teacher_suggestions,
                true
              )
              : [],
          },
          coursePath: this.normalizeCollectionSummary(
            res.data.course_path
          ),
        };
        return collectionList;
      });
  }

  /**
   * Fetch collections details by id
   */
  public fetchCollectionById(collectionId: string, collectionType: string) {
    const format = COLLECTION_TYPES[collectionType];
    const endpoint = `${this.namespace}/${format}/${collectionId}`;
    return this.httpService.get<CollectionsModel>(endpoint).then((res) => {
      return this.normalizeCollections(res.data, collectionType);
    });
  }

  /**
   * @function normalizeSuggestionSummary
   * This Method is used to serialize suggestion summary
   */
  public normalizeSuggestionSummary(
    payload,
    isTeacherSuggestion
  ): Array<CollectionSuggestionModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return payload.map((item) => {
      const suggestion: CollectionSuggestionModel = {
        id: item.suggested_content_id,
        title: item.title,
        format: item.suggested_content_type || null,
        collectionId: item.ctx_collection_id || null,
        classId: item.ctx_class_id || null,
        courseId: item.ctx_course_id || null,
        unitId: item.ctx_unit_id || null,
        lessonId: item.ctx_lesson_id || null,
        pathId: item.id || 0,
        pathType: item.id
          ? isTeacherSuggestion
            ? PATH_TYPES.TEACHER
            : PATH_TYPES.SYSTEM
          : null,
        ctxPathId: item.ctx_path_id || 0,
        ctxPathType: item.ctx_path_id ? item.ctx_path_type : null,
        contentSubFormat: item.content_subformat || null,
        source: item.source,
        resourceCount: item.resourseCount,
        thumbnail: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImage(item.format),
        thumbnailXS: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImageXS(item.suggested_content_type),
        isSuggestedContent: true,
        isRescoped: item.isRescoped,
        isCollection: item.suggested_content_type === COLLECTION,
        isAssessment: item.suggested_content_type === ASSESSMENT,
        isExternalAssessment: item.suggested_content_type === ASSESSMENT_EXTERNAL,
        isExternalCollection: item.suggested_content_type === COLLECTION_EXTERNAL,
        isOfflineActivity: item.suggested_content_type === OFFLINE_ACTIVITY
      };
      return suggestion;
    });
  }

  /**
   * Normalize collection details
   */
  public normalizeCollections(payload, collectionType) {
    if (Object.keys(payload).length === 0) {
      return;
    }
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const content = payload.content || payload.question;
    const collections: CollectionsModel = {
      id: payload.id,
      format: this.getCollectionFormat(collectionType),
      collaborator: payload.collaborator,
      content: content ? this.normalizeCollectionContent(content) : [],
      courseId: payload.course_id,
      creatorId: payload.creator_id,
      grading: payload.grading,
      learningObjective: payload.learning_objective,
      learningToolId: payload.learning_tool_id || null,
      lessonId: payload.lesson_id,
      license: payload.license,
      metadata: payload.metadata,
      originalCollectionId: payload.original_collection_id,
      originalCreatorId: payload.original_creator_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      publishDate: payload.publish_date,
      subformat: payload.subformat,
      title: payload.title,
      unitId: payload.unit_id,
      taxonomy: payload.taxonomy,
      thumbnail: payload.thumbnail
        ? `${cdnUrl}${payload.thumbnail}`
        : getDefaultImage(collectionType),
      settings: this.normalizeCollectionSettings(payload.setting),
      visibleOnProfile: payload.visible_on_profile,
      collectionType,
      url: payload.url ? addHttpsProtocol(payload.url) : null,
      gutCodes: payload.gut_codes,
      isCollection: collectionType === COLLECTION,
      isAssessment: collectionType === ASSESSMENT,
      isExternalAssessment: collectionType === ASSESSMENT_EXTERNAL,
      isExternalCollection: collectionType === COLLECTION_EXTERNAL,
      isOfflineActivity: collectionType === OFFLINE_ACTIVITY
    };
    return collections;
  }

  /**
   * @function normalizeStruggles
   * Normalize the resource struggles
   */
  public normalizeStruggles(payload) {
    if (payload) {
      return payload.map((struggles) => {
        return {
          manifest_comp_code: struggles.manifestCompCode,
          origin_comp_code: struggles.originCompCode,
          struggle_code: struggles.struggleCode,
          subject_code: struggles.subjectCode
        };
      });
    }
    return;
  }

  /**
   * Method used to get collection format for porfolio
   */
  private getCollectionFormat(collectionType) {
    return collectionType === COLLECTION_EXTERNAL ||
      collectionType === COLLECTION
      ? COLLECTION
      : ASSESSMENT;
  }

  /**
   * Normalize collection settings
   */
  private normalizeCollectionSettings(settings) {
    if (settings) {
      const settingsModel: CollectionSettings = {
        attemptsAllowed: settings.attempts_allowed,
        bidirectionalPlay: settings.bidirectional_play,
        showFeedback: settings.show_feedback,
        showKey: settings.show_key,
        showHints: settings.show_hints,
        showExplanation: settings.show_explanation,
        randomizePlay: settings.randomize_play,
        contributesToPerformance: settings.contributes_to_performance,
        contributesToMastery: settings.contributes_to_mastery,
        classroomPlayEnabled: settings.classroom_play_enabled,
      };
      return settingsModel;
    }
    return;
  }

  /**
   * Normalize collection content
   */
  private normalizeCollectionContent(contents) {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return contents.map((contentPayload) => {
      if (contentPayload.content_subformat === MULTIPLE_SELECT_IMAGES) {
        contentPayload.answer.map((answer) => {
          return (answer.answer_text = cdnUrl + answer.answer_text);
        });
      }

      const subQuestions = contentPayload.subQuestions ?
        this.normalizeCollectionContent(contentPayload.subQuestions) : null;
      const content: ContentModel = {
        answer: contentPayload.answer
          ? this.normalizeAnswer(contentPayload.answer)
          : [],
        contentFormat: contentPayload.content_format || 'question',
        contentSubformat: contentPayload.content_subformat,
        creatorId: contentPayload.creator_id,
        description: contentPayload.description,
        hintExplanationDetail: contentPayload.hint_explanation_detail,
        id: contentPayload.id,
        displayGuide: contentPayload.display_guide,
        isCopyrightOwner: contentPayload.is_copyright_owner,
        maxScore: contentPayload.max_score,
        metadata: contentPayload.metadata,
        player_metadata: contentPayload.player_metadata || null,
        subQuestions,
        narration: contentPayload.narration,
        originalCreatorId: contentPayload.original_creator_id,
        publishDate: contentPayload.publish_date,
        sequenceId: contentPayload.sequence_id,
        taxonomy: contentPayload.taxonomy,
        title: contentPayload.title,
        thumbnail: contentPayload.thumbnail
          ? cdnUrl + contentPayload.thumbnail
          : null,
        url: contentPayload.url
          ? addHttpsProtocol(contentPayload.url, cdnUrl)
          : null,
        visibleOnProfile: contentPayload.visible_on_profile,
      };
      return content;
    });
  }

  /**
   * Normalize answer content
   */
  private normalizeAnswer(answers) {
    return answers.map((answer) => {
      const item: AnswerModel = {
        answer_text: answer.answer_text,
        answer_type: answer.answer_type,
        answer_audio_filename: answer.answer_audio_filename,
        is_correct: answer.is_correct,
        correct_answer: answer.correct_answer || null,
        sequence: answer.sequence,
        highlight_type: answer.highlight_type,
        struggles: this.normalizeStruggles(answer.struggles),
      };
      return item;
    });
  }

  /**
   * Normalize collection details
   * @param {payload} collection
   * @return {collection}
   */
  private normalizeCollectionSummary(payload): CollectionSummaryModel {
    const collectionSummaryDetails: CollectionSummaryModel = {
      aggregatedTaxonomy: payload.aggregated_taxonomy,
      collectionSummary: payload.collection_summary
        ? this.normalizeCollection(payload.collection_summary)
        : [],
      courseId: payload.course_id,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      lessonId: payload.lesson_id,
      lessonPlan: payload.lesson_plan,
      metadata: payload.metadata,
      modifierId: payload.modifier_id,
      originalCreatorId: payload.original_creator_id,
      originalLessonId: payload.original_lesson_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      sequenceId: payload.sequence_id,
      taxonomy: payload.taxonomy,
      title: payload.title,
      unitId: payload.unit_id,
      updatedAt: payload.updated_at,
    };
    return collectionSummaryDetails;
  }

  /**
   * Normalize collection details
   */
  private normalizeCollection(payload): Array<CollectionModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return payload.map((item) => {
      const collection: CollectionModel = {
        format: item.format,
        id: item.id,
        oeQuestionCount: item.oe_question_count,
        questionCount: item.question_count,
        resourceCount: item.resource_count,
        sequenceId: item.sequence_id,
        subformat: item.subformat,
        taskCount: item.task_count,
        thumbnailXS: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImageXS(item.format),
        thumbnail: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImage(item.format),
        title: item.title,
        isRescoped: item.isRescoped,
        learningObjective: item.learning_objective,
        url: item.url ? addHttpsProtocol(item.url) : null,
        isCollection: item.format === COLLECTION,
        isAssessment: item.format === ASSESSMENT,
        isExternalAssessment: item.format === ASSESSMENT_EXTERNAL,
        isExternalCollection: item.format === COLLECTION_EXTERNAL,
        isOfflineActivity: item.format === OFFLINE_ACTIVITY,
        gutCodes: item.gut_codes
      };
      return collection;
    });
  }

  /**
   * @function normalizeDiagnosticCollection
   * Normalize diagnostic collection
   */
  public normalizeDiagnosticCollection(collections) {
    const results = [];
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    if (collections) {
      collections.forEach(collection => {
        const thumbnailUrl = collection.thumbnail
          ? `${cdnUrl}${collection.thumbnail}`
          : getDefaultImage(collection.format);
        const item = {
          id: collection.id,
          title: collection.title,
          format: collection.format,
          sequenceId: collection.sequence_id,
          thumbnailUrl,
          url: collection.url,
          subformat: collection.subformat,
          gutCodes: collection.gut_codes,
          learningObjective: collection.learning_objective,
          metadata: collection.metadata,
          resourceCount: collection.resource_count,
          questionCount: collection.question_count,
          oeQuestionCount: collection.oe_question_count,
          taskCount: collection.task_count,
          isCollection: collection.format === COLLECTION,
          isAssessment: collection.format === ASSESSMENT,
          isExternalAssessment: collection.format === ASSESSMENT_EXTERNAL,
          isExternalCollection: collection.format === COLLECTION_EXTERNAL,
          isOfflineActivity: collection.format === OFFLINE_ACTIVITY
        };
        results.push(item);
      });
    }
    return sortByNumber(results, 'sequenceId', SORTING_TYPES.ascending);
  }
}
