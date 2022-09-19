import { Injectable } from '@angular/core';
import {
  ClassesModel,
  ClassMembersGrade,
  ClassModel,
  TeacherDetailsModel,
} from '@shared/models/class/class';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root',
})
export class ClassProvider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus';
  private forceCalculateNameSpace = 'api/skyline-initial/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private httpService: HttpService,
    private session: SessionService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchClassList
   * @returns {ClassModel}
   * This method is used to fetch the class list
   */
  public fetchClassList() {
    const endpoint = `${this.namespace}/v1/classes`;
    const params = { excludeNotStartedPublicClass: true, excludeInCompleteClass: true };
    return this.httpService.get<ClassesModel>(endpoint, params).then((result) => {
      return this.normalizeClasses(result.data);
    });
  }

  /**
   * @function normalizeClasses
   * Method is used to normalize classes
   */
  private normalizeClasses(payload): ClassesModel {
    const classList: ClassesModel = {
      classes: this.normalizeClass(payload.classes),
      collaborator: payload.collaborator,
      member: payload.member,
      memberCount: payload.member_count,
      owner: payload.owner,
      teacherDetails: this.normalizeTeacherDetails(
        payload.teacher_details
      )
    };
    return classList;
  }

  /**
   * @function joinClass
   * This method is used to join a class
   */
  public joinClass(code) {
    const endpoint = `${this.namespace}/v1/classes/${code}/members`;
    return this.httpService.put(endpoint, {});
  }

  /**
   * @function joinPublicClass
   * This method is used to join a public class
   */
  public joinPublicClass(courseDetail) {
    const endpoint = `${this.namespace}/v1/classes/public/course/${courseDetail.courseId}/members`;
    const params = {
    };
    if (courseDetail.gradeLowerBound) {
      params['grade_lower_bound'] = courseDetail.gradeLowerBound;
    }
    if (courseDetail.gradeUpperBound) {
      params['grade_upper_bound'] = courseDetail.gradeUpperBound;
    }
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function forceCalculateIlp
   * This method is used to update a force calculate ilp
   */
  public forceCalculateIlp(classId, userId) {
    const endpoint = `${this.forceCalculateNameSpace}/calculate`;
    const params = {
      classId,
      users: [
        userId
      ]
    };
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function rerouteSetting
   * This method is used to update reroute setting
   */
  public rerouteSetting(classId, gradeUpperBound, gradeLowerBound?, forceCalculateIlp?, gradeLevel?) {
    const endpoint = `${this.namespace}/v1/classes/${classId}/members/settings/reroute`;
    const studentSetting = {
      users: [
        {
          user_id: this.session.userSession.user_id,
          grade_upper_bound: Number(gradeUpperBound),
          grade_lower_bound: Number(gradeLowerBound),
          grade_level: gradeLevel ? Number(gradeLevel) : undefined,
          force_calculate_ilp: forceCalculateIlp
        },
      ],
    };
    return this.httpService.put(endpoint, studentSetting);
  }

  /**
   * @function fetchSkylineInitialState
   * Method is used to fetch state
   */
  public fetchSkylineInitialState(classId: string) {
    const endpoint = 'api/skyline-initial/v1/state';
    return this.httpService
      .post(endpoint, { classId })
      .then((stateResponse) => {
        return stateResponse.data;
      });
  }

  /**
   * @function fetchClassMembers
   * Method is used to fetch class members
   */
  public fetchClassMembers(classId: string) {
    const endpoint = `${this.namespace}/v1/classes/${classId}/members`;
    return this.httpService
      .get<Array<ClassMembersGrade>>(endpoint)
      .then((response) => {
        return this.normalizeClassMembers(
          response.data.member_grade_bounds
        );
      });
  }

  /**
   * @function normalizeClassMembers
   * Method is used to normalize class members
   */
  private normalizeClassMembers(payload): Array<ClassMembersGrade> {
    return payload.map((item: ClassMembersGrade) => {
      const classMembersKey = Object.keys(item);
      const classMember: ClassMembersGrade = {
        userId: `${classMembersKey}`,
        bounds: {
          gradeLevel: item[`${classMembersKey}`].grade_level,
          gradeLowerBound:
            item[`${classMembersKey}`].grade_lower_bound,
          gradeUpperBound:
            item[`${classMembersKey}`].grade_upper_bound,
        },
      };
      return classMember;
    });
  }

  /**
   * Normalize teacher details
   * @param {class} payload
   * @return {class}
   */
  private normalizeTeacherDetails(payload): Array<TeacherDetailsModel> {
    return payload.map((item) => {
      const teacherDetails: TeacherDetailsModel = {
        email: item.email,
        first_name: item.first_name,
        id: item.id,
        last_name: item.last_name,
        roster_global_userid: item.roster_global_userid,
        thumbnail: item.thumbnail,
      };
      return teacherDetails;
    });
  }

  /**
   * Normalize class
   */
  private normalizeClass(payload): Array<ClassModel> {
    return payload.map((item) => {
      return this.normalizeClassModel(item);
    });
  }

  /**
   * @function fetchClassById
   * Method to fetch class based on Id
   */
  public fetchClassById(id: string) {
    const endpoint = `${this.namespace}/v1/classes/${id}`;
    return this.httpService.get<ClassModel>(endpoint).then((res) => {
      return this.normalizeClassModel(res.data);
    });
  }

  /**
   * Normalize class model
   */
  private normalizeClassModel(classResult) {
    const result: ClassModel = {
      class_sharing: classResult.class_sharing,
      code: classResult.code,
      collaborator: classResult.collaborator,
      content_visibility: classResult.content_visibility,
      course_id: classResult.course_id,
      course_title: classResult.course_title,
      course_version: classResult.course_version,
      cover_image: classResult.cover_image,
      created_at: classResult.created_at,
      creator_id: classResult.creator_id,
      description: classResult.description,
      end_date: classResult.end_date,
      force_calculate_ilp: classResult.force_calculate_ilp,
      gooru_version: classResult.gooru_version,
      grade: classResult.grade,
      grade_current: classResult.grade_current,
      grade_lower_bound: classResult.grade_lower_bound,
      grade_upper_bound: classResult.grade_upper_bound,
      greeting: classResult.greeting,
      id: classResult.id,
      is_archived: classResult.is_archived,
      milestone_view_applicable:
        classResult.milestone_view_applicable,
      min_score: classResult.min_score,
      primary_language: classResult.primary_language,
      preference: classResult.preference,
      roster_id: classResult.roster_id,
      route0_applicable: classResult.route0_applicable,
      setting: classResult.setting,
      title: classResult.title,
      updated_at: classResult.updated_at,
      isPublic: classResult.is_public,
      isPremiumClass: this.isPremiumClass(classResult)
    };
    return result;
  }

  /**
   * @function isPremiumClass
   * Method to check whether premium or non-premium
   */
  private isPremiumClass(classData) {
    const classSetting = classData.setting;
    return classSetting ? classSetting['course.premium'] === true : false;
  }
}
