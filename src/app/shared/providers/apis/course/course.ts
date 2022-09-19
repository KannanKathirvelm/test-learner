import { Injectable } from '@angular/core';
import { SkippedContents } from '@app/shared/models/milestone/milestone';
import { environment } from '@environment/environment';
import { DEFAULT_IMAGE } from '@shared/constants/helper-constants';
import { CourseContentVisibility, CourseModel, FeaturedCourseListModel, NavigatorProgram } from '@shared/models/course/course';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root',
})
export class CourseProvider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1/courses';
  private classNamespace = 'api/nucleus/v1/classes';
  private rescopeNamespace = 'api/rescope';
  private programNamespace = 'api/nucleus/v1/lookups';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCourseList
   * This method is used to fetch the course list
   */
  public fetchCourseList(courseIDs) {
    const endpoint = `${this.namespace}/list`;
    const param = {
      ids: courseIDs.join(),
    };
    return this.httpService
      .get<CourseModel>(endpoint, param)
      .then((res) => {
        const response = res.data;
        return response.courses.map((course) => {
          return this.normalizeCourseCard(course);
        });
      });
  }

  /**
   * @function fetchCourseById
   * This method is used to fetch the course by id
   */
  public fetchCourseById(courseID) {
    const endpoint = `${this.namespace}/${courseID}`;
    return this.httpService.get(endpoint).then((res) => {
      return res.data;
    });
  }

  /**
   * Normalize a Course card response
   */
  public normalizeCourseCard(payload) {
    const basePath = this.sessionService.userSession.cdn_urls
      .content_cdn_url;
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : DEFAULT_IMAGE;
    const course: CourseModel = {
      id: payload.id,
      thumbnailUrl,
      title: payload.title,
      ownerId: payload.owner_id,
      version: payload.version,
      subject: payload.subject_bucket,
    };
    return course;
  }

  /**
   * @function fetchCoursesWithContentVisibility
   * Method to fetch courses with content visibility
   */
  public fetchCoursesWithContentVisibility(classId) {
    const endpoint = `${this.classNamespace}/${classId}/courses`;
    return this.httpService.get<CourseContentVisibility>(endpoint).then((res) => {
      const result = res.data;
      return this.normalizeCourseVisibilityContent(result.course);
    });
  }

  /**
   * @function normalizeCourseVisibilityContent
   * Method to normalize visibility content of collections/assessments
   */
  private normalizeCourseVisibilityContent(payload): CourseContentVisibility {
    let assessments = [];
    let collections = [];
    payload.units.map((unit) => {
      unit.lessons.map((lesson) => {
        if (lesson.assessments && lesson.assessments.length) {
          assessments = assessments.concat(lesson.assessments);
        }
        if (lesson.collections && lesson.collections.length) {
          collections = collections.concat(lesson.collections);
        }
      });
    });
    return {
      assessments,
      collections
    };
  }

  /**
   * @function getListOfCourseIds
   * Method to fetch course ids from the list of classes
   */
  public getListOfCourseIds(activeClasses, isClassCourse?) {
    const listOfActiveCourseIds = [];
    activeClasses.forEach((activeClass) => {
      if (activeClass.course_id) {
        if (!isClassCourse) {
          listOfActiveCourseIds.push(activeClass.course_id);
        } else {
          const classCourseId = {
            classId: activeClass.id,
            courseId: activeClass.course_id,
          };
          listOfActiveCourseIds.push(classCourseId);
        }
      }
    });
    return listOfActiveCourseIds;
  }

  /**
   * @function fetchFeaturedCourseList
   * Method to fetch featured course list
   */
  public fetchFeaturedCourseList(filterOutJoinedCourses = false) {
    const endpoint = `${this.namespace}/independent/list`;
    const params = { filterOutJoinedCourses };
    return this.httpService
      .get<FeaturedCourseListModel>(endpoint, params)
      .then((response) => {
        const result = response.data.courses;
        return this.normalizeFeaturedCourseList(result);
      });
  }

  /**
   * @function fetchSubProgramCourseList
   * Method to fetch sub program course list
   */
  public fetchSubProgramCourseList(filterOutJoinedCourses = false) {
    const endpoint = `${this.namespace}/independent/list`;
    const params = {
      filterOutJoinedCourses,
      navigatorProgram: true
    };
    return this.httpService
      .get<FeaturedCourseListModel>(endpoint, params)
      .then((response) => {
        const result = response.data.courses;
        return this.normalizeFeaturedCourseList(result);
      });
  }

  /**
   * @function normalizeFeaturedCourseList
   * Method to normalize featured course list
   */
  private normalizeFeaturedCourseList(
    payload
  ): Array<FeaturedCourseListModel> {
    return payload.map((item) => {
      const featuredCourse: FeaturedCourseListModel = {
        aggregatedTaxonomy: item.aggregated_taxonomy,
        collaborator: item.collaborator,
        collabaratorCount: item.collaborator
          ? item.collaborator.length
          : 0,
        description: item.description,
        summary: item.summary,
        additionalInfo: item.settings.additional_info,
        id: item.id,
        learnerCount: item.learner_count,
        originalCourseId: item.original_course_id,
        originalCreatorId: item.original_creator_id,
        ownerId: item.owner_id,
        primaryLanguage: item.primary_language,
        publishStatus: item.publish_status,
        sequenceId: item.sequence_id,
        settings: item.settings,
        subjectBucket: item.subject_bucket,
        taxonomy: item.taxonomy,
        thumbnail: item.thumbnail
          ? `${environment.CDN_URL}/${item.thumbnail}`
          : DEFAULT_IMAGE,
        title: item.title,
        visibleOnProfile: item.visible_on_profile,
        hasJoined: item.has_joined,
        isPublicClass: true,
        defaultGradeLevel: item.default_grade_level,
        navigatorSubProgramId: item.navigator_sub_program_id,
        navigatorProgramInfo: item.navigator_program_info
      };
      return featuredCourse;
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
      return this.normalizeSkippedContentsList(res.data);
    });
  }

  /**
   * @function normalizeSkippedContentsList
   * Method to normalize skipped content list
   */
  private normalizeSkippedContentsList(payload): SkippedContents {
    const skippedContents: SkippedContents = {
      assessments: payload.assessment || [],
      assessmentsExternal: payload.assessmentsExternal || [],
      collections: payload.collections || [],
      collectionsExternal: payload.collectionsExternal || [],
      lessons: payload.lessons || [],
      units: payload.units || []
      };
    return skippedContents;
  }

  /**
   * @function fetchNavigatorPrograms
   * Method used to fetch navigator programs
   */
  public fetchNavigatorPrograms(refresh = true): Promise<Array<NavigatorProgram>> {
    const endpoint = `${this.programNamespace}/navigator-programs`;
    const params = { refresh };
    return this.httpService
    .get<NavigatorProgram>(endpoint, params).then((response) => {
      return this.normalizeNavigatorPrograms(response.data);
    });
  }

  /**
   * @function normalizeNavigatorPrograms
   * Method to normalize navigator programs
   */
  private normalizeNavigatorPrograms(payload) {
    const navigatorProgram = payload.navigatorPrograms || [];
    return navigatorProgram.map((item) => {
      const navigatorPrograms: NavigatorProgram = {
        description: item.description,
        id: item.id,
        sequence: item.sequence,
        title: item.title,
        images: item.images
      };
      return navigatorPrograms;
    });
  }

  /**
   * @function fetchNavigatorSubProgram
   * This method is used to fetch navigator sub programs
   */
  public fetchNavigatorSubProgram(refresh = true): Promise<Array<NavigatorProgram>> {
    const endpoint = `${this.programNamespace}/navigator-sub-programs`;
    const params = { refresh };
    return this.httpService.get<any>(endpoint, params).then((response) => {
      return this.normalizeSubProgram(response.data.navigatorSubPrograms);
    });
  }

  /**
   * @function normalizeSubProgram
   * This method is used to normalize the navigator sub programs
   */
  private normalizeSubProgram(payload): Array<NavigatorProgram> {
    const subPrograms: Array<NavigatorProgram> = [];
    payload.forEach((data) => {
      const context = {
        id: data.id,
        title: data.title,
        description: data.description,
        images: data.images,
        navigatorProgramId: data.navigator_program_id,
        sequence: data.sequence
      };
      subPrograms.push(context);
    });
    return subPrograms;
  }
}

