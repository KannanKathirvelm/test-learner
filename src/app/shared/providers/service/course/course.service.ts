import { Injectable } from '@angular/core';
import { FeaturedCourseListModel, NavigatorProgram } from '@app/shared/models/course/course';
import { setSkippedContent } from '@app/shared/stores/actions/milestone.action';
import { getSkippedContentsByClassId } from '@app/shared/stores/reducers/milestone.reducer';
import { Store } from '@ngrx/store';
import { CourseProvider } from '@shared/providers/apis/course/course';
import { setFeaturedCourse } from '@shared/stores/actions/course.action';
import { getFeaturedCourse } from '@shared/stores/reducers/course.reducer';
import { cloneObject } from '@shared/utils/global';
import { BehaviorSubject, Observable } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private featuredCourseStoreSubscription: AnonymousSubscription;
  public skippedContentStoreSubscription: AnonymousSubscription;
  private navigatorSubProgramSubject: BehaviorSubject<Array<NavigatorProgram>>;
  private navigatorProgramCourseSubject: BehaviorSubject<Array<FeaturedCourseListModel>>;
  public navigatorProgramCourseList: Observable<Array<FeaturedCourseListModel>>;

  constructor(
    private courseProvider: CourseProvider,
    private store: Store
  ) {
    this.navigatorSubProgramSubject = new BehaviorSubject<Array<NavigatorProgram>>(null);
    this.navigatorProgramCourseSubject = new BehaviorSubject<Array<FeaturedCourseListModel>>(null);
    this.navigatorProgramCourseList = this.navigatorProgramCourseSubject.asObservable();
  }

  /**
   * @function fetchFeaturedCourseList
   * This Method is used to get list of featured course
   */
  public fetchFeaturedCourseList(coursesByGrades?, userAge?) {
    return this.courseProvider.fetchFeaturedCourseList().then((featuredCourses) => {
      const filterJoinedCourse = featuredCourses.filter((item) => item.hasJoined);
      const filterNotJoinedCourse = featuredCourses.filter((item) => !item.hasJoined);
      const featuredCourseGroupList = this.groupFeaturedCourses(filterNotJoinedCourse);
      featuredCourseGroupList.forEach((featuredCourse) => {
        if (featuredCourse.categoryId) {
          const featuredCourseGrades = this.getCoursesList(featuredCourse, coursesByGrades);
          if (featuredCourseGrades && featuredCourseGrades.length) {
            const matchedAgeCourse = featuredCourseGrades.reduce((prev, curr) => {
              return (Math.abs(curr['ageBefore'] - userAge) < Math.abs(prev['ageBefore'] - userAge) ? curr : prev);
            });
            const courseIndex = featuredCourse.courses.findIndex((course) => {
              const gradeCurrent = course.settings.grade_current;
              return gradeCurrent === matchedAgeCourse.gradeId;
            });
            const courseList = featuredCourse.courses;
            const copyOfGrades = cloneObject(courseList);
            const matchedCourse = copyOfGrades[courseIndex];
            const lastIndex = courseList.length;
            courseList.splice(courseIndex, (lastIndex - courseIndex));
            courseList.reverse();
            courseList.splice(courseIndex, 1);
            courseList.splice(0, 0, matchedCourse);
            const balanceCourseCount = copyOfGrades.length - (courseIndex + 1);
            Array.from(Array(balanceCourseCount)).map((item, index) => {
              const currentIndex = index + 1;
              const lastObject = copyOfGrades[courseIndex + currentIndex];
              courseList.splice(currentIndex, 0, lastObject);
            });
          }
        }
      });
      if (featuredCourseGroupList && featuredCourseGroupList.length) {
        if (filterJoinedCourse && filterJoinedCourse.length) {
          featuredCourseGroupList.push({
            categoryId: null,
            categoryTitle: null,
            framework: null,
            subjectId: null,
            subjectTitle: null,
            courses: filterJoinedCourse,
            isJoinedClass: true
          });
        }
      }
      this.store.dispatch(setFeaturedCourse({ data: featuredCourses }));
      return cloneObject(featuredCourseGroupList);
    });
  }

  /**
   * @function fetchSubProgramCourseList
   * This Method is used to fetch sub program course list
   */
  public fetchSubProgramCourseList(filterOutJoinedCourses?) {
    return this.courseProvider.fetchSubProgramCourseList(filterOutJoinedCourses).then((featuredCourses) => {
      this.navigatorProgramCourseSubject.next(featuredCourses);
      const filterJoinedCourse = featuredCourses.filter((item) => item.hasJoined);
      const filterNotJoinedCourse = featuredCourses.filter((item) => !item.hasJoined);
      const featuredCourseGroupList = this.groupFeaturedCourses(filterNotJoinedCourse);
      if (featuredCourseGroupList && featuredCourseGroupList.length) {
        if (filterJoinedCourse && filterJoinedCourse.length) {
          featuredCourseGroupList.push({
            categoryId: null,
            categoryTitle: null,
            framework: null,
            subjectId: null,
            subjectTitle: null,
            courses: filterJoinedCourse,
            isJoinedClass: true
          });
        }
      }
      this.store.dispatch(setFeaturedCourse({ data: featuredCourses }));
      return cloneObject(featuredCourseGroupList);
    });
  }

  /**
   * @function getCoursesList
   * This Method is used to get course list
   */
  public getCoursesList(featuredCourse, coursesByGrades) {
    const featuredCourseGrades = [];
    featuredCourse.courses.forEach((item) => {
      const framework = item.settings.framework;
      const gradeCurrent = item.settings.grade_current;
      const courses = coursesByGrades[framework];
      if (courses) {
        const recommenedCourse = courses.find((course) => {
          return course.gradeId === gradeCurrent;
        });
        if (recommenedCourse) {
          featuredCourseGrades.push(recommenedCourse);
        }
      }
    });
    return featuredCourseGrades;
  }

  /**
   * @function fetchCourseById
   * This Method is used to course by id
   */
  public fetchCourseById(courseId) {
    return this.courseProvider.fetchCourseById(courseId);
  }

  /**
   * @function getFeaturedCourse
   * This Method is used to get the featured course
   */
  public getFeaturedCourse() {
    return new Promise((resolve, reject) => {
      this.featuredCourseStoreSubscription = this.store.select(getFeaturedCourse())
        .subscribe((featuredCourse) => {
          resolve(cloneObject(featuredCourse.data));
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @function fetchCourses
   * This Method is used to fetch courses with content visibility
   */
  public fetchCoursesWithContentVisibility(classId) {
    return this.courseProvider.fetchCoursesWithContentVisibility(classId);
  }

  /**
   * @function groupFeaturedCourses
   * This Method is used to group the featured course
   */
  public groupFeaturedCourses(featuredCourses) {
    const groupedCategory = featuredCourses.reduce((lastValue, currentValue) => {
      if (currentValue && currentValue.additionalInfo) {
        const category = currentValue.additionalInfo.subject.id;
        lastValue[category] = lastValue[category] || [];
        lastValue[category].push(currentValue);
        return lastValue;
      } else {
        lastValue['course'] = lastValue['course'] || [];
        lastValue['course'].push(currentValue);
        return lastValue;
      }
    }, {});
    return Object.keys(groupedCategory).map((key) => {
      const courses = groupedCategory[key];
      const initialCourse = courses[0];
      const courseInfo = initialCourse.additionalInfo;
      const settings = initialCourse.settings;
      if (courseInfo) {
        return {
          categoryId: courseInfo.category.id,
          categoryTitle: courseInfo.category.title,
          subjectId: courseInfo.subject.id,
          subjectTitle: courseInfo.subject.title,
          framework: settings.framework,
          isJoinedClass: false,
          courses
        };
      }
      return {
        courses
      };
    });
  }

  /**
   * @function fetchNavigatorPrograms
   * This Method is used to fetch navigator programs
   */
  public fetchNavigatorPrograms() {
    return this.courseProvider.fetchNavigatorPrograms();
  }

  /**
   * @function fetchNavigatorSubProgram
   * This Method is used to fetch navigator sub program
   */
  public fetchNavigatorSubProgram() {
    return this.courseProvider.fetchNavigatorSubProgram().then((navigatorSubPrograms) => {
      this.navigatorSubProgramSubject.next(navigatorSubPrograms);
    });
  }

  get navigatorSubProgram() {
    return this.navigatorSubProgramSubject ? cloneObject(this.navigatorSubProgramSubject.value) : null;
  }

  get navigatorProgramCourse() {
    return this.navigatorProgramCourseSubject ? cloneObject(this.navigatorProgramCourseSubject.value) : null;
  }

  /**
   * @function unSubscribeEvent
   * This Method is used to un subscribe the store event
   */
  public unSubscribeEvent() {
    if (this.featuredCourseStoreSubscription) {
      this.featuredCourseStoreSubscription.unsubscribe();
    }
    if (this.skippedContentStoreSubscription) {
      this.skippedContentStoreSubscription.unsubscribe();
    }
  }

  /**
   * @function getSkippedContents
   * This Method is used to get skipped contents
   */
  public getSkippedContents(classId, courseId) {
    return new Promise((resolve, reject) => {
      this.skippedContentStoreSubscription = this.store.select(getSkippedContentsByClassId(classId)).subscribe((skippedContentData) => {
        if (!skippedContentData) {
          return this.courseProvider.fetchSkippedContents(classId, courseId).then((skippedContents) => {
            this.store.dispatch(setSkippedContent({ key: classId, data: skippedContents }));
          });
        } else {
          resolve(cloneObject(skippedContentData));
        }
      });
    });
  }
}
