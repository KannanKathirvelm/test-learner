import { Injectable } from '@angular/core';
import { SkippedContents } from '@app/shared/models/milestone/milestone';
import { Store } from '@ngrx/store';
import { CourseMapReportComponent } from '@shared/components/reports/course-map-report/course-map-report.component';
import { UnitSummaryModel } from '@shared/models/course-map/course-map';
import { CourseMapProvider } from '@shared/providers/apis/course-map/course-map';
import { Unit0Provider } from '@shared/providers/apis/unit0/unit0';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CourseService } from '@shared/providers/service/course/course.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { ReportService } from '@shared/providers/service/report/report.service';
import { setUnit } from '@shared/stores/actions/unit.action';
import { getUnitByCourseId } from '@shared/stores/reducers/unit.reducer';
import { cloneObject } from '@shared/utils/global';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable({
  providedIn: 'root'
})
export class CourseMapService {

  // -------------------------------------------------------------------------
  // Properties

  public unitStoreSubscriptions: Array<AnonymousSubscription>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private courseMapProvider: CourseMapProvider,
    private store: Store,
    private reportService: ReportService,
    private performanceService: PerformanceService,
    private courseService: CourseService,
    private unit0Provider: Unit0Provider,
    private classService: ClassService
  ) {
    this.unitStoreSubscriptions = [];
  }

  /**
   * @function fetchUnitList
   * This Method is used to get unit list
   */
  public fetchUnitList(classId, courseId, isForceReload = false) {
    return this.fetchCourseDetailsById(courseId, isForceReload).then((response: Array<UnitSummaryModel>) => {
      return this.unit0Provider.getUnit0List(classId, courseId).then(unit0Content => {
        const unitList = [...unit0Content, ...response];
        if (this.classService.class.setting && this.classService.class.setting['course.premium']) {
          return this.courseService.getSkippedContents(classId, courseId).then((skippedContents: SkippedContents) => {
            const skippedUnits = skippedContents ? skippedContents.units : [];
            unitList.forEach((unit) => {
              unit.isRescoped = skippedUnits.includes(unit.unitId);
            });
            if (unitList.length) {
              this.performanceService.fetchUnitPerformance(classId, courseId, unitList);
            }
            return unitList;
          });
        } else {
          if (unitList.length) {
            this.performanceService.fetchUnitPerformance(classId, courseId, unitList);
          }
          return unitList;
        }
      });
    });
  }

  /**
   * @function fetchCourseDetailsById
   * This Method is used to get course detail by courseId
   */
  public fetchCourseDetailsById(courseId, isForceReload) {
    return new Promise((resolve, reject) => {
      if (isForceReload) {
        this.courseMapProvider.fetchCourseDetailsById(courseId).then((result) => {
          const units = result.unitSummary;
          this.store.dispatch(setUnit({ key: courseId, data: units }));
          resolve(cloneObject(units));
        });
      } else {
        const unitStoreSubscription = this.store.select(getUnitByCourseId(courseId)).subscribe((unitData) => {
          if (!unitData) {
            this.courseMapProvider.fetchCourseDetailsById(courseId).then((result) => {
              const units = result.unitSummary;
              this.store.dispatch(setUnit({ key: courseId, data: units }));
            });
          } else {
            resolve(cloneObject(unitData));
          }
        }, (error) => {
          reject(error);
        });
        this.unitStoreSubscriptions.push(unitStoreSubscription);
      }
    });
  }

  /**
   * @function openCourseMapReport
   * This Method is used to open course map report
   */
  public openCourseMapReport(params, className) {
    this.reportService.showCourseMapReport(CourseMapReportComponent, params, className);
  }

  /**
   * @function fetchCoursesWithContentVisibility
   * This Method is used to fetch content visibility of course
   */
  public fetchCoursesWithContentVisibility(classId) {
    return this.courseService.fetchCoursesWithContentVisibility(classId);
  }

  /**
   * @function unSubscribeEvent
   * This Method is used to unsubscribe the store events
   */
  public unSubscribeEvent() {
    if (this.unitStoreSubscriptions) {
      this.unitStoreSubscriptions.forEach((unitStoreSubscription) => {
        unitStoreSubscription.unsubscribe();
      });
    }
  }
}
