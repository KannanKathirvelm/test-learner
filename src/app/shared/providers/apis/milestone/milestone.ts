import { Injectable } from '@angular/core';
import { DEPENDENT_LESSON_SUGGESTION_EVENTS, SORTING_TYPES } from '@shared/constants/helper-constants';
import { LessonListModel, LessonModel, LessonSuggestionsModel } from '@shared/models/lesson/lesson';
import {
  AlternativeLearningContentsModel, CollectionDetailsModel, CompetencyAlternativeLearningContentsModel, DomainAlternativeLearningContentsModel,
  DomainDetailsModel, LearningContentsModel, MilestoneAlternatePathModel, MilestoneDetailsModel, MilestoneListModel, MilestoneModel, MilestoneStatsModel,
  SkippedContents, TopicAlternativeLearningContentsModel, TopicDetailsModel
} from '@shared/models/milestone/milestone';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { sortByNumber } from '@shared/utils/global';

@Injectable({
  providedIn: 'root'
})

export class MilestoneProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1';
  private rescopeNamespace = 'api/rescope';
  private namespaceV2 = 'api/nucleus-insights/v2';
  private namespaceForAlternatePaths = 'api/nucleus/v1/course-map';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private collectionProvider: CollectionProvider
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchMilestoneAlternatePath
   * This method is used to fetch milestone alternate path
   */
  public fetchMilestoneAlternatePath(milestoneId, classId) {
    const userId = this.sessionService.userSession.user_id;
    const params = {
      classId,
      userId
    };
    const endpoint = `${this.namespaceForAlternatePaths}/milestones/${milestoneId}/alternatepaths`;
    return this.httpService.get<Array<MilestoneAlternatePathModel>>(endpoint, params).then((result) => {
      return this.normalizeMilestoneAlternatePath(result.data.alternate_paths || []);
    });
  }

  /**
   * @function fethcMilestoneDependentLesson
   * This method is used to fetch milestone dependent path
   */
   public fethcMilestoneDependentLesson(milestoneId, classId) {
    const userId = this.sessionService.userSession.user_id;
    const params = {
      classId,
      userId
    };
    const endpoint = `${this.namespaceForAlternatePaths}/milestones/${milestoneId}/dependentpaths`;
    return this.httpService.get<Array<MilestoneAlternatePathModel>>(endpoint, params).then((result) => {
      return this.normalizeDependentPath(result.data || {});
    });
  }

  /**
   * @function normalizeDependentPath
   * This method is used to normalize milestone dependent path
   */
  public normalizeDependentPath(payload) {
    const dependentPaths = payload.dependent_paths || [];
    const results = [];
    dependentPaths.forEach(dependentLesson => {
      const lessonItem = {
        id: dependentLesson.id,
        lessonId: dependentLesson.lesson_id,
        lessonTitle: dependentLesson.title,
        cxtLessonId: dependentLesson.ctx_lesson_id,
        sequenceId: dependentLesson.sequence_id || 0,
        signatureSuggestions: dependentLesson.signature_suggestions,
        collections: this.collectionProvider.normalizeDiagnosticCollection(
          dependentLesson.collection_summary
        )
      };
      if (
        lessonItem.signatureSuggestions &&
        lessonItem.signatureSuggestions.length
      ) {
        const signatureContent = this.collectionProvider.normalizeSuggestionSummary(
          lessonItem.signatureSuggestions,
          false
        );
        signatureContent.forEach(item => {
          item.source = DEPENDENT_LESSON_SUGGESTION_EVENTS.source;
        });
        lessonItem.collections = lessonItem.collections.concat(
          signatureContent
        );
      }
      results.push(lessonItem);
    });
    return results;
  }

  /**
   * @function normalizeMilestoneAlternatePath
   * This method is used to normalize milestone alternate path
   */
  public normalizeMilestoneAlternatePath(payload) {
    const domainItems = payload ? payload.domains : [];
    const domainData = [];
    if (domainItems) {
      domainItems.forEach((domain) => {
        const payloadContext = domain.context;
        const lessonSuggestions = domain.lesson_suggestions;
        const suggestionStat = domain.diagnostic_suggestions;
        const skippedLessons = domain.skipped_lessons || [];
        const resultData: MilestoneAlternatePathModel = {
          context: null,
          lessonSuggestions: this.normalizeSuggestionLessons(lessonSuggestions, skippedLessons),
          diagnosticStats: null
        };
        if (payloadContext) {
          const context = {
            ctxClassId: payloadContext.ctx_class_id,
            ctxCourseId: payloadContext.ctx_course_id,
            ctxUnitId: payloadContext.ctx_unit_id,
            ctxLessonId: payloadContext.ctx_lesson_id,
            ctxCollectionId: payloadContext.ctx_collection_id,
            ctxMilestoneId: payloadContext.ctx_milestone_id,
            ctxGradeId: payloadContext.ctx_grade_id,
            domainCode: payloadContext.domain_code,
            gradeId: payloadContext.grade_id
          };
          resultData.context = context;
        }
        if (suggestionStat) {
          resultData.diagnosticStats = {
            session_id: suggestionStat.session_id,
            status: suggestionStat.status
          };
        }
        domainData.push(resultData);
      });
    }
    return domainData;
  }

  public normalizeSuggestionLessons(lessons, skippedLessons = []): Array<LessonSuggestionsModel> {
    const results = [];
    lessons.forEach((lesson) => {
      const lessonItem: LessonSuggestionsModel = {
        id: lesson.id,
        lessonId: lesson.lesson_id,
        title: lesson.title,
        sequence_id: lesson.sequence_id,
        collections: this.collectionProvider.normalizeDiagnosticCollection(
          lesson.collection_summary
        )
      };
      if (skippedLessons) {
        const isSkipped = skippedLessons.indexOf(lesson.lesson_id) !== -1;
        if (isSkipped) {
          lesson.rescope = true;
        }
      }
      results.push(lessonItem);
    });
    return sortByNumber(results, 'sequence_id', SORTING_TYPES.ascending);
  }

  /**
   * @function fetchMilestones
   * This method is used to fetch milestones
   */
  public fetchMilestones(courseId: string, fwCode: string, classId?: string) {
    const endpoint = `${this.namespace}/courses/ms/${courseId}/fw/${fwCode}`;
    let postData = {};
    if (classId) {
      const userId = this.sessionService.userSession.user_id;
      postData = {
        class_id: classId,
        user_id: userId,
      };
    }
    return this.httpService.get<MilestoneListModel>(endpoint, postData).then((result) => {
      const milestoneList: MilestoneListModel = {
        aggregatedTaxonomy: result.data.aggregated_taxonomy,
        collaborator: result.data.collaborator,
        createdAt: result.data.created_at,
        creatorId: result.data.creator_id,
        creatorSystem: result.data.creator_system,
        description: result.data.description,
        id: result.data.id,
        license: result.data.license,
        metadata: result.data.metadata,
        milestones: this.normalizeMilestone(result.data.milestones),
        modifierId: result.data.modifier_id,
        originalCourseId: result.data.original_course_id,
        originalCreatorId: result.data.original_creator_id,
        ownerId: result.data.ownerId,
        primaryLanguage: result.data.primary_language,
        publishDate: result.data.publish_date,
        publishStatus: result.data.publish_status,
        sequenceId: result.data.sequence_id,
        subjectBucket: result.data.subject_bucket,
        taxonomy: result.data.taxonomy,
        thumbnail: result.data.thumbnail,
        title: result.data.title,
        updatedAt: result.data.updated_at,
        useCase: result.data.use_case,
        version: result.data.version,
        visibleOnProfile: result.data.visible_on_profile
      };
      return milestoneList;
    });
  }

  /**
   * @function fetchMilestoneRoutes
   * This method is used to milestone route
   */
  public fetchMilestoneRoutes(classId) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.namespace}/classes/${classId}/members/${userId}/map-coordinates`;
    return this.httpService.get(endpoint).then((result) => {
      return result.data;
    });
  }

  /**
   * @function fetchMilestoneStats
   * This method is used to fetch milestones stats
   */
  public fetchMilestoneStats(milestoneIds, classId) {
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      milestoneIds,
      userId,
      classId
    };
    const endpoint = `${this.namespaceV2}/classes/milestone/stats`;
    return this.httpService.post(endpoint, postData).then((result) => {
      const milestoneStats = this.normalizeMilestoneStats(result.data);
      return milestoneStats;
    });
  }

  /**
   * @function normalizeMilestoneStats
   * This method is used to normalize milestones stats
   */
  private normalizeMilestoneStats(payload): Array<MilestoneStatsModel> {
    if (payload && payload.milestone) {
      return payload.milestone.map((milestone) => {
        const milestoneStats = {
          lessonsStudied: milestone.lessonsStudied,
          milestoneId: milestone.milestoneId,
          totalLessons: milestone.totalLessons
        };
        return milestoneStats;
      });
    }
  }

  /**
   * @function fetchMilestoneLearningContents
   * This method is used to update profile baseline
   */
  public fetchMilestoneLearningContents(courseId, classId, framework) {
    const user_id = this.sessionService.userSession.user_id;
    const params = {
      class_id: classId,
      user_id
    };
    const endpoint = `${this.namespace}/courses/ms/${courseId}/fw/${framework}/map-alt-learning-contents`;
    return this.httpService.get<Array<AlternativeLearningContentsModel>>(endpoint, params).then((result) => {
      return this.normalizeMilestoneLearningContents(result.data.alternativeLearningContents);
    });
  }

  /**
   * @function fetchDomainLearningContents
   * This method is used to get domain aleternate resource contents
   */
  public fetchDomainLearningContents(courseId, classId, framework, domainCode) {
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      classId,
      userId,
      domainCode,
      limit: 20
    };
    const endpoint = `${this.namespace}/courses/ms/${courseId}/fw/${framework}/map-alt-learning-contents/domains`;
    return this.httpService.post<Array<DomainAlternativeLearningContentsModel>>(endpoint, postData).then((result) => {
      return this.normalizeDomainLearningContents(result.data.domainAlternativeLearningContents);
    });
  }

  /**
   * @function fetchTopicLearningContents
   * This method is used to get topic aleternate resource contents
   */
  public fetchTopicLearningContents(courseId, classId, framework, topicCode) {
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      classId,
      userId,
      topicCode,
      limit: 20
    };
    const endpoint = `${this.namespace}/courses/ms/${courseId}/fw/${framework}/map-alt-learning-contents/topics`;
    return this.httpService.post<Array<TopicAlternativeLearningContentsModel>>(endpoint, postData).then((result) => {
      return this.normalizeTopicLearningContents(result.data.topicAlternativeLearningContents);
    });
  }

  /**
   * @function fetchTopicLearningContents
   * This method is used to get topic aleternate resource contents
   */
  public fetchCompetencyLearningContents(courseId, classId, framework, competencyCode) {
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      classId,
      userId,
      competencyCode,
      limit: 20
    };
    const endpoint = `${this.namespace}/courses/ms/${courseId}/fw/${framework}/map-alt-learning-contents/competencies`;
    return this.httpService.post<Array<CompetencyAlternativeLearningContentsModel>>(endpoint, postData).then((result) => {
      return this.normalizeCompetencyLearningContents(result.data.competencyAlternativeLearningContents);
    });
  }

  /**
   * @function normalizeMilestoneLearningContents
   * This method is used to normalize milestones contents
   */
  private normalizeMilestoneLearningContents(payload): Array<AlternativeLearningContentsModel> {
    return payload.map((milestone) => {
      const learningContents = {
        contents: this.normalizeLearningContents(milestone.contents),
        milestoneId: milestone.milestone_id
      };
      return learningContents;
    });
  }

  /**
   * @function normalizeDomainLearningContents
   * This method is used to normalize domain contents
   */
  private normalizeDomainLearningContents(payload): Array<DomainAlternativeLearningContentsModel> {
    return payload.map((domain) => {
      const learningContents = {
        contents: this.normalizeLearningContents(domain.contents),
        domainCode: domain.domain_code
      };
      return learningContents;
    });
  }

  /**
   * @function normalizeTopicLearningContents
   * This method is used to normalize topic contents
   */
  private normalizeTopicLearningContents(payload): Array<TopicAlternativeLearningContentsModel> {
    return payload.map((topic) => {
      const learningContents = {
        contents: this.normalizeLearningContents(topic.contents),
        topicCode: topic.topic_code
      };
      return learningContents;
    });
  }

  /**
   * @function normalizeCompetencyLearningContents
   * This method is used to normalize competency contents
   */
     private normalizeCompetencyLearningContents(payload): Array<CompetencyAlternativeLearningContentsModel> {
      return payload.map((competency) => {
        const learningContents = {
          contents: this.normalizeLearningContents(competency.contents),
          competencyCode: competency.competency_code
        };
        return learningContents;
      });
    }

  /**
   * @function normalizeLearningContents
   * This method is used to normalize contents
   */
  private normalizeLearningContents(contents) {
    return contents.map((content) => {
      const learningContents: LearningContentsModel = {
        contentId: content.content_id,
        contentType: content.content_type,
        creatorId: content.creator_id,
        description: content.description,
        fwCompCode: content.fw_comp_code,
        fwCompDesc: content.fw_comp_desc,
        fwCompDisplayCode: content.fw_comp_display_code,
        gutCompCode: content.gut_comp_code,
        gutCompDesc: content.gut_comp_desc,
        gutCompDisplayCode: content.gut_comp_display_code,
        learningDurationInMins: content.learning_duration_in_mins,
        title: content.title,
        publisherName: content.publisher_name,
        publisherThumbnail: content.publisher_thumbnail,
        contentSubtype: content.content_subtype,
        userStudiedCount: content.user_studied_count,
        url: content.url,
        defaultThumbnail: content.default_thumbnail
      };
      return learningContents;
    });
  }

  /**
   * @function fetchMilestoneDetails
   * This method is used to fetch milestone details
   */
  public fetchMilestoneDetails(courseId, classId, milestoneIds, route0MilestoneIds) {
    const userId = this.sessionService.userSession.user_id;
    const postData = {
      classId,
      userId,
      milestoneIds,
      route0MilestoneIds
    };
    const endpoint = `${this.namespace}/courses/${courseId}/milestones`;
    return this.httpService.post(endpoint, postData).then((result) => {
      const milestoneDetails = this.normalizeMilestoneDetails(result.data);
      return milestoneDetails;
    });
  }

  /**
   * @function normalizeMilestoneDetails
   * This method is used to normalize milestones details
   */
  private normalizeMilestoneDetails(payload): Array<MilestoneDetailsModel> {
    if (payload && payload.milestones) {
      return payload.milestones.map((milestone) => {
        const milestoneDetails: MilestoneDetailsModel = {
          milestoneId: milestone.milestone_id,
          competencyCount: milestone.competency_count,
          domains: this.normalizeDomain(milestone.domains)
        };
        return milestoneDetails;
      });
    }
  }

  /**
   * @function normalizeDomain
   * This method is used to normalize domain details
   */
  private normalizeDomain(domains): Array<DomainDetailsModel> {
    const domainList = domains.map((domain) => {
      const domainDetails: DomainDetailsModel = {
        domainCode: domain.domain_code,
        domainName: domain.domain_name,
        domainSeq: domain.domain_seq,
        competencyCount: domain.competency_count,
        topics: this.normalizeTopic(domain.topics)
      };
      return domainDetails;
    });
    return sortByNumber(domainList, 'domainSeq', SORTING_TYPES.ascending);
  }

  /**
   * @function normalizeTopic
   * This method is used to normalize topic details
   */
  private normalizeTopic(topics): Array<TopicDetailsModel> {
    const topicList = topics.map((topic) => {
      const topicDetails: TopicDetailsModel = {
        topicCode: topic.topic_code,
        topicName: topic.topic_name,
        topicSeq: topic.topic_seq,
        competencyCount: topic.competency_count,
        competencyCodes: topic.competencies.map((competency) => competency.competency_code),
        collections: this.normalizeCollection(topic.competencies)
      };
      return topicDetails;
    });
    return sortByNumber(topicList, 'topicSeq', SORTING_TYPES.ascending);
  }

  /**
   * @function normalizeCollection
   * This method is used to normalize collection details
   */
  private normalizeCollection(competencies): Array<CollectionDetailsModel> {
    const collectionList = [];
    competencies.forEach((competency) => {
      competency.collections.forEach((collection) => {
        const collectionDetails: CollectionDetailsModel = {
          competencyCode: competency.competency_code,
          competencySeq: competency.competency_seq,
          collectionCode: collection.collection_id,
          collectionName: collection.collection_title,
          collectionType: collection.collection_format,
          collectionThumbnail: collection.collection_thumbnail,
          lessonId: collection.lesson_id,
          unitId: collection.unit_id,
        };
        collectionList.push(collectionDetails);
      });
    });
    return sortByNumber(collectionList, 'competencySeq', SORTING_TYPES.ascending);
  }

  /**
   * @function updateProfileBaseline
   * This method is used to update profile baseline
   */
  public updateProfileBaseline(classId) {
    const endpoint = `${this.namespace}/classes/${classId}/profilebaseline/student`;
    return this.httpService.put(endpoint, {});
  }


  /**
   * @function fetchLessonList
   * This method is used to fetch lesson contents
   */
  public fetchLessonList(milestoneId: string, courseId: string) {
    const endpoint = `${this.namespace}/courses/ms/${courseId}/milestones/${milestoneId}`;
    return this.httpService.get<LessonListModel>(endpoint).then((res) => {
      const lesson: LessonListModel = {
        courseId: res.data.course_id,
        lessons: res.data.lessons ? this.normalizeLesson(res.data.lessons) : [],
        milestoneId: res.data.milestone_id
      };
      return lesson;
    });
  }

  /**
   * Normalize lesson details
   */
  private normalizeLesson(payload): Array<LessonModel> {
    return payload.map((item) => {
      const lesson: LessonModel = {
        fwCode: item.fw_code,
        gradeId: item.grade_id,
        gradeName: item.grade_name,
        gradeSeq: item.grade_seq,
        lessonId: item.lesson_id,
        lessonSequence: item.lesson_sequence,
        lessonTitle: item.lesson_title,
        txCompCode: item.tx_comp_code,
        txCompName: item.tx_comp_name,
        txCompSeq: item.tx_comp_seq,
        txCompStudentDesc: item.tx_comp_student_desc,
        txDomainCode: item.tx_domain_code,
        txDomainId: item.tx_domain_id,
        txDomainName: item.tx_domain_name,
        txDomainSeq: item.tx_domain_seq,
        txSubjectCode: item.tx_subject_code,
        unitId: item.unit_id,
        unitSequence: item.unit_sequence,
        isRescoped: item.isRescoped,
        unitTitle: item.unit_title
      };
      return lesson;
    });
  }

  /**
   * Normalize milestone details
   */
  private normalizeMilestone(payload): Array<MilestoneModel> {
    return payload.map((item, index) => {
      const milestoneDetails: MilestoneModel = {
        gradeId: item.grade_id,
        gradeName: item.grade_name,
        gradeSeq: item.grade_seq,
        milestoneId: item.milestone_id,
        txSubjectCode: item.tx_subject_code,
        sequenceId: (index + 1),
        competencyCount: item.competency_count || 0,
        computedEtlSecs: item.computed_etl_secs || 0
      };
      return milestoneDetails;
    });
  }

  /**
   * @function fetchSkippedContents
   * This method is used to fetch skipped contents
   */
  public fetchSkippedContents(classId, courseId) {
    const endpoint = `${this.rescopeNamespace}/v1/scope/skipped`;
    const params = {
      classId,
      courseId
    };
    return this.httpService.get<SkippedContents>(endpoint, params).then((res) => {
      return res.data;
    }).catch((err) => {
      if (err.status === 404) {
        return {
          lessons: []
        };
      }
      // tslint:disable-next-line
      console.error(err);
    });
  }
}
