import { Injectable } from '@angular/core';
import {
  CourseDetailModel,
  UnitSummaryModel
} from '@shared/models/course-map/course-map';
import {
  UnitLessonContentModel,
  UnitLessonSummaryModel
} from '@shared/models/lesson/lesson';
import { HttpService } from '@shared/providers/apis/http';

@Injectable({
  providedIn: 'root',
})
export class CourseMapProvider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1/courses';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCourseDetailsById
   * Method to fetch course detail by id
   */
  public fetchCourseDetailsById(courseId) {
    const endpoint = `${this.namespace}/${courseId}`;
    return this.httpService.get<CourseDetailModel>(endpoint).then((response) => {
      return this.normalizeCourseDetails(response.data);
    });
  }

  /**
   * @function normalizeCourseDetails
   * Method to normalize course details
   */
  private normalizeCourseDetails(payload): CourseDetailModel {
    const courseDetail: CourseDetailModel = {
      aggregatedTaxonomy: payload.payload,
      collaborator: payload.collaborator,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      description: payload.description,
      id: payload.id,
      license: payload.license,
      metadata: payload.metadata,
      modifierId: payload.modifier_id,
      originalCourseId: payload.original_course_id,
      originalCreatorId: payload.original_creator_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      publishDate: payload.publish_date,
      publishStatus: payload.publish_status,
      sequenceId: payload.sequence_id,
      subjectBucket: payload.subject_bucket,
      taxonomy: payload.taxonomy,
      thumbnail: payload.thumbnail,
      title: payload.title,
      unitSummary: payload.unit_summary && this.normalizeUnitSummary(payload.unit_summary) || [],
      updatedAt: payload.updated_at,
      useCase: payload.use_case,
      version: payload.version,
      visibleOnProfile: payload.visible_on_profile
    };
    return courseDetail;
  }

  /**
   * @function normalizeUnitSummary
   * Method to normalize unit summary
   */
  private normalizeUnitSummary(payload): Array<UnitSummaryModel> {
    return payload.map((item) => {
      const unitSummary: UnitSummaryModel = {
        lessonCount: item.lesson_count,
        sequenceId: item.sequence_id,
        title: item.title,
        unitId: item.unit_id
      };
      return unitSummary;
    });
  }

  /**
   * @function fetchUnitLessons
   * Method to fetch unit lessons
   */
  public fetchUnitLessons(courseId, unitId) {
    const endpoint = `${this.namespace}/${courseId}/units/${unitId}`;
    return this.httpService.get<UnitLessonContentModel>(endpoint).then((response) => {
      return this.normalizeUnitLessonsPayload(response.data);
    });
  }

  /**
   * @function normalizeUnitLessonsPayload
   * Method to normalize unit lessons payload
   */
  private normalizeUnitLessonsPayload(payload): UnitLessonContentModel {
    const content: UnitLessonContentModel = {
      aggregatedTaxonomy: payload.aggregated_taxonomy,
      bigIdeas: payload.big_ideas,
      courseId: payload.course_id,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      essentialQuestions: payload.essential_questions,
      lessonSummary: this.normalizeLessons(payload.lesson_summary),
      metadata: payload.metadata,
      modifierId: payload.modifier_id,
      originalCreatorId: payload.original_creator_id,
      originalUnitId: payload.original_unit_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      sequenceId: payload.sequence_id,
      taxonomy: payload.taxonomy,
      title: payload.title,
      unitId: payload.unit_id,
      updatedAt: payload.updated_at
    };
    return content;
  }

  /**
   * @function normalizeLessons
   * Method to normalize lesson summary
   */
  private normalizeLessons(payload): Array<UnitLessonSummaryModel> {
    return payload.map((item) => {
      const lesson: UnitLessonSummaryModel = {
        assessmentCount: item.assessment_count,
        collectionCount: item.collection_count,
        externalAssessmentCount: item.external_assessment_count,
        externalCollectionCount: item.external_collection_count,
        lessonId: item.lesson_id,
        oaCount: item.oa_count,
        sequenceId: item.sequence_id,
        title: item.title
      };
      return lesson;
    });
  }
}
