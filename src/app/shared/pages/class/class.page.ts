import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EVENTS } from '@shared/constants/events-constants';
import { routerPathIdReplace } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import { ClassCompetencySummaryModel } from '@shared/models/competency/competency';
import { NotificationListModel, NotificationModel } from '@shared/models/notification/notification';
import { CAPerformanceModel, PerformanceModel } from '@shared/models/performance/performance';
import { ClassService } from '@shared/providers/service/class/class.service';
import { NotificationService } from '@shared/providers/service/notification/notification.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { getLimit, getRouteFromUrl } from '@shared/utils/global';
import { collapseAnimation } from 'angular-animations';
import 'rxjs/add/observable/interval';
import { Observable } from 'rxjs/Observable';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-class',
  templateUrl: './class.page.html',
  styleUrls: ['./class.page.scss'],
  animations: [collapseAnimation({ duration: 300, delay: 0 })],
  providers: [ClassService],
})

export class ClassPage implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  public classId: string;
  public class: ClassModel;
  public isCAPerformanceLoaded: boolean;
  public isCompetencyPerformanceLoaded: boolean;
  public isMilestonePerformanceLoaded: boolean;
  public compentencyPerformance: ClassCompetencySummaryModel;
  public classPerformance: PerformanceModel;
  public caPerformance: CAPerformanceModel;
  public notificationList: Array<NotificationModel>;
  public notifications: NotificationListModel;
  public isNotificationTimerStarts: boolean;
  public timerSubscription: AnonymousSubscription;
  public showSuggestion: boolean;
  public showNotification: boolean;
  public suggestionScrollEnd: boolean;
  public fromJourneyPage: boolean;
  public title: string;
  @ViewChild('container', { static: false }) public content: ElementRef;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router,
    private playerService: PlayerService,
    private events: Events,
    private classService: ClassService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private taxonomyService: TaxonomyService,
    private translate: TranslateService,
    private navCtrl: NavController,
    private parseService: ParseService,
  ) {
    this.activatedRoute.queryParams
      .subscribe(params => {
        this.fromJourneyPage = params.fromJourneyPage;
      });
    this.classId = this.activatedRoute.snapshot.params.id;
    this.isNotificationTimerStarts = false;
    this.showSuggestion = false;
    this.showNotification = false;
    const preDefindRoutes = [
      {
        route: 'activities',
        title: 'CLASS_ACTIVITY',
      },
      {
        route: 'proficiency',
        title: 'PROFICIENCY',
      },
      {
        route: 'milestone',
        title: 'YOUR_JOURNEY',
      }
    ];
    this.router.events.subscribe(() => {
      const url = this.router.url;
      const urlLastSegment = getRouteFromUrl(url);
      const route = preDefindRoutes.find(item => item.route === urlLastSegment);
      if (route) {
        this.title = this.translate.instant(route.title);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.fetchClassDetails();
  }

  /**
   * @function fetchClassDetails
   * This method is used to fetch class Details
   */
  public async fetchClassDetails() {
    this.classService.fetchClassById(this.classId).then((classDetails) => {
      this.class = classDetails;
      this.classService.setClass(this.class);
      const classPreference = this.class.preference;
      if (classPreference && classPreference.subject) {
        this.fetchClassTaxonomy(classPreference.subject);
      }
      this.fetchNotificationList();
    });
  }

  /**
   * @function fetchClassTaxonomy
   * This method is used to fetch class taxonomy subject
   */
  public async fetchClassTaxonomy(subjectCode) {
    const taxonomySubject = await this.taxonomyService.fetchSubjectById(subjectCode);
    this.classService.setClassTaxonomy(taxonomySubject);
  }

  /**
   * @function closePopup
   * This method is used to close the popyp
   */
  public closePopup() {
    this.showSuggestion = false;
    this.showNotification = false;
  }

  /**
   * @function clickBackButton
   * This method is used to navigate to previous screen
   */
  public clickBackButton() {
    const classHomeurl = this.fromJourneyPage ? routerPathIdReplace('journey', this.class.id) : routerPathIdReplace('home', this.class.id);
    this.navCtrl.navigateForward(classHomeurl);
  }


  /**
   * @function fetchNotificationList
   * This method is used to fetch notification list
   */
  public fetchNotificationList() {
    const contentHeight = this.content.nativeElement.clientHeight;
    const elementHeight = 48;
    const limit = getLimit(contentHeight, elementHeight);
    this.notificationService.fetchStudentNotificationList({ classId: this.classId, limit }).then((response) => {
      if (JSON.stringify(response) !== JSON.stringify(this.notifications)) {
        this.notifications = response;
        if (!this.isNotificationTimerStarts) {
          this.subscribeToNotification();
        }
      }
    });
  }

  /**
   * @function openSuggestionContainer
   * This method is used to open the suggestion container
   */
  public openSuggestionContainer() {
    this.showSuggestion = !this.showSuggestion;
    this.showNotification = false;
    this.trackSuggestionEvent();
  }

  /**
   * @function trackSuggestionEvent
   * This method is used to track the event when the suggestion is clicked
   */
  private trackSuggestionEvent() {
    const context = this.getSuggestionContext();
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION, context);
  }

  /**
   * @function getClickNotificationContext
   * This method is used to get the context for suggestion event
   */
  private getSuggestionContext() {
    return {
      classId: this.classId,
      className: this.class.title,
      courseName: this.class.course_title,
      courseId: this.class.course_id
    };
  }

  /**
   * @function openNotificationContainer
   * This method is used to open the notification container
   */
  public openNotificationContainer() {
    this.showNotification = !this.showNotification;
    this.showSuggestion = false;
  }

  /**
   * @function subscribeToNotification
   * This method is used to call api for every 2mins
   * (2 * 60 * 1000) => mins into ms conversion
   */
  private subscribeToNotification() {
    this.isNotificationTimerStarts = true;
    const intervalTime = 2 * 60 * 1000;
    this.timerSubscription = Observable.interval(intervalTime).subscribe(() => this.fetchNotificationList());
  }

  public ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.events.unsubscribe(this.playerService.CLASS_PERFORMANCE_UPDATE);
  }
}
