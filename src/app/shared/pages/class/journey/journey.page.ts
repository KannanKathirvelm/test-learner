import { AfterViewInit, Component, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonListPullupComponent } from '@app/shared/components/lesson-list-pullup/lesson-list-pullup.component';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { environment } from '@environment/environment';
import { IonContent } from '@ionic/angular';
import { PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { routerPath, routerPathIdReplace } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import { ClassCompetencySummaryModel, CurrentLocation } from '@shared/models/competency/competency';
import { MilestoneDetailsModel, MilestoneModel } from '@shared/models/milestone/milestone';
import { PerformanceModel } from '@shared/models/performance/performance';
import { TaxonomySubjectModel } from '@shared/models/taxonomy/taxonomy';
import { TourMessagesModel } from '@shared/models/tour/tour';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { NavigateProvider } from '@shared/providers/apis/navigate/navigate';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { TourService } from '@shared/providers/service/tour.service';
import { formatTime } from '@shared/utils/global';
import axios from 'axios';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.page.html',
  styleUrls: ['./journey.page.scss'],
})
export class JourneyPage implements AfterViewInit, OnDestroy {

  public contentHeight: number;
  public contentWidth: number;
  @ViewChild(IonContent, { static: false }) public content: IonContent;
  public milestones: Array<MilestoneModel>;
  public class: ClassModel;
  public isPublicClass: boolean;
  public isLoading: boolean;
  public timerSubscription: AnonymousSubscription;
  public fromDirections: boolean;
  public isDisabled: boolean;
  public isDisplayMap: boolean;
  public classTitle: string;
  public milestoneCount: number;
  public classPerformance: PerformanceModel;
  public compentencyPerformance: ClassCompetencySummaryModel;
  public baseMasteredCompetencies: number;
  public isPageRefresh: boolean;
  public isShowJourneyReport: boolean;
  public totalLessonsCount: number;
  public computedEtlTime: string;
  public isMilestoneReport: boolean;
  public selectedMilestones: Array<MilestoneModel>;
  public selectedSubject: TaxonomySubjectModel;
  public selectedMilestoneIndex: number;
  public tenantSettings: TenantSettingsModel;
  public milestoneDetails: Array<MilestoneDetailsModel> = [];
  public isAllContentsAreRescoped: boolean;

  constructor(
    private lookupService: LookupService,
    private competencyService: CompetencyService,
    private competencyProvider: CompetencyProvider,
    private performanceProvider: PerformanceProvider,
    private navigateProvider: NavigateProvider,
    private taxonomyService: TaxonomyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private milestoneService: MilestoneService,
    private classService: ClassService,
    private ngZone: NgZone,
    private tourService: TourService,
    private modalService: ModalService
  ) {
    this.isShowJourneyReport = false;
    this.fromDirections = false;
    this.isDisabled = false;
    this.activatedRoute.queryParams.subscribe((params) => {
      this.fromDirections = params.fromDirections ? Boolean(params.fromDirections) : false;
    });
  }

  public async ionViewWillEnter() {
    this.isLoading = true;
    const classId = this.activatedRoute.snapshot.params.id;
    this.class = await this.classService.fetchClassById(classId);
    this.classService.setClass(this.class);
    this.fetchClassDetails(false);
    this.fetchTenantSettings();
    if (this.contentWidth && this.contentHeight) {
      this.isDisplayMap = true;
    }
  }

  public ionViewWillLeave() {
    this.milestones = null;
    this.isDisplayMap = false;
  }

  public ngAfterViewInit() {
    this.getContentSize();
  }

  public ngOnDestroy() {
    this.milestoneService.unSubscribeEvent();
  }

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public async onRefresh(event) {
    this.isPageRefresh = true;
    this.milestones = null;
    this.isLoading = true;
    await this.fetchClassDetails(true);
    event.target.complete();
    this.isPageRefresh = false;
  }

  /**
   * @function loadMilestoneStats
   * Method to fetch the milestone stats
   */
  public async loadMilestoneStats() {
    const milestoneIds = this.getListOfMilestoneIds();
    if (milestoneIds && milestoneIds.length) {
      const milestonesStats = await this.milestoneService.fetchMilestoneStats(
        milestoneIds,
        this.class.id);
      this.getTotalLessonsCount(milestonesStats);
    }
  }

  /**
   * @function getTotalComputedETL
   * Method to get the total computed etl
   */
  public getTotalComputedETL() {
    const milestonesEtlTime = this.milestones.map((milestone) => {
      if (milestone.computedEtlSecs) {
        return milestone.computedEtlSecs;
      }
    });
    const totalComputedETL: number = milestonesEtlTime.reduce
      ((previousValue: number, currentValue: number) => {
        if (currentValue) {
          const lastValue = previousValue || 0;
          return lastValue + currentValue;
        }
      }, 0);
    if (totalComputedETL) {
      this.computedEtlTime = formatTime(totalComputedETL);
    }
  }

  /**
   * @function getTotalLessonsCount
   * Method to get the total lessons count
   */
  public getTotalLessonsCount(milestonesStats) {
    const milestonesLessons = milestonesStats.map((milestone) => {
      if (milestone.totalLessons) {
        return milestone.totalLessons;
      }
    });
    const totalLessonsCount: number = milestonesLessons.reduce
      ((previousValue: number, currentValue: number) => {
        if (currentValue) {
          const lastValue = previousValue || 0;
          return lastValue + currentValue;
        }
      }, 0);
    if (totalLessonsCount) {
      this.totalLessonsCount = totalLessonsCount;
    }
  }

  /**
   * @function getListOfMilestoneIds
   * Method to fetch course ids from the list of milestones
   */
  public getListOfMilestoneIds() {
    return this.milestones.map((milestone) => {
      if (milestone.milestoneId) {
        return milestone.milestoneId;
      }
    });
  }

  /**
   * @function fetchClassDetails
   * This method is used to fetch class Details
   */
  public async fetchClassDetails(isForceReload) {
    this.isLoading = false;
    this.fetchClassPerformance();
    this.fetchCompetencyCompletionStats();
    this.classTitle = this.class.title;
    this.isPublicClass = this.class.isPublic;
    const classPreference = this.class.preference;
    if (classPreference && classPreference.subject) {
      this.fetchClassTaxonomy(classPreference.subject);
    }
    return this.loadData(isForceReload);
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
   * @function openJourneyReport
   * This method is used to open the milestones report
   */
  public openJourneyReport() {
    this.selectedMilestones = this.milestones;
    this.isShowJourneyReport = true;
    this.isMilestoneReport = false;
    this.selectedMilestoneIndex = null;
  }


  /**
   * @function onOpenLessonList
   * This method is used to open the lesson lists
   */
  public onOpenLessonList() {
    this.modalService.open(LessonListPullupComponent, {
      milestones: this.milestones,
      isPublicClass: this.isPublicClass,
      class: this.class,
      tenantSettings: this.tenantSettings,
      totalLessonsCount: this.totalLessonsCount,
      classTitle: this.classTitle,
      milestoneCount: this.milestoneCount,
      computedEtlTime: this.computedEtlTime,
      currentLocation: this.class.currentLocation,
      isDisabled: this.isDisabled || this.isAllContentsAreRescoped
    },
      'lesson-list-modal').then((action) => {
        if (action) {
          this.playContent();
        }
      });
  }

  /**
   * @function onOpenMilestoneReport
   * This method is used to open the milestone report
   */
  public onOpenMilestoneReport(milestoneIndex) {
    this.ngZone.run(() => {
      const milestone = this.milestones[milestoneIndex];
      this.selectedMilestones = [milestone];
      this.isShowJourneyReport = true;
      this.isMilestoneReport = true;
      this.selectedMilestoneIndex = milestoneIndex;
    });
  }

  /**
   * @function fetchCompetencyCompletionStats
   * This method is used to fetch competency completion stats
   */
  public fetchCompetencyCompletionStats() {
    const subjectCode = this.class.preference ? this.class.preference.subject : null;
    const params = [{ classId: this.class.id, subjectCode }];
    return this.competencyProvider.fetchCompetencyCompletionStats(params)
      .then(async (compentencyPerformanceSummary) => {
        this.compentencyPerformance = compentencyPerformanceSummary[0];
        if (this.compentencyPerformance && environment.APP_LEARNER) {
          this.baseMasteredCompetencies = await this.competencyService.computeCompetencyCount(this.compentencyPerformance.completedCompetencies);
        }
      });
  }

  /**
   * @function fetchClassTaxonomy
   * This method is used to fetch class taxonomy subject
   */
  public async fetchClassTaxonomy(subjectCode) {
    const taxonomySubject = await this.taxonomyService.fetchSubjectById(subjectCode);
    this.selectedSubject = taxonomySubject;
    this.classService.setClassTaxonomy(taxonomySubject);
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  private loadData(isForceReload) {
    const subjectCode = this.class.preference ? this.class.preference.subject : null;
    return axios.all<{}>([
      isForceReload ? this.milestoneService.fetchMilestoneRoutes(this.class.id, isForceReload, subjectCode) : null,
      this.fetchMilestone(isForceReload)
    ]);
  }

  /**
   * @function fetchClassPerformance
   * This method is used to fetch milestone performance
   */
  public fetchClassPerformance() {
    if (!this.class.course_id) {
      // avoid skeleton loading
      this.classPerformance = {
        id: null,
        classId: this.class.id,
        timeSpent: 0,
        score: null,
        sessionId: null,
        totalCompleted: null,
        total: null
      };
    } else {
      const courseId = this.class.course_id;
      const classCourseId = [{ classId: this.class.id, courseId }];
      this.performanceProvider.fetchClassPerformance(classCourseId).then((classPerformanceSummary) => {
        this.classPerformance = classPerformanceSummary[0];
      });
    }
  }

  /**
   * @function fetchMilestone
   * This method is used to fetch milestones
   */
  public fetchMilestone(isForceReload?) {
    const classDetails = this.classService.class;
    const classPerference = classDetails.preference;
    const fwCode = classPerference && classPerference.framework ? classPerference.framework : null;
    if (fwCode) {
      return this.milestoneService.fetchMilestone(false, isForceReload).then((milestones) => {
        this.handleMilestoneList(milestones);
        return milestones;
      });
    }
  }

  /**
   * @function handleMilestoneList
   * This method is used to handle the milestone list
   */
  public async handleMilestoneList(milestones) {
    const classDetails = this.classService.class;
    const showFullCourse = await this.milestoneService.getFullCourseState(classDetails.id);
    const rescopedContent = this.getRescopedContents(milestones);
    this.isAllContentsAreRescoped = rescopedContent.length === milestones.length;
    if (showFullCourse || this.isAllContentsAreRescoped) {
      this.milestones = milestones;
    } else {
      this.milestones = milestones.filter((milestone) => {
        return !milestone.isRescoped;
      });
    }
    if (!environment.DISABLE_GPS_MAP_ZOOM) {
      const courseId = classDetails.course_id;
      const milestoneIds = this.milestones.filter((milestone) => !milestone.isRoute0).map((item) => item.milestoneId);
      const route0MilestoneIds = this.milestones.filter((milestone) => milestone.isRoute0).map((item) => item.milestoneId);
      this.milestoneDetails = await this.milestoneService.fetchMilestoneDetails(courseId, this.class.id, milestoneIds, route0MilestoneIds);
    }
    this.getTotalComputedETL();
    this.loadMilestoneStats();
    this.milestoneCount = this.milestones.length;
    this.isDisabled = this.milestones && !this.milestones.length;
  }

  /**
   * @function getRescopedContents
   * This method is used to get rescoped contents
   */
  public getRescopedContents(milestones) {
    return milestones.filter((milestone) => {
      return milestone.isRescoped;
    });
  }

  /**
   * @function getContentSize
   * This method is used to get the height and width of content
   */
  private getContentSize() {
    this.content.getScrollElement().then(scrollElement => {
      const adjustPosition = 80; // extra padding height
      this.contentWidth = scrollElement.clientWidth;
      this.contentHeight = (scrollElement.clientHeight - adjustPosition);
      this.isDisplayMap = true;
    });
  }

  /**
   * @function onClickStart
   * This method triggers when user click start
   */
  public onClickStart() {
    this.playContent();
  }

  /**
   * @function playContent
   * This method is used to play the content
   */
  public async playContent() {
    const currentLocation = this.class.currentLocation;
    let nextPromise = null;
    if (currentLocation == null) {
      // start studying
      nextPromise = this.navigateProvider.continueCourse(this.class.course_id, this.class.id)
        .then((content) => {
          return this.navigateProvider.serializeContextForQueryParams(content.context);
        });
    } else if (currentLocation.status === 'complete') {
      // completed
      const location = this.navigateProvider.getCurrentCollectionContext(currentLocation);
      nextPromise = this.navigateProvider.contentServedResource(location)
        .then((content) => {
          return this.navigateProvider.serializeContextForQueryParams(content.context);
        });
    } else {
      // in-progress
      if (currentLocation.milestoneId !== null) {
        const milestoneAlterPaths = await this.milestoneService.fetchSingleMilestoneAlternatePath(currentLocation.milestoneId, currentLocation.classId);
        const milestoneAlterPath = milestoneAlterPaths[0];
        const milestoneContext = milestoneAlterPath && milestoneAlterPath['context'];
        if (milestoneContext) {
          nextPromise = this.getCurrentLocation().then((collection: CurrentLocation) => {
            collection.collectionId = milestoneContext.ctxCollectionId;
            collection.lessonId = milestoneContext.ctxLessonId;
            collection.unitId = milestoneContext.ctxUnitId;
            collection.milestoneId = milestoneContext.ctxMilestoneId;
            return collection;
          });
        } else {
          nextPromise = this.getCurrentLocation();
        }
      } else {
        nextPromise = this.getCurrentLocation();
      }
    }

    nextPromise.then((collection) => {
      const ctxPathId = collection.ctxPathId || 0;
      const ctxPathType = collection.ctxPathType || null;
      const context = {
        collectionId: collection.collectionId,
        classId: collection.classId,
        milestoneId: collection.milestoneId,
        lessonId: collection.lessonId,
        courseId: collection.courseId,
        pathId: collection.pathId,
        pathType: collection.pathType,
        unitId: collection.unitId,
        collectionType: collection.collectionType,
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        isPublicClass: this.class.isPublic,
        ctxPathId,
        ctxPathType
      };
      const playerUrl = routerPath('studyPlayer');
      this.router.navigate([playerUrl], {
        queryParams: {
          ...context
        }
      });
    });
  }

  /**
   * @function getCurrentLocation
   * This method is used to get current location
   */
  public getCurrentLocation() {
    const currentLocation = this.class.currentLocation;
    return new Promise((resolve) => {
      resolve(currentLocation);
    });
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  private fetchTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      this.tenantSettings = tenantSettings;
    });
  }

  /**
   * @function onClickProficiency
   * This method is used to navigate to proficiency page
   */
  public onClickProficiency() {
    const proficiencyPageURL = routerPathIdReplace('proficiency', this.class.id);
    this.router.navigate([proficiencyPageURL], { queryParams: { fromJourneyPage: true } });
  }

  /**
   * @function navigateToHome
   * This method is used to navigate to home page
   */
  public navigateToHome() {
    const classPageURL = routerPathIdReplace('home', this.class.id);
    if (this.class.isPublic) {
      this.router.navigate([classPageURL], { queryParams: { isPublic: true } });
    } else {
      this.router.navigate([classPageURL]);
    }
  }

  /**
   * @function mapLoaded
   * This method is used to run after map loaded
   */
  public async mapLoaded() {
    if (this.fromDirections) {
      const journeyScreenTourSteps: TourMessagesModel = await this.lookupService.fetchTourMessages('JOURNEY_SCREEN_TOUR_STEPS');
      if (journeyScreenTourSteps) {
        this.startTour('student-journey-start-tour', journeyScreenTourSteps.value);
      }
    }
  }

  /**
   * @function startTour
   * This method is used to start the tour
   */
  private startTour(className, steps) {
    this.tourService.start(className, steps);
  }
}
