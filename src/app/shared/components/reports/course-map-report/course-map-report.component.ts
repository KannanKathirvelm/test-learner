import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { EVENTS } from '@shared/constants/events-constants';
import { PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { UnitSummaryModel } from '@shared/models/course-map/course-map';
import { UnitPerformance } from '@shared/models/performance/performance';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import * as moment from 'moment';

@Component({
  selector: 'app-course-map-report',
  templateUrl: './course-map-report.component.html',
  styleUrls: ['./course-map-report.component.scss'],
})
export class CourseMapReportComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  public classId: string;
  public courseId: string;
  public unitList: Array<UnitSummaryModel>;
  public courseMapPerformance: UnitPerformance;
  public courseTitle: string;
  public isLoaded: boolean;
  public startTime: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private performanceService: PerformanceService,
    private parseService: ParseService
  ) {
    const classInfo = this.navParams.get('classInfo');
    this.classId = classInfo.classId;
    this.courseId = classInfo.courseId;
    this.unitList = classInfo.unitList;
    this.courseTitle = classInfo.courseTitle;
  }

  // -------------------------------------------------------------------------
  // lifecycle methods

  public ngOnInit() {
    this.startTime = moment().valueOf();
    this.fetchCourseMapPerformance();
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnDestroy() {
    this.trackCourseMapReportEvent();
  }

  /**
   * @function trackCourseMapReportEvent
   * This method is used to track the view course map report event
   */
  public trackCourseMapReportEvent() {
    const context = this.getCourseMapReportContext();
    this.parseService.trackEvent(EVENTS.VIEW_COURSE_REPORT, context);
  }

  /**
   * @function getCourseMapReportContext
   * This method is used to get the context for course map report event
   */
  private getCourseMapReportContext() {
    const endTime = moment().valueOf();
    return {
      classId: this.classId,
      courseId: this.courseId,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      startTime: this.startTime,
      courseTitle: this.courseTitle,
      endTime
    };
  }

  /**
   * @function closeReport
   * This method is used to close report
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function fetchCourseMapPerformance
   * This method is used to fetch the course map performance
   */
  public fetchCourseMapPerformance() {
    this.isLoaded = false;
    this.performanceService.fetchUnitPerformance(this.classId, this.courseId).then((response) => {
      const coursePerformance = response;
      this.courseMapPerformance = coursePerformance && coursePerformance.length ? coursePerformance[0] : null;
      this.isLoaded = true;
    });
  }

}
