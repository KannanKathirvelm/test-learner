import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environment/environment';
import { TranslateService } from '@ngx-translate/core';
import { EVENTS } from '@shared/constants/events-constants';
import { PATH_TYPES, PLAYER_EVENT_SOURCE, SUGGESTION_SCOPE } from '@shared/constants/helper-constants';
import { routerPath } from '@shared/constants/router-constants';
import { NotificationListModel } from '@shared/models/notification/notification';
import { NotificationProvider } from '@shared/providers/apis/notification/notification';
import { LoadingService } from '@shared/providers/service/loader.service';
import { NotificationService } from '@shared/providers/service/notification/notification.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { ReportService } from '@shared/providers/service/report/report.service';
import { ToastService } from '@shared/providers/service/toast.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  @Input() public classId: string;
  public notificationList: NotificationListModel;
  public scrollDepthTriggered: boolean;
  public isLearner: boolean;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private loader: LoadingService,
    private toastService: ToastService,
    private translate: TranslateService,
    private notificationProvider: NotificationProvider,
    private reportService: ReportService,
    private playerService: PlayerService,
    private parseService: ParseService,
  ) {
    this.scrollDepthTriggered = false;
  }
  @HostListener('scroll', ['$event'])
  public async onScroll(event) {
    const element = event.target;
    if (element.offsetHeight + Math.round(element.scrollTop) >= element.scrollHeight) {
      if (this.scrollDepthTriggered) {
        return;
      }
      this.scrollDepthTriggered = true;
      this.fetchNotificationList();
    }
  }

  public ngOnInit() {
    this.isLearner = environment.APP_LEARNER;
    this.fetchNotificationListInCache();
  }

  /**
   * @function fetchNotificationList
   * This method is used to fetch notification list
   */
  public fetchNotificationListInCache() {
    this.notificationList = this.notificationService.notificationList;
  }

  /**
   * @function onRedirect
   * This method is used to redirect to respective area
   */
  public onRedirect(notification) {
    if (notification.isSuggestion) {
      this.teacherSuggestion(notification);
    } else if (notification.isOverride) {
      this.teacherOverride(notification);
    } else if (notification.isGrade) {
      this.teacherGradeComplete(notification);
    }
    /*this method is used to reset notification and redirect to respective page */
    this.resetNotification(notification.id);
    this.trackClickNotficationEvent(notification);
  }

  /**
   * @function trackClickNotficationEvent
   * This method is used to track the event when the notification is clicked
   */
  private trackClickNotficationEvent(notification) {
    const context = this.getClickNotificationContext(notification);
    this.parseService.trackEvent(EVENTS.CLICK_NOTIFICATION, context);
  }

  /**
   * @function getClickNotificationContext
   * This method is used to get the context for click notification event
   */
  private getClickNotificationContext(notification) {
    return {
      classId: this.classId,
      notificationType: notification.notificationType,
    };
  }

  /**
   * @function resetNotification
   * This method is used to reset notification
   */
  public resetNotification(notificationId) {
    this.notificationProvider.resetNotification(notificationId).then(() => {
      const limit = this.notificationList.notifications.length;
      const context = {
        boundary: '',
        classId: this.classId,
        limit
      };
      this.notificationService.fetchStudentNotificationList(context).then((response) => {
        this.notificationList = response;
      });
    });
  }

  /**
   * @function fetchNotificationList
   * This method is used to fetch notification list scrolls
   */
  public fetchNotificationList() {
    if (this.notificationList.moreItemsRemaining) {
      this.loader.displayLoader();
      const limit = this.notificationList.notifications.length;
      const context = {
        boundary: this.notificationList.boundary,
        limit,
        classId: this.classId
      };
      this.notificationService.fetchStudentNotificationList(context).then((response) => {
        this.notificationList.boundary = response.boundary;
        this.notificationList.moreItemsRemaining = response.moreItemsRemaining;
        this.notificationList.notifications = this.notificationList.notifications.concat(response.notifications);
        this.loader.dismissLoader();
        this.scrollDepthTriggered = false;
      });
    } else {
      this.translate
        .get('NO_MORE_NOTIFICATION')
        .subscribe(value => {
          this.toastService.presentToast(value);
        });
      this.scrollDepthTriggered = true;
    }
  }

  /**
   * @function teacherSuggestion
   * This method is teacher suggestion type
   */
  public teacherSuggestion(notification) {
    if (notification.ctxSource === SUGGESTION_SCOPE.CLASS_ACTIVITY) {
      this.suggestionClassActivity(notification);
    } else if (notification.ctxSource === SUGGESTION_SCOPE.COURSE_MAP) {
      this.suggestionCourseMap(notification);
    } else if (notification.ctxSource === SUGGESTION_SCOPE.PROFICIENCY) {
      this.suggestionProficiency(notification);
    }
  }

  /**
   * @function teacherOverride
   * This method is teacher override type
   */
  public teacherOverride(notification) {
    const context = {
      collectionId: notification.ctxCollectionId,
      classId: notification.ctxClassId,
      courseId: notification.ctxCourseId,
      lessonId: notification.ctxLessonId,
      unitId: notification.ctxUnitId,
      collectionType: notification.currentItemType,
      contentSource: notification.ctxSource
    };
    this.reportService.showReport(context);
  }

  /**
   * @function teacherGradeComplete
   * This method is teacher grade complete type
   */
  public teacherGradeComplete(notification) {
    const context = {
      collectionId: notification.ctxCollectionId,
      classId: notification.ctxClassId,
      courseId: notification.ctxCourseId,
      lessonId: notification.ctxLessonId,
      unitId: notification.ctxUnitId,
      collectionType: notification.currentItemType,
      contentSource: notification.ctxSource
    };
    this.reportService.showReport(context);
  }

  /**
   * @function suggestionClassActivity
   * This method is open class activity suggestion
   */
  public suggestionClassActivity(notification) {
    const context = {
      classId: notification.ctxClassId,
      collectionType: notification.currentItemType,
      source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      collectionId: notification.currentItemId,
      caContentId: notification.ctxCaId,
      pathId: notification.ctxPathId,
      pathType: notification.ctxPathType,
      milestoneId: notification.milestoneId,
      courseId: notification.ctxCourseId,
      lessonId: notification.ctxLessonId,
      unitId: notification.ctxUnitId,
    };
    this.playerService.openPlayer({ context });
  }

  /**
   * @function suggestionCourseMap
   * This method is open course map suggestion
   */
  public suggestionCourseMap(notification) {
    const isRoute0 = notification.ctxPathType === PATH_TYPES.ROUTE;
    const ctxPathId = isRoute0 ? notification.ctxPathId : 0;
    const ctxPathType = isRoute0 ? notification.ctxPathType : null;
    const context = {
      collectionId: notification.currentItemId,
      courseId: notification.ctxCourseId,
      lessonId: notification.ctxLessonId,
      unitId: notification.ctxUnitId,
      classId: notification.ctxClassId,
      collectionType: notification.currentItemType,
      source: PLAYER_EVENT_SOURCE.COURSE_MAP,
      pathId: notification.ctxPathId,
      pathType: notification.ctxPathType,
      milestoneId: notification.milestoneId,
      ctxPathId,
      ctxPathType
    };
    const playerUrl = routerPath('studyPlayer');
    this.router.navigate([playerUrl], {
      queryParams: {
        ...context
      }
    });
  }

  /**
   * @function suggestionCourseMap
   * This method is open proficiency suggestion
   */
  public suggestionProficiency(notification) {
    const context = {
      collectionId: notification.currentItemId,
      courseId: notification.ctxCourseId,
      lessonId: notification.ctxLessonId,
      unitId: notification.ctxUnitId,
      classId: notification.ctxClassId,
      collectionType: notification.currentItemType,
      source: PLAYER_EVENT_SOURCE.PROFICIENCY,
      pathId: notification.ctxPathId,
      pathType: notification.ctxPathType,
      milestoneId: notification.milestoneId
    };
    this.playerService.openPlayer({ context });
  }
}
