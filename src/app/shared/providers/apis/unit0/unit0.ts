import { Injectable } from '@angular/core';
import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL,
  COLLECTION,
  COLLECTION_EXTERNAL,
  OFFLINE_ACTIVITY,
  PATH_TYPES,
} from '@shared/constants/helper-constants';
import { Unit0CollectionModel, Unit0LessonModel, Unit0Model } from '@shared/models/unit0/unit0';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { getDefaultImage } from '@shared/utils/global';


@Injectable({
  providedIn: 'root'
})
export class Unit0Provider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getUnit0List
   * This method is used to get the Unit0 details
   */
  public getUnit0List(classId: string, courseId: string) {
    const endpoint = `${this.namespace}/classes/${classId}/courses/${courseId}/unit0`;
    return this.httpService
      .get<Unit0Model>(endpoint)
      .then((res) => {
        return this.normalizeUnit0Milestones(res.data);
      });
  }

  /**
   * @function normalizeUnit0Milestones
   * This method is used to get the Unit0Milestones details
   */
  private normalizeUnit0Milestones(payload): Array<Unit0Model> {
    const unit0Content = payload.unit0 || [];
    return unit0Content.map((unit) => {
      const milestoneData: Unit0Model = {
        milestoneId: unit.milestone_id,
        sequenceId: unit.unit_sequence,
        milestoneTitle: unit.milestone_title || unit.unit_title,
        isUnit0: true,
        lessons: this.normalizeUnit0Lessons(unit),
        unitId: unit.unit_id,
        title: unit.unit_title
      };
      return milestoneData;
    });
  }

  /**
   * Normalize unit0 lessons
   * this method is used to serialize the unit0 lessons
   */
  private normalizeUnit0Lessons(unit): Array<Unit0LessonModel> {
    const lessonList = [];
    unit.lessons.forEach((lesson) => {
      const unit0Lesson: Unit0LessonModel = {
        collections: this.normalizeUnit0Collections(lesson.collections || []),
        lessonId: lesson.lesson_id,
        title: lesson.lesson_title,
        lessonSequence: lesson.sequence || null,
        lessonTitle: lesson.lesson_title,
        unitId: unit.unit_id,
        unitTitle: unit.unit_title,
        unitSequence: unit.unit_sequence,
      };
      lessonList.push(unit0Lesson);
    });
    return lessonList;
  }

  /**
   * Normalize unit0 collections
   * this method is used to serialize the unit0 collections
   */
  private normalizeUnit0Collections(collections): Array<Unit0CollectionModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return collections.map((collection) => {
      const route0Collection: Unit0CollectionModel = {
        id: collection.collection_id,
        collectionSequence: collection.collection_sequence,
        collectionType: collection.collection_type,
        format: collection.collection_type,
        pathId: collection.path_id,
        pathType: PATH_TYPES.UNIT0,
        title: collection.collection_title,
        thumbnailXS: collection.thumbnail ? `${cdnUrl}${collection.thumbnail}`
          : getDefaultImage(collection.collection_type),
        ctxPathId: collection.path_id,
        ctxPathType: PATH_TYPES.UNIT0,
        isVisible: true,
        isCollection: collection.collection_type === COLLECTION,
        isAssessment: collection.collection_type === ASSESSMENT,
        isExternalAssessment: collection.collection_type === ASSESSMENT_EXTERNAL,
        isExternalCollection: collection.collection_type === COLLECTION_EXTERNAL,
        isOfflineActivity: collection.collection_type === OFFLINE_ACTIVITY
      };
      return route0Collection;
    });
  }
}
