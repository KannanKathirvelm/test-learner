import { Injectable } from '@angular/core';
import { NotificationListModel } from '@shared/models/notification/notification';
import { NotificationProvider } from '@shared/providers/apis/notification/notification';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public notificationListSubject: BehaviorSubject<NotificationListModel>;
  public onNotification: Observable<NotificationListModel>;

  constructor(private notificationProvider: NotificationProvider) {
    this.notificationListSubject = new BehaviorSubject<NotificationListModel>(null);
    this.onNotification = this.notificationListSubject.asObservable();
  }

  /**
   * @function fetchStudentNotificationList
   * This Method is used to get the student notification list
   */
  public fetchStudentNotificationList(context) {
    return this.notificationProvider.fetchStudentNotificationList(context).then((response) => {
      this.notificationListSubject.next(response);
      return response;
    });
  }

  /**
   * @function notificationList
   * This Method is used to get notification count
   */
  get notificationList() {
    return this.notificationListSubject ? this.notificationListSubject.value : null;
  }
}
