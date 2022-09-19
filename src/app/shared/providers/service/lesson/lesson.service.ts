import { Injectable } from '@angular/core';
import { SkippedContents } from '@app/shared/models/milestone/milestone';
import { Store } from '@ngrx/store';
import { UnitLessonSummaryModel } from '@shared/models/lesson/lesson';
import { CourseMapProvider } from '@shared/providers/apis/course-map/course-map';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CourseService } from '@shared/providers/service/course/course.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { setUnitLesson } from '@shared/stores/actions/unit.action';
import { getLessonByUnitId } from '@shared/stores/reducers/unit.reducer';
import { cloneObject, removeDuplicateValues } from '@shared/utils/global';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  public lessonStoreSubscription: AnonymousSubscription;

  constructor(
    private courseMapProvider: CourseMapProvider,
    private store: Store,
    private performanceService: PerformanceService,
    private courseService: CourseService,
    private classService: ClassService
  ) { }


  /**
   * @function fetchUnitLessonList
   * This Method is used to send lesson list
   */
  public fetchUnitLessonList(classId, courseId, unitId, lessons = []) {
    const lessonPromise = lessons.length ?  Promise.resolve(lessons) : this.fetchUnitLessons(courseId, unitId);
    return lessonPromise.then((response: Array<UnitLessonSummaryModel>) => {
      const lessonList = response;
      if (this.classService.class.setting && this.classService.class.setting['course.premium']) {
        return this.courseService.getSkippedContents(classId, courseId).then((skippedContents: SkippedContents) => {
          const skippedLessons = skippedContents ? skippedContents.lessons : [];
          if (lessonList && lessonList.length) {
            lessonList.forEach((lesson) => {
              lesson.isRescoped = skippedLessons.includes(lesson.lessonId);
              return lesson;
            });
          }
          const filtertedLessons = lessonList;
          if (filtertedLessons.length) {
            this.performanceService.fetchUnitLessonPerformance(classId, courseId, unitId, lessonList);
          }
          return filtertedLessons;
        });
      } else {
        if (lessonList.length) {
          this.performanceService.fetchUnitLessonPerformance(classId, courseId, unitId, lessonList);
        }
        return lessonList;
      }
    });
  }

  /**
   * @function fetchUnitLessons
   * This Method is used to get unit lessons
   */
  public fetchUnitLessons(courseId, unitId) {
    return new Promise((resolve, reject) => {
      this.lessonStoreSubscription = this.store.select(getLessonByUnitId(unitId)).subscribe((lessonData) => {
        if (!lessonData) {
          return this.courseMapProvider.fetchUnitLessons(courseId, unitId).then((lessonResult) => {
            const lessons = removeDuplicateValues(lessonResult.lessonSummary, 'lessonId');
            this.store.dispatch(setUnitLesson({ key: unitId, data: lessons }));
          });
        } else {
          resolve(cloneObject(lessonData));
        }
      });
    });
  }

  /**
   * @function unSubscribeEvent
   * This Method is used to unsubscribe the store events
   */
  public unSubscribeEvent() {
    if (this.lessonStoreSubscription) {
      this.lessonStoreSubscription.unsubscribe();
    }
  }
}
