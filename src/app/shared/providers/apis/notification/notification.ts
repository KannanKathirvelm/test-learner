import { Injectable } from '@angular/core';
import { NOTIFICATION_TYPE } from '@shared/constants/helper-constants';
import { NotificationListModel, NotificationModel } from '@shared/models/notification/notification';
import { HttpService } from '@shared/providers/apis/http';

@Injectable({
  providedIn: 'root'
})

export class NotificationProvider {

  // -------------------------------------------------------------------------
  // Properties

  private notificationNamespace = 'api/notifications/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getStudentNotificationList
   * Method to get student notification list
   */

  public fetchStudentNotificationList(context) {
    const endpoint = `${this.notificationNamespace}/student`;
    const paramsData = {
      classId: context.classId,
      limit: context.limit,
      boundary: context.boundary
    };
    return this.httpService.get<NotificationListModel>(endpoint, paramsData).then((response) => {
      const notificationList: NotificationListModel = {
        boundary: response.data.boundary,
        moreItemsRemaining: response.data.moreItemsRemaining,
        notifications: this.normalizeNotification(response.data.notifications)
      };
      return notificationList;
    });
  }

  /**
   * Normalize notification
   * @param {notificationList} payload
   * @return {notificationList}
   */
  private normalizeNotification(payload): Array<NotificationModel> {
    return payload.map((item) => {
      const notification: NotificationModel = {
        ctxCaId: item.ctxCaId,
        ctxClassCode: item.ctxClassCode,
        ctxClassId: item.ctxClassId,
        ctxCollectionId: item.ctxCollectionId,
        ctxCourseId: item.ctxCourseId,
        ctxLessonId: item.ctxLessonId,
        ctxPathId: item.ctxPathId || 0,
        ctxPathType: item.ctxPathType || null,
        ctxSource: item.ctxSource,
        ctxTxCode: item.ctxTxCode,
        ctxTxCodeType: item.ctxTxCodeType,
        ctxUnitId: item.ctxUnitId,
        currentItemId: item.currentItemId,
        currentItemTitle: item.currentItemTitle,
        currentItemType: item.currentItemType,
        id: item.id,
        milestoneId: item.milestoneId,
        notificationType: item.notificationType,
        updatedAt: item.updatedAt,
        isSuggestion: item.notificationType === NOTIFICATION_TYPE.TEACHER_SUGGESTION,
        isOverride: item.notificationType === NOTIFICATION_TYPE.TEACHER_OVERRIDE,
        isGrade: item.notificationType === NOTIFICATION_TYPE.TEACHER_GRADING_COMPLETE
      };
      return notification;
    });
  }

  /**
   * @function resetNotification
   * Method to reset notification
   */

  public resetNotification(notificationId: string) {
    const endpoint = `${this.notificationNamespace}/student/${notificationId}`;
    return this.httpService.delete(endpoint);
  }
}
