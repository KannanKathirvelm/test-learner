import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EVENTS } from '@shared/constants/events-constants';
import { ClassProvider } from '@shared/providers/apis/class/class';
import { ClassService } from '@shared/providers/service/class/class.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { ToastService } from '@shared/providers/service/toast.service';

@Component({
  selector: 'nav-join-class-card',
  templateUrl: './join-class-card.component.html',
  styleUrls: ['./join-class-card.component.scss'],
})
export class JoinClassCardComponent {

  public searchText: string;

  constructor(
    private parseService: ParseService,
    private classProvider: ClassProvider,
    private classService: ClassService,
    private events: Events,
    private loader: LoadingService,
    private translate: TranslateService,
    private router: Router,
    private toastService: ToastService
  ) { }


  /**
   * @function onEnterClassCode
   * Method to get user enter class code
   */
  public onEnterClassCode(evt) {
    this.searchText = evt.srcElement.value;
  }

  /**
   * @function joinClass
   * This method is used to join a class
   */
  public joinClass() {
    this.loader.displayLoader();
    this.parseService.trackEvent(EVENTS.JOIN_CLASSROOM, {classCode: this.searchText});
    this.classProvider.joinClass(this.searchText).then((res) => {
      if (!res.headers.location) {
        this.displayToast('ALREADY_MEMBER');
      } else {
        this.searchText = null;
        const classId = res.headers.location;
        this.trackClassCodeEvent(classId);
        this.events.publish(this.classService.CLASS_JOINED_UPDATE);
        this.navigate(classId, false);
      }
    }).catch((error) => {
      if (error.status === 400) {
        this.displayToast('JOIN_NOT_ALLOWED');
      } else if (error.status === 404) {
        this.displayToast('INVALID_CLASS_CODE');
      }
    }).finally(() => {
      this.loader.dismissLoader();
    });
  }

  /**
   * @function trackClassCodeEvent
   * This method is used to track the join class event
   */
  private trackClassCodeEvent(classId) {
    const context = {
      classCode: this.searchText,
      classId
    };
    this.parseService.trackEvent(EVENTS.ENTER_CLASS_CODE, context);
  }

  /**
   * @function navigate
   * This method is used to navigate to the navigator page
   */
  private navigate(classId, isPublic, subjectCode?) {
    if (isPublic) {
      this.router.navigate(['/navigator'], { queryParams: { classId, subjectCode, isPublic: true } });
    } else {
      this.router.navigate(['/navigator'], { queryParams: { classId } });
    }
  }

  /**
   * @function displayToast
   * This method is used to display toast
   */
  private displayToast(errorMessage) {
    this.translate.get(errorMessage).subscribe((value) => {
      this.toastService.presentToast(value);
    });
  }
}
