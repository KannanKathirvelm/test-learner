import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';
import { AssessmentReportComponent } from '@shared/components/reports/assessment-report/assessment-report.component';
import { CollectionReportComponent } from '@shared/components/reports/collection-report/collection-report.component';
import { OfflineActivityReportComponent } from '@shared/components/reports/offline-activity-report/offline-activity-report.component';
import { EVENTS } from '@shared/constants/events-constants';
import { ASSESSMENT, ASSESSMENT_EXTERNAL, COLLECTION, COLLECTION_EXTERNAL } from '@shared/constants/helper-constants';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  public sessionId = new BehaviorSubject(null);
  public startTime: number;

  constructor(
    private modalCtrl: ModalController,
    private performanceService: PerformanceService,
    private parseService: ParseService,
  ) {
  }

  /**
   * @function showReport
   * This method is used to show report based on type
   */
  public showReport(context, completedCollection = null, completedPerformance = null) {
    this.startTime = moment().valueOf();
    if (context.collectionType === ASSESSMENT || context.collectionType === ASSESSMENT_EXTERNAL) {
      this.showAssessmentReport(context, completedCollection, completedPerformance);
    } else if (context.collectionType === COLLECTION || context.collectionType === COLLECTION_EXTERNAL) {
      this.showCollectionReport(context, completedCollection, completedPerformance);
    } else {
      this.showOfflineActivityReport(context);
    }
  }

  /**
   * @function showCourseMapReport
   * This method is used to show course map report
   */
  public showCourseMapReport(component, context, className) {
    this.modalCtrl.create({
      component,
      cssClass: className,
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: {
        classInfo: context
      }
    }).then((modal) => {
      modal.present();
    });
  }

  /**
   * @function showLessonReport
   * This method is used to show lesson level report
   */
  public showLessonReport(component, context, className) {
    this.modalCtrl.create({
      component,
      cssClass: className,
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: {
        classInfo: context
      }
    }).then((modal) => {
      modal.present();
    });
  }

  /**
   * @function showAssessmentReport
   * This method is used to show assessment report
   */
  public showAssessmentReport(context, completedCollection, completedPerformance) {
    const performance = context.performance ? context.performance : {};
    const userPerformance = {
      eventTime: performance.eventTime ? performance.eventTime : null,
      id: performance.id,
      reaction: performance.reaction ? performance.reaction : null,
      score: performance.score,
      timespent: performance.timeSpent,
      type: context.collectionType,
      sessionId: performance.sessionId
    };
    this.modalCtrl.create({
      component: AssessmentReportComponent,
      cssClass: 'assessment-modal',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: {
        contentId: context.collectionId,
        sessionId: context.sessionId ? context.sessionId : context.collectionType === ASSESSMENT
          ? this.sessionId : null,
        contentSource: context.contentSource,
        collectionType: context.collectionType,
        showCorrectAnswer: context.showCorrectAnswer,
        userPerformance,
        reportCollection: completedCollection ? completedCollection : null,
        reportPerformance: completedPerformance ? completedPerformance : null,
        isPreview: context.isPreview,
        isClassProgressReport: context.isClassProgressReport
      }
    }).then((modal) => {
      modal.present();
      if (!context.isPreview && !context.sessionId && context.collectionType === ASSESSMENT && !context.isClassProgressReport) {
        const params = {
          classId: context.classId,
          courseId: context.courseId,
          unitId: context.unitId,
          lessonId: context.lessonId
        };
        this.performanceService.fetchUserSessionIds(
          ASSESSMENT,
          context.collectionId,
          params
        ).then((sessionIds) => {
          const sessionId = this.getLastSessionId(sessionIds);
          this.sessionId.next(sessionId);
        });
      }
      modal.onWillDismiss().then(() => {
        this.sessionId.next(null);
        this.trackCollectionReportEvent(context);
      });
    });
  }


  /**
   * @function trackCollectionReportEvent
   * This method is used to track the collection report
   */
  public trackCollectionReportEvent(context) {
    const params = this.getCollectionReportContext(context);
    this.parseService.trackEvent(EVENTS.VIEW_COLLECTION_REPORT, params);
  }

  /**
   * @function getProficiencyChartContext
   * This method is used to get the context for collection report event
   */
  private getCollectionReportContext(context) {
    const endTime = moment().valueOf();
    return {
      classId: context.classId,
      pathId: context.pathId,
      collectionId: context.collectionId,
      courseId: context.courseId,
      courseName: context.course_title,
      unitId: context.unitId,
      contentSource: context.contentSource,
      lessonId: context.lessonId,
      collectionType: context.collectionType,
      collectionTitle: context.title,
      startTime: this.startTime,
      endTime
    };
  }

  /**
   * @function showCollectionReport
   * This method is used to show collection report
   */
  public showCollectionReport(context, completedCollection, completedPerformance) {
    const performance = context.performance ? context.performance : {};
    const userPerformance = {
      eventTime: performance.eventTime ? performance.eventTime : null,
      id: performance.id,
      reaction: performance.reaction ? performance.reaction : null,
      score: performance.score,
      timespent: performance.timeSpent,
      type: context.collectionType,
      sessionId: performance.sessionId
    };
    const params = {
      classId: context.classId,
      courseId: context.courseId,
      unitId: context.unitId,
      lessonId: context.lessonId,
      activityDate: context.activityDate ? context.activityDate : null,
      endDate: context.endDate ? context.endDate : null,
      pathId: context.pathId ? context.pathId : null,
      sessionId: performance.sessionId,
      isPreview: context.isPreview
    };
    this.modalCtrl.create({
      component: CollectionReportComponent,
      cssClass: 'collection-modal',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: {
        contentId: context.collectionId,
        context: params,
        contentSource: context.contentSource,
        isSuggestion: context.isSuggestion || false,
        collectionType: context.collectionType,
        userPerformance,
        reportCollection: completedCollection ? completedCollection : null,
        reportPerformance: completedPerformance ? completedPerformance : null,
        isClassProgressReport: context.isClassProgressReport
      }
    }).then((modal) => {
      modal.onWillDismiss().then(() => {
        this.trackCollectionReportEvent(context);
      });
      modal.present();
    });
  }

  /**
   * @function showOfflineActivityReport
   * This method is used to show offline activity report
   */
  public showOfflineActivityReport(context) {
    const params = {
      activityId: context.collectionId,
      contentId: context.contentId,
      classId: context.classId,
      isPreview: context.isPreview
    };
    this.modalCtrl.create({
      component: OfflineActivityReportComponent,
      cssClass: 'offline-activity-modal',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: {
        context: params
      }
    }).then((modal) => {
      modal.onWillDismiss().then(() => {
        this.trackCollectionReportEvent(context);
      });
      modal.present();
    });
  }

  /**
   * @function getLastSessionId
   * This method is used to get last session id
   */
  public getLastSessionId(sessionIds) {
    sessionIds.sort(function(a, b) {
      return b.sequence - a.sequence;
    });
    return sessionIds[0].sessionId;
  }
}
