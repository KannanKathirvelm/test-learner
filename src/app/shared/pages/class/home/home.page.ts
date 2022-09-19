import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EVENTS } from '@app/shared/constants/events-constants';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { LookupService } from '@app/shared/providers/service/lookup/lookup.service';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { Events, NavController } from '@ionic/angular';
import { StudentClassProgressReportComponent } from '@shared/components/student-class-progress-report/student-class-progress-report.component';
import { CLASS_SKYLINE_INITIAL_DESTINATION, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { routerPathIdReplace as routerPath } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import { ClassCompetencySummaryModel } from '@shared/models/competency/competency';
import { UnitSummaryModel } from '@shared/models/course-map/course-map';
import { CourseContentVisibility } from '@shared/models/course/course';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { MilestoneModel } from '@shared/models/milestone/milestone';
import { NotificationListModel, NotificationModel } from '@shared/models/notification/notification';
import { CAPerformanceModel, PerformanceModel } from '@shared/models/performance/performance';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { CourseMapService } from '@shared/providers/service/course-map/course-map.service';
import { CourseService } from '@shared/providers/service/course/course.service';
import { LocationService } from '@shared/providers/service/location/location.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { NotificationService } from '@shared/providers/service/notification/notification.service';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { cloneObject, getLimit } from '@shared/utils/global';
import { collapseAnimation } from 'angular-animations';
import 'rxjs/add/observable/interval';
import { Observable } from 'rxjs/Observable';
import { AnonymousSubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [collapseAnimation({ duration: 300, delay: 0 })]
})
export class HomePage implements OnDestroy {
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
  public isPremiumClass: boolean;
  public isPublicClass: boolean;
  public showCourseMapReport: boolean;
  public classSetupInComplete: boolean;
  public joinClass: boolean;
  private classCourseSubject: string;
  public isLoadView: boolean;
  public milestoneViewApplicable: boolean;
  public isShowJourney: boolean;
  public milestones: Array<MilestoneModel>;
  public copyOfMilestones: Array<MilestoneModel>;
  public selectedMilestones: Array<MilestoneModel>;
  public isLoaded: boolean;
  public isShowJourneyReport: boolean;
  public currentLocation: MilestoneLocationModel;
  private fwCode: string;
  public baseMasteredCompetencies: number;
  public isToggleRescopedInfo: boolean;
  public isMilestoneReport: boolean;
  public fromClassCard: boolean;
  public contentVisibility: CourseContentVisibility;
  public unitList: Array<UnitSummaryModel>;
  public selectedMilestoneIndex: number;
  public hasCourse: boolean;
  public isMilestoneViewEnabledForTenant: boolean;
  public hasCurrentLocation: boolean;
  @ViewChild('container', { static: false }) public content: ElementRef;
  public tenantSettings: TenantSettingsModel;

  get classTitle() {
    return this.class && this.class.title;
  }

  /** Stop hardware back button */
  @HostListener('document:ionBackButton', ['$event'])
  public overrideHardwareBackAction(event) {
    this.clickBackButton();
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private competencyService: CompetencyService,
    private locationService: LocationService,
    private milestoneService: MilestoneService,
    private playerService: PlayerService,
    private events: Events,
    private classService: ClassService,
    private courseService: CourseService,
    private activatedRoute: ActivatedRoute,
    private competencyProvider: CompetencyProvider,
    private performanceProvider: PerformanceProvider,
    private notificationService: NotificationService,
    private taxonomyService: TaxonomyService,
    private courseMapService: CourseMapService,
    private navCtrl: NavController,
    private router: Router,
    private modalService: ModalService,
    private lookupService: LookupService,
    private parseService: ParseService
  ) {
    this.joinClass = this.activatedRoute.snapshot.params.joinClass;
    this.classId = this.activatedRoute.snapshot.params.id;
    this.isNotificationTimerStarts = false;
    this.showSuggestion = false;
    this.showNotification = false;
    this.classSetupInComplete = false;
    this.isLoadView = false;
    this.isToggleRescopedInfo = true;
  }

  // --------------------------------------------------------------------------
  // Events

  public ionViewWillEnter() {
    const fromClassCard = this.activatedRoute.snapshot.queryParams['fromClassCard'];
    this.fromClassCard = fromClassCard === 'true';
    this.loadTenantSettings();
    this.loadData(false);
    this.fetchNotificationList();
    this.subscribeToUpdateClassPerformance();
  }

  /**
   * @function onToggleRescopedInfo
   * This method is used to toggle the rescoped info
   */
  public onToggleRescopedInfo() {
    this.isToggleRescopedInfo = !this.isToggleRescopedInfo;
  }

  /**
   * @function fetchCurrentLocation
   * This method is used to get current location list
   */
  public async fetchCurrentLocation() {
    if (this.fwCode) {
      const classDetails = this.class;
      const classId = classDetails.id;
      const courseId = classDetails.course_id;
      this.currentLocation = await this.locationService.fetchCurrentLocation(classId, courseId, this.fwCode);
    }
  }

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public async onRefresh(event) {
    await this.loadData(true);
    event.target.complete();
    this.fetchNotificationList();
    this.subscribeToUpdateClassPerformance();
  }

  /**
   * @function loadData
   * This method is used to get the data
   */
  private async loadData(isForceReload) {
    return this.fetchClassDetails().then(async (classDetails) => {
      const subjectCode = classDetails.preference ? classDetails.preference.subject : null;
      const milestonesRoutes: any = await this.milestoneService.fetchMilestoneRoutes(this.classId, isForceReload, subjectCode);
      if (milestonesRoutes && milestonesRoutes.milestone_route_path_coordinates) {
        this.isShowJourney = true;
      }
      this.class = classDetails;
      this.hasCurrentLocation = this.class && this.class.currentLocation ? true : false;
      this.hasCourse = classDetails.course_id !== null;
      const classPerference = classDetails.preference;
      this.isMilestoneViewEnabledForTenant = await this.classService.isMilestoneViewEnabled(classDetails.preference, classDetails.setting);
      this.fwCode = classPerference && classPerference.framework ? classPerference.framework : null;
      this.isPremiumClass = this.class.isPremiumClass;
      this.isPublicClass = classDetails.isPublic;
      this.milestoneViewApplicable = classDetails.milestone_view_applicable;
      this.classService.setClass(this.class);
      this.fetchCurrentLocation();
      this.getclassCourseSubject();
      if (this.class.course_id && this.isPremiumClass) {
        this.initializeState(isForceReload);
        if (!this.milestoneViewApplicable || !this.isMilestoneViewEnabledForTenant) {
          this.loadCourseMapData(isForceReload);
        }
      } else {
        this.loadCourseMapData(isForceReload);
      }
      this.loadPerformance();
      return;
    });
  }

  /**
   * @function fetchMilestone
   * This method is used to fetch milestones
   */
  public fetchMilestone(isForceReload) {
    this.isLoaded = false;
    if (this.fwCode) {
      this.milestoneService.fetchMilestone(true, isForceReload).then((milestones) => {
        this.milestones = milestones;
        this.copyOfMilestones = cloneObject(milestones);
        this.isLoaded = true;
      });
    } else {
      this.isLoaded = true;
    }
  }

  /**
   * @function loadCourseMapData
   * This method is used to load course map data
   */
  public loadCourseMapData(isForceReload) {
    if (this.class.course_id) {
      this.isLoaded = false;
      this.courseMapService.fetchCoursesWithContentVisibility(this.classId).then((contentResponse) => {
        this.contentVisibility = contentResponse;
        this.courseMapService.fetchUnitList(this.classId, this.class.course_id, isForceReload)
          .then((response: Array<UnitSummaryModel>) => {
            this.unitList = response;
            this.isLoaded = true;
            this.isLoadView = true;
          });
      });
    } else {
      this.isLoadView = true;
    }
  }

  /**
   * @function openJourneyReport
   * This method is used to open the milestones report
   */
  public async openJourneyReport() {
    const showFullCourse = await this.getFullCourseState();
    const milestones = this.getMilestoneList(showFullCourse);
    this.selectedMilestones = milestones;
    this.isShowJourneyReport = true;
    this.isMilestoneReport = false;
  }

  /**
   * @function getMilestoneList
   * This method is used to get milestones list
   */
  public getMilestoneList(showFullCourse) {
    const rescopedContent = this.getRescopedContents();
    const isAllContentsAreRescoped = rescopedContent.length === this.copyOfMilestones.length;
    if (showFullCourse || isAllContentsAreRescoped) {
      return this.copyOfMilestones;
    }
    return this.copyOfMilestones.filter((milestone) => {
      return !milestone.isRescoped;
    });
  }

  /**
   * @function getFullCourseState
   * This method is used to get the full course state
   */
  public getFullCourseState() {
    return this.milestoneService.getFullCourseState(this.class.id);
  }

  /**
   * @function getRescopedContents
   * This method is used to get rescoped contents
   */
  public getRescopedContents() {
    return this.copyOfMilestones.filter((milestone) => {
      return milestone.isRescoped;
    });
  }

  /**
   * @function closeJourneyReport
   * This method is used to close the milestone report
   */
  public closeJourneyReport() {
    this.isShowJourneyReport = false;
    this.isMilestoneReport = false;
    this.selectedMilestoneIndex = null;
  }

  /**
   * @function onOpenMilestoneReport
   * This method is used to open the milestone report
   */
  public async onOpenMilestoneReport(milestone) {
    const showFullCourse = await this.getFullCourseState();
    const milestones = this.getMilestoneList(showFullCourse);
    const milestoneIndex = milestones.findIndex((classMilestone) => {
      return milestone.milestoneId === classMilestone.milestoneId;
    });
    this.selectedMilestones = [milestone];
    this.isShowJourneyReport = true;
    this.isMilestoneReport = true;
    this.selectedMilestoneIndex = milestoneIndex;
  }

  /**
   * @function getclassCourseSubject
   * This method is used to get class course subject
   */
  public async getclassCourseSubject() {
    this.classCourseSubject = await this.getClassSubjectCode();
    if (this.classCourseSubject) {
      this.fetchClassTaxonomy(this.classCourseSubject);
    }
  }

  /**
   * @function fetchClassDetails
   * This method is used to fetch class Details
   */
  public fetchClassDetails() {
    return this.classService.fetchClassById(this.classId);
  }

  /**
   * @function initialize
   * This method is used to redirect to respective page based on user state
   */
  public async initializeState(isForceReload) {
    const classId = this.classId;
    this.classService.fetchSkylineInitialState(classId).then(async (stateData) => {
      const destination = stateData.destination;
      if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete) {
        this.classSetupInComplete = true;
      } else {
        if (environment.APP_LEARNER) {
          const subjectCode = this.classCourseSubject;
          if (this.isShowJourney && this.fromClassCard && destination === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
            const journeyURL = routerPath('journey', this.class.id);
            this.router.navigate([journeyURL]);
            return;
          } else if (destination !== CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
            const isPublic = this.isPublicClass;
            this.router.navigate(['/navigator'], { queryParams: { classId, subjectCode, isPublic } });
            return;
          }
        }
        if (this.milestoneViewApplicable) {
          this.fetchMilestone(isForceReload);
          this.isLoadView = true;
        }
      }
    });
  }

  /**
   * @function getClassSubjectCode
   * This method is used to get the subject code from active class
   */
  public getClassSubjectCode() {
    const classPreferenceSubject = this.class.preference ? this.class.preference.subject : null;
    if (classPreferenceSubject) {
      return Promise.resolve(classPreferenceSubject);
    } else {
      const courseId = this.class.course_id;
      if (this.classCourseSubject) {
        return Promise.resolve(this.classCourseSubject);
      } else if (courseId) {
        return this.courseService.fetchCourseById(courseId).then((courseDetails) => {
          return courseDetails.subject_bucket;
        });
      } else {
        return Promise.resolve(null);
      }
    }
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
   * @function loadPerformance
   * This method is used to load the performance
   */
  public loadPerformance() {
    this.fetchCompetencyCompletionStats();
    this.fetchClassPerformance();
    this.fetchCAPerformance();
  }

  /**
   * @function fetchCompetencyCompletionStats
   * This method is used to fetch competency completion stats
   */
  public fetchCompetencyCompletionStats() {
    this.isCompetencyPerformanceLoaded = false;
    const subjectCode = this.class.preference ? this.class.preference.subject : null;
    if (subjectCode) {
      const params = [{ classId: this.classId, subjectCode }];
      this.competencyProvider.fetchCompetencyCompletionStats(params).then(async (compentencyPerformanceSummary) => {
        this.compentencyPerformance = compentencyPerformanceSummary[0];
        if (this.compentencyPerformance && environment.APP_LEARNER) {
          this.baseMasteredCompetencies = await this.competencyService.computeCompetencyCount(this.compentencyPerformance.completedCompetencies);
        }
        this.isCompetencyPerformanceLoaded = true;
      });
    } else {
      this.isCompetencyPerformanceLoaded = true;
    }
  }

  /**
   * @function fetchCAPerformance
   * This method is used to fetch CA performance
   */
  public fetchCAPerformance() {
    this.isCAPerformanceLoaded = false;
    return this.performanceProvider.fetchCAPerformance([this.classId]).then((caPerformanceSummary) => {
      this.caPerformance = caPerformanceSummary[0];
      this.isCAPerformanceLoaded = true;
    });
  }

  /**
   * @function fetchClassPerformance
   * This method is used to fetch milestone performance
   */
  public fetchClassPerformance() {
    if (!this.class.course_id) {
      // avoid skeleton loading
      this.isMilestonePerformanceLoaded = true;
      this.classPerformance = {
        id: null,
        classId: this.classId,
        timeSpent: 0,
        score: null,
        sessionId: null,
        totalCompleted: null,
        total: null
      };
      return null;
    }
    this.isMilestonePerformanceLoaded = false;
    const courseId = this.class.course_id;
    const classCourseId = [{ classId: this.classId, courseId }];
    return this.performanceProvider.fetchClassPerformance(classCourseId)
      .then((classPerformanceSummary) => {
        this.classPerformance = classPerformanceSummary[0];
        this.isMilestonePerformanceLoaded = true;
      });
  }

  /**
   * @function navigateToClassActivity
   * This method is used to navigate to class activity
   */
  public navigateToClassActivity() {
    const classActivityUrl = routerPath('classActivityFullPath', this.classId);
    this.router.navigate([classActivityUrl]);
  }

  /**
   * @function onClickClassJourney
   * This method triggers when user click the class journey
   */
  public onClickClassJourney() {
    this.showCourseMapReport = !this.showCourseMapReport;
  }

  /**
   * @function subscribeToUpdateClassPerformance
   * This method is used to subscribe to update class performance
   */
  public subscribeToUpdateClassPerformance() {
    this.events.subscribe(this.playerService.CLASS_PERFORMANCE_UPDATE, (source) => {
      if (source === PLAYER_EVENT_SOURCE.CA) {
        this.fetchCAPerformance();
      } else {
        this.fetchCompetencyCompletionStats();
        this.fetchClassPerformance();
      }
    });
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
    if (environment.APP_LEARNER) {
      if (this.hasCurrentLocation) {
        this.hasCurrentLocation = this.class.currentLocation ? true : false;
        this.navCtrl.navigateForward(['/student-home'], { queryParams: { isReload: this.hasCurrentLocation } });
      } else {
        this.navCtrl.navigateForward(['/student-home']);
      }
    } else {
      this.navCtrl.navigateForward('/guardian-home');
    }
  }

  /**
   * @function fetchNotificationList
   * This method is used to fetch notification list
   */
  public fetchNotificationList() {
    if (this.content) {
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
  }

  /**
   * @function openSuggestionContainer
   * This method is used to open the suggestion container
   */
  public openSuggestionContainer() {
    this.showSuggestion = !this.showSuggestion;
    this.showNotification = false;
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
    this.courseMapService.unSubscribeEvent();
    this.milestoneService.unSubscribeEvent();
    this.events.unsubscribe(this.playerService.CLASS_PERFORMANCE_UPDATE);
  }

  /**
   * @function onProgressReport
   * This method is used to view student progress report
   */
  public onProgressReport() {
    this.modalService.open(StudentClassProgressReportComponent, {});
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_DASHBOARD_PERFORMANCE_OVERVIEW);
  }


  /**
   * @function loadTenantSettings
   * This method is used to fetch tenant settings
   */
  public loadTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
       this.tenantSettings = tenantSettings;
    });
  }
}
