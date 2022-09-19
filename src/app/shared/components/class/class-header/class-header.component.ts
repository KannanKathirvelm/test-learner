import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { NotificationListModel } from '@shared/models/notification/notification';
import { NotificationService } from '@shared/providers/service/notification/notification.service';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'class-header',
  templateUrl: './class-header.component.html',
  styleUrls: ['./class-header.component.scss'],
})
export class ClassHeaderComponent implements OnInit, OnDestroy {
  // --------------------------------------------------------------------------
  // Properties
  @Input() public title: string;
  @Input() public showBack: boolean;
  @Output() public openSuggestionContainer = new EventEmitter();
  @Output() public openNotificationContainer = new EventEmitter();
  @Output() public clickBackButton = new EventEmitter();
  public notifications: NotificationListModel;
  public notificationCount: number;
  public notificationSubscription: AnonymousSubscription;
  public isNotificationSelected: boolean;
  public isSuggestionSelected: boolean;

  constructor(private notificationService: NotificationService, private parseService: ParseService) { }
  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    const displayCount = 10;
    this.notificationSubscription = this.notificationService.onNotification.subscribe(
      (notification) => {
        if (notification) {
          this.notifications = notification;
          this.notificationCount = this.notifications
            .moreItemsRemaining
            ? displayCount
            : notification.notifications.length;
        }
      }
    );
  }

  public ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  /**
   * @function onClickBackButton
   * This method is used to go back to the previous page
   */
  public onClickBackButton() {
    this.clickBackButton.emit();
    this.parseService.trackEvent(EVENTS.BACK_CLASS_NAVBAR_TO_HOME);
  }

  /**
   * @function showNotification
   * This method is used to show Notification popover
   */
  public showNotification(event) {
    this.isSuggestionSelected = false;
    this.isNotificationSelected = !this.isNotificationSelected;
    this.openNotificationContainer.emit();
  }

  /**
   * @function showSuggestion
   * This method is used to show suggestion popover
   */
  public showSuggestion(event) {
    this.isNotificationSelected = false;
    this.isSuggestionSelected = !this.isSuggestionSelected;
    this.openSuggestionContainer.emit();
  }

}
