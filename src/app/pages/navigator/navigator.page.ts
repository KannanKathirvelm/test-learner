import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Events, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullLeftEnterAnimation, pullLeftLeaveAnimation, } from '@shared/animations/pull-left';
import { pullUpAnimation } from '@shared/animations/pull-up';
import { DiagnosisOfKnowledgeComponent } from '@shared/components/class/diagnosis-of-knowledge/diagnosis-of-knowledge.component';
import { MilestoneInfoComponent } from '@shared/components/milestone-info/milestone-info.component';
import { MilestonePanelPopUpComponent } from '@shared/components/milestone-panel-popup/milestone-panel-popup.component';
import { CompetencyInfoComponent } from '@shared/components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { DomainInfoComponent } from '@shared/components/proficiency/domain-info/domain-info.component';
import { LegendPullUpComponent } from '@shared/components/proficiency/legend-pull-up/legend-pull-up.component';
import { TopicInfoComponent } from '@shared/components/proficiency/topic-info/topic-info.component';
import { EVENTS } from '@shared/constants/events-constants';
import { CLASS_SKYLINE_INITIAL_DESTINATION, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { routerPath, routerPathIdReplace } from '@shared/constants/router-constants';
import { ClassMembersGrade, ClassModel } from '@shared/models/class/class';
import {
  DomainModel,
  DomainTopicCompetencyMatrixModel,
  FwCompetenciesModel,
  MatrixCoordinatesModel, SelectedCompetencyModel,
  SelectedTopicsModel,
  SubjectCompetencyMatrixModel
} from '@shared/models/competency/competency';
import { FeaturedCourseListModel } from '@shared/models/course/course';
import { SubjectModel, TaxonomyGrades, TaxonomyModel } from '@shared/models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { TourMessagesModel } from '@shared/models/tour/tour';
import { ClassProvider } from '@shared/providers/apis/class/class';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { MilestoneProvider } from '@shared/providers/apis/milestone/milestone';
import { NavigateProvider } from '@shared/providers/apis/navigate/navigate';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { CourseService } from '@shared/providers/service/course/course.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { NavigatorService } from '@shared/providers/service/navigator/navigator.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { ToastService } from '@shared/providers/service/toast.service';
import { TourService } from '@shared/providers/service/tour.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { cloneObject, getTimeInMillisec, secondIntoMillisec } from '@shared/utils/global';
import { flattenGutToFwCompetency, flattenGutToFwDomain, getCategoryCodeFromSubjectId, getSubjectCodeFromSubjectBucket } from '@shared/utils/taxonomyUtils';
import { collapseAnimation, } from 'angular-animations';
import axios from 'axios';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.page.html',
  styleUrls: ['./navigator.page.scss'],
  animations: [
    collapseAnimation({ duration: 300, delay: 0 })
  ]
})

export class NavigatorPage implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public activeSubject: SubjectModel;
  public categories: Array<TaxonomyModel>;
  public frameworkId: string;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public fwDomains: Array<DomainModel>;
  public showCompetencyInfo: boolean;
  public showDomainInfo: boolean;
  public isExpandedReport: boolean;
  public selectedCompetency: SelectedCompetencyModel;
  public subjects: Array<SubjectModel>;
  public profilePreferences: Array<string>;
  public domainTopicCompetencyMatrix: Array<DomainTopicCompetencyMatrixModel>;
  public competencyMatrix: Array<DomainTopicCompetencyMatrixModel>;
  public domainCoordinates: Array<MatrixCoordinatesModel>;
  public activeCategory: TaxonomyModel;
  public selectedDomain: DomainModel;
  public isLoaded: boolean;
  public selectedTopic: SelectedTopicsModel;
  public classSubject: string;
  public taxonomyGrades: Array<TaxonomyGrades>;
  public currentGrade: TaxonomyGrades;
  public classTitle: string;
  public currentLocation: SubjectCompetencyMatrixModel;
  public state: string;
  public diagnosticId: string;
  public isIlpInProgress: boolean;
  public class: ClassModel;
  public isShowProficiency: boolean;
  public gradeList: Array<TaxonomyGrades>;
  public userSelectedGradeId: number;
  public subjectCode: string;
  private classId: string;
  public timerSubscription: AnonymousSubscription;
  public classSetupInComplete: boolean;
  public milestonesRoutes: any;
  public ilpInProgressPopUp: any;
  public stateTimerSubscription: AnonymousSubscription;
  public startJourney: boolean;
  public isDisabled: boolean;
  public isShowMilestoneModal: boolean;
  public isSubjectChanged: boolean;
  public isSkylineAvailable: boolean;
  public isPublic: boolean;
  public showPublicClassDiagnostic: boolean; // This property used to determine whether user clicks on Update Location button.
  public currentFeatureCourse: FeaturedCourseListModel;
  public showGradeListPopUp: boolean;
  public isUpdatedRerouteSettings: boolean;
  public isDefaultSkyline: boolean;
  public isSkipDiagnostic: boolean;
  public showLegendInfoPopover: boolean;
  public tenantSettings: TenantSettingsModel;
  public gradeLowerBound: number;
  public destinationGrade: TaxonomyGrades;
  public memberBound: ClassMembersGrade;
  public selectedSubject: SubjectModel;
  public isGradeLevelChanged: boolean;
  public defaultGradeLevel: number;
  public isProgramCourse: boolean;
  public userSelectedUpperBound: number;
  public studentDestinationLevel: TaxonomyGrades;
  private gradeLevel: number;
  private showingGradeLevels: boolean;
  public showNavigateProgramGradeEdit: boolean;
  public enableNavigatorProgram: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private events: Events,
    private navigateProvider: NavigateProvider,
    public modalController: ModalController,
    private utilsService: UtilsService,
    private parseService: ParseService,
    private milestoneService: MilestoneService,
    private navigatorService: NavigatorService,
    private router: Router,
    private competencyService: CompetencyService,
    private activatedRoute: ActivatedRoute,
    private classService: ClassService,
    private courseService: CourseService,
    private loader: LoadingService,
    private profileService: ProfileService,
    private taxonomyService: TaxonomyService,
    private taxonomyProvider: TaxonomyProvider,
    private competencyProvider: CompetencyProvider,
    private alertCtrl: AlertController,
    private sessionService: SessionService,
    private translate: TranslateService,
    private classProvider: ClassProvider,
    private milestoneProvider: MilestoneProvider,
    private toastService: ToastService,
    private lookupService: LookupService,
    private tourService: TourService
  ) {
    this.isExpandedReport = false;
    this.classSetupInComplete = false;
    this.startJourney = true;
    this.isDisabled = false;
    this.isSubjectChanged = true;
    this.isGradeLevelChanged = false;
    this.activatedRoute.queryParams.subscribe(params => {
      const classId = params['classId'];
      const subjectCode = params['subjectCode'];
      const isPublic = params['isPublic'];
      const isProgramCourse = params['isProgramCourse'];
      const userSelectedUpperBound = params['userSelectedUpperBound'];
      if (subjectCode && subjectCode !== this.subjectCode) {
        this.subjectCode = getSubjectCodeFromSubjectBucket(subjectCode);
        this.class = null;
        this.state = null;
        this.frameworkId = null;
        this.isSubjectChanged = true;
        this.classTitle = '';
        this.gradeLowerBound = null;
        this.isGradeLevelChanged = false;
      }
      if (this.classId && !this.subjectCode) {
        this.isSubjectChanged = true;
      }
      if (classId !== this.classId) {
        this.gradeLowerBound = null;
      }
      this.classId = classId;
      this.isPublic = isPublic === 'true';
      this.isProgramCourse = isProgramCourse === 'true';
      this.userSelectedUpperBound = userSelectedUpperBound;
      const forceReload = params['forceReload'];
      this.currentGrade = null;
      this.isSkipDiagnostic = false;
      if (this.classId || this.subjectCode || forceReload) {
        this.loadData();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.fetchTenantSettings();
    this.onShowLegendInfo();
    this.profilePreferences = this.profileService.profilePreferences;
  }

  public ngOnDestroy() {
    this.classService.unSubscribeEvent();
    this.courseService.unSubscribeEvent();
    this.milestoneService.unSubscribeEvent();
    this.competencyService.unSubscribeEvent();
  }

  public ionViewDidEnter() {
    this.isShowProficiency = true;
  }

  public ionViewWillLeave() {
    this.isShowProficiency = false;
    this.navigatorService.setUserSelectedSubject(null);
    this.navigatorService.setDestinationClass(null);
    this.state = null;
    this.clearInterval();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onShowLegendInfo
   * This method is used to show the legend info popover
   */
  public onShowLegendInfo() {
    this.showLegendInfoPopover = this.utilsService.showInfoPopover(1);
  }

  /**
   * @function closeLegendInfo
   * This method is used to close the legend info popover
   */
  public closeLegendInfo() {
    this.showLegendInfoPopover = false;
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  private fetchTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      this.tenantSettings = tenantSettings;
      this.enableNavigatorProgram = this.isPublic && this.tenantSettings && this.tenantSettings.uiElementVisibilitySettings && this.tenantSettings.uiElementVisibilitySettings.enableNavigatorProgram;
    });
  }

  /**
   * @function fetchMilestone
   * This method is used to fetch milestones
   */
  public async fetchMilestone() {
    const classDetails = this.classService.class;
    const classPerference = classDetails.preference;
    const fwCode = classPerference && classPerference.framework ? classPerference.framework : null;
    if (fwCode) {
      const milestones = await this.milestoneService.fetchMilestone();
      this.isDisabled = milestones && !milestones.length;
    }
  }

  /**
   * @function onSelectLegend
   * This method is used to show the legend report
   */
  public onSelectLegend() {
    const studentDestinationLevel = this.studentDestinationLevel;
    const params = {
      activeSubject: this.activeSubject,
      showSkylineContent: true
    };
    this.openModalReport(
      LegendPullUpComponent,
      params,
      `nav-legend-info-component ${studentDestinationLevel && 'navigator-course-card'}`,
      pullUpAnimation,
      pullDownAnimation
    );
  }

  /**
   * @function loadData
   * This method is used to load data
   */
  private async loadData() {
    this.loader.displayLoader();
    if (this.isSubjectChanged) {
      this.isLoaded = false;
      this.isShowMilestoneModal = false;
    }
    if (!this.subjectCode) {
      const userSelectedSubject = this.navigatorService.getUserSelectedSubject;
      if (userSelectedSubject) {
        this.subjectCode = getSubjectCodeFromSubjectBucket(userSelectedSubject.subjectCode);
      }
    }
    if (!this.classId) {
      this.classId = this.navigatorService.getDestinationClass;
    }
    if (this.isPublic) {
      this.checkClassMembers();
      if (this.classId) {
        this.milestonesRoutes = await this.milestoneService.fetchMilestoneRoutes(this.classId, false, this.subjectCode);
      }
    } else {
      this.showPublicClassDiagnostic = false;
      // Here we are checking the class id to find if user is navigated from subject facets or the destination.
      if (this.classId) {
        const classDetails = await this.fetchClassById();
        if (classDetails.isPremiumClass) {
          this.initializeState();
          this.milestonesRoutes = await this.milestoneService.fetchMilestoneRoutes(this.classId, false, this.subjectCode);
        } else {
          this.navigateToCA();
        }
      } else {
        this.class = null;
        this.fetchCategories();
      }
    }
  }

  /**
   * @function navigateToCA
   * This method to navigate to CA
   */
  public navigateToCA() {
    const classActivityUrl = routerPathIdReplace('classActivityFullPath', this.classId);
    this.publishClassJoinedEvent();
    this.router.navigate([classActivityUrl]);
  }

  /**
   * @function checkClassMembers
   * This method is used to check the class members
   */
  private checkClassMembers() {
    if (this.isSubjectChanged) {
      this.loader.displayLoader();
    }
    this.getMemberBound().then((memberBound: ClassMembersGrade) => {
      if (memberBound && memberBound.bounds && memberBound.bounds.gradeUpperBound) {
        this.isUpdatedRerouteSettings = true;
        this.showPublicClassDiagnostic = false;
        this.initializeState();
      } else {
        this.fetchClassDetails();
        this.isUpdatedRerouteSettings = false;
        this.showPublicClassDiagnostic = true;
      }
    });
  }

  /**
   * @function startTour
   * This method is used to start tour
   */
  private async startTour() {
    const navigatorScreenTourSteps: TourMessagesModel = await this.lookupService.getTourMessages('NAVIGATOR_SCREEN_TOUR_STEPS');
    if (navigatorScreenTourSteps) {
      this.tourService.start('navigator-page-tour', navigatorScreenTourSteps.value);
    }
  }

  /**
   * @function getMemberBound
   * This method is used to get the member bound
   */
  private getMemberBound() {
    return new Promise((resolve, reject) => {
      const userId = this.sessionService.userSession.user_id;
      this.classService.fetchClassMembers(this.classId).then((classRes: Array<ClassMembersGrade>) => {
        const memberBound: ClassMembersGrade = classRes.find((classDetails: ClassMembersGrade) => {
          return classDetails.userId === userId;
        });
        resolve(memberBound);
      }, reject);
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
  public playContent() {
    // start studying
    const nextPromise = this.navigateProvider.continueCourse(this.class.course_id, this.class.id)
    .then((data) => {
      if (data.content) {
         return this.navigateProvider.serializeContextForQueryParams(data.context);
      }
      return null;
    });
    nextPromise.then((collection) => {
      if (collection) {
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
        this.publishClassJoinedEvent();
        const playerUrl = routerPath('studyPlayer');
        this.router.navigate([playerUrl], {
          queryParams: {
            ...context
          }
        });
      } else {
        const wentWrongMsg = this.translate.instant('NO_STUDY_MATERIAL');
        this.toastService.presentToast(wentWrongMsg);
        const classPageURL = routerPathIdReplace('home', this.classId);
        this.router.navigate([classPageURL]);
      }
    });
  }

  /**
   * @function publicClassDiagnosticPlay
   * This method is used to play the diagnostic for public class
   */
  public publicClassDiagnosticPlay() {
    this.initializeState();
  }

  /**
   * @function rerouteSetting
   * This method is used to update the reroute settings
   */
  private rerouteSetting(classId, gradeUpperBound, gradeLowerBound, forceCalculateIlp) {
    return new Promise((resolve, reject) => {
      return this.classProvider.rerouteSetting(classId,
        gradeUpperBound,
        gradeLowerBound,
        forceCalculateIlp,
        this.gradeLevel
      ).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * @function onSkipDiagnostic
   * This method is used to skip the diagnostic
   */
  public onSkipDiagnostic() {
    this.showPublicClassDiagnostic = false;
    this.setCurrentLevel();
  }

  /**
   * @function setCurrentLevel
   * This method is used to set the current level
   */
  private setCurrentLevel() {
    this.loader.displayLoader();
    const userId = this.sessionService.userSession.user_id;
    const gradeLowerBound = this.gradeLowerBound;
    this.isSkipDiagnostic = true;
    this.showGradeListPopUp = false;
    this.rerouteSetting(this.classId, this.currentFeatureCourse.settings.grade_upper_bound, gradeLowerBound, true).then(() => {
      this.classProvider.forceCalculateIlp(this.classId, userId).then(() => {
        setTimeout(async () => {
          await this.loader.dismissLoader();
          this.initializeState();
        }, 3000);

      });
    });
  }

  /**
   * @function updateBaseline
   * Method to update baseline
   */
  public updateBaseline() {
    this.loader.displayLoader();
    this.milestoneProvider.updateProfileBaseline(this.classId).then(async () => {
      await this.loader.dismissLoader();
      if (this.milestonesRoutes && this.milestonesRoutes.milestone_route_path_coordinates) {
        this.checkStateDestination();
      } else {
        this.loadState();
      }
    });
  }

  /**
   * @function initializeState
   * Method to initialize the skyline state
   */
  private initializeState() {
    this.state = null;
    this.loader.displayLoader();
    this.getSkylineInitialState().then(async (stateData) => {
      this.state = stateData.destination;
      if (this.isSkylineAvailable) {
        this.checkIsSkylinePresent();
      }
      if (stateData.context && this.state === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay) {
        this.diagnosticId = stateData.context.diagnosticId;
        if (this.isPublic && !this.isUpdatedRerouteSettings) {
          this.onDiagnosticPlay();
        } else {
          this.fetchClassDetails();
        }
      } else if (this.state === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
        this.loader.dismissLoader();
        this.navigateToHome();
      } else if (this.state === CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete) {
        if (this.isPublic) {
          this.checkStateDestination();
        } else {
          this.classSetupInComplete = true;
          this.classService.setActiveClass(this.classId);
        }
      } else {
        // here when user click the set my current level it checks the state for direction if it direction then it redirect to journey
        if (this.showPublicClassDiagnostic && this.state === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections) {
          this.showPublicClassDiagnostic = false;
          await this.loader.dismissLoader();
          this.updateBaseline();
        } else {
          if (this.isGradeLevelChanged) {
            this.loadProficiencyChart();
          } else {
            this.fetchClassDetails();
          }
        }
      }
    }).finally(() => {
      this.loader.dismissLoader();
    });
  }

  /**
   * @function publishClassJoinedEvent
   * Method to publish the class joined event
   */
  public publishClassJoinedEvent() {
    this.events.publish(this.classService.CLASS_JOINED_UPDATE);
  }

  /**
   * @function updateProfileBaseline
   * Method to update the profile baseline
   */
  public updateProfileBaseline() {
    const gradeLowerBound = this.gradeLowerBound;
    this.loader.displayLoader();
    this.classProvider.rerouteSetting(this.classId,
      this.currentFeatureCourse.settings.grade_upper_bound,
      gradeLowerBound,
      true,
      this.gradeLevel
    ).then(() => {
      this.updateBaseline();
    });
  }

  /**
   * @function getSkylineInitialState
   * Method to get the initial skyline state
   */
  private getSkylineInitialState() {
    return this.classService.fetchSkylineInitialState(this.classId);
  }

  /**
   * @function fetchClassDetails
   * This method is used to fetch class Details
   */
  public async fetchClassDetails() {
    this.loader.displayLoader();
    this.fetchClassById().then(async (classDetails) => {
      this.class = classDetails;
      const navigatorProgramCourseList = this.courseService.navigatorProgramCourse;
      let navigatorProgramCourse;
      if (navigatorProgramCourseList && navigatorProgramCourseList.length) {
        navigatorProgramCourse = navigatorProgramCourseList.find((navigatorProgram) => navigatorProgram.id === this.class.course_id && navigatorProgram.navigatorSubProgramId);
      }
      this.classTitle = this.isProgramCourse && navigatorProgramCourse ? navigatorProgramCourse.navigatorProgramInfo.title : classDetails.title;
      // Show Grade edit option based on the jump start course.
      this.showNavigateProgramGradeEdit = this.isProgramCourse && navigatorProgramCourse ? navigatorProgramCourse.navigatorProgramInfo.navigate_program_grade_edit : true;
      this.classService.setClass(this.class);
      if (!this.subjectCode) {
        const subjectCode = await this.getClassSubjectCode();
        this.subjectCode = getSubjectCodeFromSubjectBucket(subjectCode);
      }
      if (this.subjectCode) {
        this.fetchClassTaxonomy();
      }
      this.fetchCategories();
    });
  }

  /**
   * @function fetchClassById
   * This method is used to fetch class by id
   */
  public fetchClassById() {
    return this.classService.fetchClassById(this.classId);
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
      if (this.subjectCode) {
        return Promise.resolve(this.subjectCode);
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
  public async fetchClassTaxonomy() {
    const taxonomySubject = await this.taxonomyService.fetchSubjectById(this.subjectCode);
    this.classService.setClassTaxonomy(taxonomySubject);
  }

  /**
   * @function getFrameworkId
   * Method to get the frameworkId
   */
  public getFrameworkId(subjectCode) {
    return this.profilePreferences[`${subjectCode}`];
  }

  /**
   * @function onBack
   * Method to close the navigator page
   */
  public onBack() {
    this.publishClassJoinedEvent();
    this.router.navigate(['/student-home']);
  }

  /**
   * @function changeGrade
   * Method to change grade
   */
  public changeGrade(gradeId) {
    this.isGradeLevelChanged = true;
    this.loader.displayLoader();
    const initialGrade = this.currentGrade.grade;
    const gradeList = this.showingGradeLevels && this.gradeList.length ? this.gradeList : this.taxonomyGrades;
    this.currentGrade = gradeList.find((taxonomyGrade) => {
      return Number(gradeId) === Number(taxonomyGrade.id);
    });
    const grade = this.taxonomyGrades.find((gradeItem: any) => {
      const levels = gradeItem.levels || [];
      return levels.find((gradeLevel) => gradeLevel.id === gradeId);
    });
    this.gradeLowerBound = this.showingGradeLevels && grade ? grade.id : this.currentGrade.id;
    if (this.showingGradeLevels) {
      this.gradeLevel = this.currentGrade.id;
    }
    this.trackCurrentLevelEvent(initialGrade);
    this.onSkipDiagnostic();
  }

  /**
   * @function getCurrentLevelEventContext
   * This method is used to get the context for current level event
   */
  private getCurrentLevelEventContext(initialGrade) {
    const classInfo = this.class;
    const subject = classInfo.preference ? classInfo.preference.subject : null;
    const framework = classInfo.preference ? classInfo.preference.framework : null;
    return {
      title: classInfo.title,
      classId: classInfo.id,
      courseId: classInfo.course_id,
      courseTitle: classInfo.course_title,
      code: classInfo.code,
      isPublic: classInfo.isPublic,
      subject,
      framework,
      initialGrade,
      currentGrade: this.currentGrade.grade
    };
  }

  /**
   * @function trackCurrentLevelEvent
   * This method is used to track the current level event
   */
  private trackCurrentLevelEvent(initialGrade) {
    const context = this.getCurrentLevelEventContext(initialGrade);
    this.parseService.trackEvent(EVENTS.ASSERT_LEVEL, context);
  }

  /**
   * @function skylinePresent
   * This method is used to check the SkyLine is present
   */
  public skylinePresent() {
    this.isSkylineAvailable = true;
    this.checkIsSkylinePresent();
  }

  /**
   * @function checkIsSkylinePresent
   * This method is used to check the SkyLine is present
   */
  private checkIsSkylinePresent() {
    if (this.state === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress) {
      this.isIlpInProgress = true;
    } else {
      this.isIlpInProgress = false;
    }
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
   * @function onClickDirection
   * This method triggers when user click direction
   */
  public onClickDirection() {
    const classId = this.class.id;
    if (this.isIlpInProgress) {
      this.showILPInProgressPopUp();
    } else {
      if (this.class.isPublic && this.currentFeatureCourse && this.currentFeatureCourse.settings.grade_upper_bound) {
        const gradeLowerBound = this.gradeLowerBound;
        if (this.showPublicClassDiagnostic) {
          this.setCurrentLevel();
        } else {
          this.classProvider.rerouteSetting(classId, this.currentFeatureCourse.settings.grade_upper_bound, gradeLowerBound, false, this.gradeLevel).then(() => {
            this.milestoneProvider.updateProfileBaseline(classId).then(() => {
              if (this.milestonesRoutes && this.milestonesRoutes.milestone_route_path_coordinates) {
                this.checkStateDestination();
              } else {
                this.loadState();
              }
            });
          });
        }
      } else {
        this.milestoneProvider.updateProfileBaseline(classId).then(() => {
          if (this.milestonesRoutes && this.milestonesRoutes.milestone_route_path_coordinates) {
            this.checkStateDestination();
          } else {
            this.loadState();
          }
        });
      }
    }
  }

  /**
   * @function loadState
   * This method is used to load the state again
   */
  private loadState() {
    this.isLoaded = false;
    this.loader.displayLoader();
    // Here we are using the setTimeout to call the state api after 3 sec
    setTimeout(() => {
      this.getSkylineInitialState().then((stateData) => {
        this.state = stateData.destination;
        if (this.state === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
          this.fetchMilestone();
        }
        this.isLoaded = true;
        this.loader.dismissLoader();
      });
    }, 3000);
  }

  /**
   * @function showILPInProgressPopUp
   * This method is used to show the the ILP pop up
   */
  private async showILPInProgressPopUp() {
    this.ilpInProgressPopUp = await this.alertCtrl.create({
      message: this.translate.instant('ILP_POP_UP_MSG'),
      buttons: [
        {
          text: this.translate.instant('RETRY'),
          handler: () => {
            this.checkStateIsShowDirection();
            return false;
          }
        }, {
          text: this.translate.instant('OKAY'),
          handler: () => {
            this.navigateToStudentHome();
          }
        }
      ],
      backdropDismiss: false
    });
    await this.ilpInProgressPopUp.present();
  }

  /**
   * @function navigateToStudentHome
   * This method is used to navigate to student home
   */
  private navigateToStudentHome() {
    this.onBack();
  }

  /**
   * @function checkStateDestination
   * This method is used to check state destination
   */
  public checkStateDestination() {
    this.loader.displayLoader();
    // interval runs for every 5sec to 3minutes
    const intervalTime = secondIntoMillisec(5);
    const maxIntervalTime = getTimeInMillisec(0, 3);
    const startTime = moment().valueOf();
    this.clearInterval();
    this.timerSubscription = Observable.interval(intervalTime).subscribe(() => {
      if (moment().valueOf() - startTime > maxIntervalTime) {
        this.clearInterval();
        this.loader.dismissLoader();
        const baselineTimeoutMsg = this.translate.instant('BASELINE_TAKING_TIME_MSG');
        this.toastService.presentToast(baselineTimeoutMsg);
        this.onBack();
        return;
      } else {
        this.classService.fetchSkylineInitialState(this.class.id).then((stateData) => {
          const destination = stateData.destination;
          if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
            this.loader.dismissLoader();
            setTimeout(() => {
              this.startTour();
            }, 1000);
            this.clearInterval();
            this.navigateToJourney();
          }
        });
      }
    });
  }



  /**
   * @function checkStateIsShowDirection
   * This method is used to check state SkyLine initial state
   */
  public checkStateIsShowDirection() {
    this.loader.displayLoader();
    const classId = this.class.id;
    // interval runs for every 5sec to 1 minutes
    const intervalTime = secondIntoMillisec(5);
    const maxIntervalTime = getTimeInMillisec(0, 1);
    const startTime = moment().valueOf();
    this.stateTimerSubscription = Observable.interval(intervalTime).subscribe(() => {
      if (moment().valueOf() - startTime > maxIntervalTime) {
        this.clearInterval();
        this.loader.dismissLoader();
        return;
      } else {
        this.classService.fetchSkylineInitialState(this.class.id).then((stateData) => {
          const destination = stateData.destination;
          if (destination !== CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress) {
            this.loader.dismissLoader().then(() => {
              this.clearInterval();
              this.ilpInProgressPopUp.dismiss();
              this.state = destination;
            });
          }
          if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections) {
            const gradeLowerBound = this.gradeLowerBound;
            const rerouteSetting = this.class.isPublic && this.currentFeatureCourse && this.currentFeatureCourse.settings.grade_upper_bound ?
              this.classProvider.rerouteSetting(classId, this.currentFeatureCourse.settings.grade_upper_bound, gradeLowerBound, false, this.gradeLevel) : null;
            axios.all<{}>([
              rerouteSetting
            ]).then(axios.spread(() => {
              this.milestoneProvider.updateProfileBaseline(classId).then(() => {
                this.navigateToJourney();
              });
            }));
          }
        });
      }
    });
  }

  /**
   * @function clearInterval
   * This method clear intervals
   */
  public clearInterval() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.stateTimerSubscription) {
      this.stateTimerSubscription.unsubscribe();
    }
  }

  /**
   * @function navigateToJourney
   * This method to navigate to journey
   */
  public navigateToJourney() {
    this.isShowProficiency = false;
    this.isShowMilestoneModal = false;
    const pageName = (this.milestonesRoutes && this.milestonesRoutes.milestone_route_path_coordinates) ? 'journey' : 'home';
    const pageUrl = routerPathIdReplace(pageName, this.class.id);
    this.publishClassJoinedEvent();
    this.router.navigate([pageUrl], {
      queryParams: {
        fromDirections: true
      }
    });
  }

  /**
   * @function navigateToHome
   * This method to navigate to home
   */
  public navigateToHome() {
    this.isShowProficiency = false;
    this.isShowMilestoneModal = false;
    const classPageURL = routerPathIdReplace('home', this.classId);
    this.publishClassJoinedEvent();
    this.router.navigate([classPageURL]);
  }

  /**
   * @function onDiagnosticPlay
   * This method triggers when user click diagnostic play
   */
  public async onDiagnosticPlay() {
    const diagnosticId = this.diagnosticId;
    const classInfo = this.class;
    const classId = classInfo.id;
    const taxonomySubject = this.classService.classTaxonomy;
    const props = {
      diagnosticId,
      classId,
      classInfo,
      taxonomySubject: {
        subject: taxonomySubject ? taxonomySubject.title : null
      },
      isProgramCourse: this.isProgramCourse,
      userSelectedUpperBound: this.userSelectedUpperBound
    };
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: DiagnosisOfKnowledgeComponent,
      componentProps: props,
      cssClass: 'diagnostic-modal',
      enterAnimation: pullLeftEnterAnimation,
      leaveAnimation: pullLeftLeaveAnimation
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data && dismissContent.data.isTakeDiagnostic && this.showPublicClassDiagnostic) {
        this.updateRerouteSettings();
      }
    });
    await modal.present();
  }

  /**
   * @function updateRerouteSettings
   * Method to update reroute settings
   */
  public async updateRerouteSettings() {
    const gradeLowerBound = this.gradeLowerBound;
    await this.rerouteSetting(this.classId, this.currentFeatureCourse.settings.grade_upper_bound, gradeLowerBound, false);
    this.showPublicClassDiagnostic = false;
  }

  /**
   * @function loadTaxonomyGrades
   * Method to load taxonomy grades
   */
  private loadTaxonomyGrades(subject, frameworkId) {
    const tenantPrefFwIds = this.tenantSettings.twFwPref || {};
    const tenantPrefFwId = tenantPrefFwIds[subject.code];
    const prefFrameworkId = this.isProgramCourse && tenantPrefFwId ? tenantPrefFwId['default_fw_id'] : frameworkId;
    const filters = {
      subject: subject.code,
      fw_code: prefFrameworkId
    };
    return this.taxonomyService.fetchGradesBySubject(filters)
      .then((taxonomyGrades: Array<TaxonomyGrades>) => {
        this.taxonomyGrades = taxonomyGrades.sort((grade1, grade2) =>
          grade1.sequenceId - grade2.sequenceId);
        if (this.class) {
          this.isShowMilestoneModal = true;
        }
      });
  }

  /**
   * @function getCurrentDestinationGrade
   * Method to get the current destination grade
   */
  public getCurrentDestinationGrade() {
    this.courseService.getFeaturedCourse().then((courseRes: Array<FeaturedCourseListModel>) => {
      const currentFeatureCourse = courseRes.find((item) => item.id === this.class.course_id);
      this.currentFeatureCourse = currentFeatureCourse;
      if (this.isProgramCourse && this.userSelectedUpperBound) {
        this.currentFeatureCourse.settings.grade_upper_bound = Number(this.userSelectedUpperBound);
      }
    });
  }

  /**
   * @function setGradeList
   * Method to set grade list
   */
  public setGradeList(gradeLevelDiff?) {
    const profileDetails = this.profileService.currentUserProfileDetail;
    const profileInfo = profileDetails.info;
    const currentFeatureCourse = this.currentFeatureCourse;
    if (currentFeatureCourse) {
      // set default grade level for feature course
      this.defaultGradeLevel = currentFeatureCourse.defaultGradeLevel;
      // taxonomy grade order by sequence id
      const taxonomyGrades = this.taxonomyGrades.sort(
        (grade1, grade2) => grade1.sequenceId - grade2.sequenceId
      );
      // get current course lower bound with sequence id based on id
      let courseLowerBound = taxonomyGrades.find(
        (item) => Number(item.id) === currentFeatureCourse.settings.grade_current
      );
      // get course lower bound using the grade level diff from tenant settings
      if (gradeLevelDiff) {
        const gradeLowerBoundSeq = courseLowerBound.sequenceId - gradeLevelDiff;
        if (gradeLowerBoundSeq >= 1) {
          courseLowerBound = taxonomyGrades.find((item) => Number(item.sequenceId) === gradeLowerBoundSeq);
        }
      }
      this.loadProficiencyChart();
      // get current course upper bound with sequence id based on id
      const courseUpperBound = taxonomyGrades.find(
        (item) => Number(item.id) === currentFeatureCourse.settings.grade_upper_bound
      );
      this.destinationGrade = courseUpperBound;
      let grades = taxonomyGrades;
      // for program course, we shouldn't filter by lower & upper bound of course.
      if (!this.isProgramCourse) {
        // filter out the grades list of between lower bound and upper bound of course
        grades = taxonomyGrades.filter(
          (item) => Number(item.sequenceId) >= courseLowerBound.sequenceId &&
            Number(item.sequenceId) <= courseUpperBound.sequenceId
        );
      }
      if (this.memberBound) {
        // check user selected grade in between course lower bound and upper bound
        let lowerBound = this.memberBound.bounds.gradeLowerBound;
        // if it's a program course, since we already set the lower bound based on tenant settings.
        if (!this.isProgramCourse) {
          if (gradeLevelDiff) {
            lowerBound = courseLowerBound.id;
          }
          // set lowerbound as a default grade level
          if (this.defaultGradeLevel) {
            lowerBound = this.defaultGradeLevel;
            this.isSkipDiagnostic = true;
          }
        }
        const gradeInGradesList = grades.find(
          (item) => Number(item.id) === Number(lowerBound)
        );
        // if user bound is not match get sequence id and id from taxonomy grade
        const gradeInTaxonomyList = taxonomyGrades.find(
          (item) => Number(item.id) === Number(this.memberBound.bounds.gradeLowerBound)
        );
        if (profileInfo) {
          this.studentDestinationLevel = taxonomyGrades.find(
            (taxonomyGrade) => taxonomyGrade.grade.toLowerCase() === profileInfo.grade_level.toLowerCase());
        }
        this.userSelectedGradeId = gradeInTaxonomyList.id;
        if (gradeInGradesList) {
          this.currentGrade = gradeInGradesList;
        } else {
          if (gradeInTaxonomyList.sequenceId <= courseLowerBound.sequenceId) {
            // need to set lower as intial value
            this.currentGrade = grades[0];
            this.userSelectedGradeId = grades[0].id;
          } else {
            // need to set upper bound as destination
            this.currentGrade = grades[grades.length - 1];
          }
        }
        this.gradeLowerBound = this.currentGrade.id;
        const initialGrade = taxonomyGrades[0];
        const filteredGrades = taxonomyGrades.filter(
          (item) => Number(item.sequenceId) >= initialGrade.sequenceId &&
            Number(item.sequenceId) <= courseUpperBound.sequenceId
        );
        this.gradeList = this.isProgramCourse ? this.filterTaxonomyGrades(courseUpperBound) : filteredGrades;
        // Help to update member lower grade bound value based on default grade level for indepedent course
        if (this.defaultGradeLevel) {
          this.trackCurrentLevelEvent(this.currentGrade.grade);
          this.onSkipDiagnostic();
        }
        // here we don't show the grade pop up after user click the set your current location
        this.showGradeListPopUp = (this.gradeList && this.gradeList.length > 1) && !this.isSkipDiagnostic;
      }
    }
  }

  /*
  * @function filterTaxonomyGrades
  * This method to filter taxonomy grades
  */
  private filterTaxonomyGrades(courseUpperBound) {
    const tempTaxonomyGrades = cloneObject(this.taxonomyGrades);
    let sourceGrades = [];
    if (tempTaxonomyGrades) {
      const rangeEndSelectionItem = tempTaxonomyGrades.find((item) => item.id === courseUpperBound.id);
      const rangeEndSelectionIndex = tempTaxonomyGrades.indexOf(rangeEndSelectionItem);
      const tempSourceItems = tempTaxonomyGrades.slice(0, rangeEndSelectionIndex + 1);
      sourceGrades = tempSourceItems;
      const hasShowGradeLevel = tempTaxonomyGrades.find((item) => item.showGradeLevel);
      if (hasShowGradeLevel) {
        this.showingGradeLevels = true;
        let mathGradeLevels = [];
        tempSourceItems.forEach((item) => {
          const gradeLevels = item.levels;
          if (item.id === this.currentGrade.id) {
            const sortedGradeLevels = gradeLevels.sort((grade1, grade2) => grade1.sequenceId - grade2.sequenceId);
            this.currentGrade = sortedGradeLevels[0];
            this.gradeLevel = this.currentGrade.id;
          }
          mathGradeLevels = mathGradeLevels.concat(gradeLevels);
        });
        sourceGrades = mathGradeLevels;
      }
    }
    return sourceGrades;
  }

  /**
   * @function loadProficiencyChart
   * This method to load chart
   */
  private loadProficiencyChart() {
    this.domainTopicCompetencyMatrix = this.competencyMatrix;
    this.isLoaded = true;
    this.isSubjectChanged = false;
    if (this.class) {
      this.isShowMilestoneModal = true;
    }
  }

  /**
   * @function onSelectDomain
   * This method is used to open the domain report
   */
  public onSelectDomain(domain) {
    this.showDomainInfo = true;
    const params = {
      domain,
      fwCompetencies: this.fwCompetencies
    };
    this.openModalReport(
      DomainInfoComponent,
      params,
      'nav-domain-info-component',
      pullUpAnimation,
      pullDownAnimation
    );
  }


  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  private fetchCategories() {
    if (this.isPublic) {
      this.getCurrentDestinationGrade();
    }
    this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
      this.categories = categories;
      const classificationCode = getCategoryCodeFromSubjectId(this.subjectCode);
      const category = categories.find((categoryObj) => {
        return categoryObj.code === classificationCode;
      });
      this.activeCategory = category;
      this.fetchSubjects(this.activeCategory.id);
    });
  }

  /**
   * @function fetchSubjects
   * Method to fetch the subjects
   */
  public fetchSubjects(categoryId) {
    this.taxonomyProvider.fetchSubjects(categoryId).then((subjects) => {
      const subjectCode = this.subjectCode;
      const activeSubject = subjects.find((subject) => {
        return subject.code === subjectCode;
      });
      const defaultSubject = activeSubject ? activeSubject : subjects[0];
      this.selectedSubject = defaultSubject;
      this.onSelectSubject(defaultSubject);
      this.subjects = subjects;
    });
  }

  /**
   * @function onSelectSubject
   * This method is used to load the data based on the selected subject
   */
  public onSelectSubject(subject) {
    const frameworkId = this.class && this.class.preference ? this.class.preference.framework : null;
    if (this.isSubjectChanged) {
      this.isLoaded = false;
      this.loader.displayLoader();
    }
    if (frameworkId) {
      this.frameworkId = frameworkId;
    }
    if (subject.code === this.subjectCode) {
      this.loadTaxonomyGrades(subject, frameworkId);
    } else {
      this.taxonomyGrades = null;
    }
    this.activeSubject = subject;
    this.loadChartData();
  }

  /**
   * @function chartLoded
   * This method is used to dismiss the loader
   */
  public chartLoded() {
    this.loader.dismissLoader();
    this.startTour();
  }

  /**
   * @function onSelectTopic
   * This method is used to open the topic pull up
   */
  public onSelectTopic(topic) {
    const params = {
      content: topic,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      competencyPullUpClassName: 'nav-competency-info-component'
    };
    this.openModalReport(
      TopicInfoComponent,
      params,
      'nav-topic-info-component',
      pullUpAnimation,
      pullDownAnimation
    );
  }

  /**
   * @function onShowMilestoneInfoPopUp
   * This method is used to show the milestone popup
   */
  public async onShowMilestoneInfoPopUp() {
    const componentProps = {
      currentGrade: this.currentGrade,
      showGradeListPopUp: this.showGradeListPopUp,
      gradeList: this.gradeList
    };
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: MilestonePanelPopUpComponent,
      componentProps,
      cssClass: 'milestone-panel-popup-component',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data && dismissContent.data.selectedDestinationId) {
        this.changeGrade(dismissContent.data.selectedDestinationId);
      }
      if (dismissContent.data && dismissContent.data.publicClassDiagnosticPlay) {
        this.publicClassDiagnosticPlay();
      }
    });
    await modal.present();
  }

  /**
   * @function loadCrossWalkData
   * This method is used to fetch the cross Walk Data
   */
  public loadCrossWalkData() {
    return new Promise((resolve, reject) => {
      if (this.frameworkId) {
        const subjectCode = this.activeSubject.code;
        return this.taxonomyService.fetchCrossWalkFWC(this.frameworkId, subjectCode)
          .then((crossWalkData) => {
            resolve(crossWalkData);
          }, (error) => {
            resolve([]);
          });
      } else {
        resolve([]);
      }
    });
  }

  /**
   * @function loadChartData
   * This method is used to get the chart data
   */
  private loadChartData() {
    return axios.all<{}>([
      !this.isGradeLevelChanged ? this.fetchDomainTopicCompetencyMatrix() : null,
      !this.isGradeLevelChanged ? this.fetchCompetencyMatrixCordinates() : null,
      this.isPublic ? this.getMemberBound() : null,
      !this.isGradeLevelChanged ? this.loadCrossWalkData() : null
    ]).then(axios.spread((domainTopicCompetencyMatrix: Array<any>, matrixCoordinates: Array<MatrixCoordinatesModel>, memberBound: ClassMembersGrade, crossWalkData: any) => {
      this.memberBound = memberBound;
      const isPublicClass = this.isPublic;
      if (!this.isGradeLevelChanged) {
        const masteredCompetencies = domainTopicCompetencyMatrix.find((domain) => {
          return domain.masteredCompetencies > 0;
        });
        if (masteredCompetencies) {
          this.fetchUserSubjectCompetencyMatrix();
        }
        this.fwCompetencies = flattenGutToFwCompetency(crossWalkData);
        this.fwDomains = flattenGutToFwDomain(crossWalkData);
        this.competencyMatrix = domainTopicCompetencyMatrix;
        this.isDefaultSkyline = !masteredCompetencies && isPublicClass;
      }
      // check the class has no skyline data
      if (this.isDefaultSkyline) {
        // check the class already has the lower bound
        if (!this.gradeLowerBound) {
          this.getGradeLowerBoundByTenantSettings();
        } else {
          this.loadProficiencyChart();
        }
      } else {
        // check the class already has the grade and is it a public class
        if (isPublicClass && !this.currentGrade) {
          this.handleCurrentGrade();
        } else {
          this.setClassCurrentGrade();
          this.loadProficiencyChart();
        }
      }
      if (!this.isGradeLevelChanged) {
        this.domainCoordinates = matrixCoordinates;
      }
    }), () => {
      this.fwCompetencies = [];
      this.fwDomains = [];
      this.domainTopicCompetencyMatrix = [];
      this.domainCoordinates = [];
      this.isSubjectChanged = false;
      this.isDefaultSkyline = false;
      this.isLoaded = true;
    }).finally(() => {
      this.loader.dismissLoader();
    });
  }

  /**
   * @function setClassCurrentGrade
   * This method to set the class current grade
   */
  public setClassCurrentGrade() {
    if (this.class) {
      const currentGrade = this.class.grade_current ? this.class.grade_current : null;
      if (currentGrade) {
        this.destinationGrade = this.taxonomyGrades.find((item) => Number(item.id) === currentGrade);
      }
    }
  }

  /**
   * @function handleCurrentGrade
   * This method to handle the current grade
   */
  public handleCurrentGrade() {
    // here it checks the class already has the lower and upper bound, is it has both then it will show the lowerBound as current grade and upper as destination
    if (this.memberBound && this.memberBound.bounds && this.memberBound.bounds.gradeUpperBound && this.memberBound.bounds.gradeLowerBound) {
      this.destinationGrade = this.taxonomyGrades.find((item) => Number(item.id) === this.currentFeatureCourse.settings.grade_upper_bound);
      this.currentGrade = this.taxonomyGrades.find(
        (item) => Number(item.id) === Number(this.memberBound.bounds.gradeLowerBound)
      );
      this.gradeLowerBound = this.currentGrade.id;
      if (this.memberBound.bounds.gradeLevel) {
        this.gradeLevel = this.memberBound.bounds.gradeLevel;
      }
      this.studentDestinationLevel = this.destinationGrade;
      this.loadProficiencyChart();
    } else {
      this.setGradeList();
    }
  }

  /**
   * @function getGradeLowerBoundByTenantSettings
   * This method to get the grade lower bound by using tenant settings
   */
  private getGradeLowerBoundByTenantSettings() {
    // get the class grade diff from tenant settings
    const defaultGradeDiff = this.tenantSettings.defaultSkylineGradeDiffForDiagnostic ? this.tenantSettings.defaultSkylineGradeDiffForDiagnostic : null;
    const gradeDiff = this.tenantSettings.defaultSkylineGradeDiff && this.tenantSettings.defaultSkylineGradeDiff[`${this.frameworkId}.${this.subjectCode}`] ?
      this.tenantSettings.defaultSkylineGradeDiff[`${this.frameworkId}.${this.subjectCode}`] : defaultGradeDiff;
    if (!gradeDiff) {
      // tslint:disable-next-line
      console.error(`tenant default grade diff is empty for given class ${this.classId}`);
    }
    this.setGradeList(gradeDiff);
  }


  /**
   * @function fetchDomainTopicCompetencyMatrix
   * Method to fetch the topic competency matrix
   */
  private fetchDomainTopicCompetencyMatrix() {
    const subjectCode = this.activeSubject.code;
    const currentDate = moment();
    const month = currentDate.format('M');
    const year = currentDate.format('YYYY');
    return this.competencyProvider.fetchDomainTopicCompetencyMatrix(subjectCode, year, month);
  }

  /**
   * @function fetchUserSubjectCompetencyMatrix
   * Method to fetch user subject competency matrix
   */
  public fetchUserSubjectCompetencyMatrix() {
    const user = this.sessionService.userSession.user_id;
    const currentDate = moment();
    const month = currentDate.format('M');
    const year = currentDate.format('YYYY');
    const params = {
      month,
      year,
      user
    };
    this.competencyService.fetchUserSubjectCompetencyMatrix(params);
  }

  /**
   * @function closeDomainInfoPullUp
   * This method is used to close the domain pull up
   */
  public closeDomainInfoPullUp() {
    this.showDomainInfo = false;
  }

  /**
   * @function fetchCompetencyMatrixCordinates
   * Method to fetch the matrix coordinates
   */
  private fetchCompetencyMatrixCordinates() {
    const subject = {
      subject: this.activeSubject.code
    };
    return this.competencyProvider.fetchSubjectDomainTopicMetadata(subject);
  }

  /**
   * @function closePullUp
   * This method is used to close the pull up
   */
  public closePullUp() {
    this.showCompetencyInfo = false;
  }

  /**
   * @function onSelectCompetency
   * This method is used to get the selected values from chart
   */
  public onSelectCompetency(competency) {
    this.showCompetencyInfo = true;
    const params = {
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      selectedCompetency: competency
    };
    this.openModalReport(
      CompetencyInfoComponent,
      params,
      'nav-competency-info-component',
      pullUpAnimation,
      pullDownAnimation
    );
  }

  /**
   * @function openModalReport
   * This method is used to open modal report
   */
  public async openModalReport(component, componentProps, cssClass, enterAnimation, leaveAnimation) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component,
      componentProps,
      cssClass,
      enterAnimation,
      leaveAnimation
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data && dismissContent.data.isCloseCompetencyReport) {
        this.closePullUp();
      }
      if (dismissContent.data && dismissContent.data.isCloseDomainReport) {
        this.closeDomainInfoPullUp();
      }
    });
    await modal.present();
  }

  /**
   * @function onToggleInfo
   * This method is used to toggle the info pullup
   */
  public async onToggleInfo() {
    const componentProps = {
      classTitle: this.class.title,
      currentGrade: this.destinationGrade,
      destination: this.state,
      showPublicClassDiagnostic: this.showPublicClassDiagnostic,
      isIlpInProgress: this.isIlpInProgress,
      isDisabled: this.isDisabled
    };
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: MilestoneInfoComponent,
      componentProps,
      cssClass: 'milestone-info',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data && dismissContent.data.isDirections) {
        this.onClickDirection();
      }
      if (dismissContent.data && dismissContent.data.isDiagnosticPlay) {
        this.onDiagnosticPlay();
      }
      if (dismissContent.data && dismissContent.data.isShowMilestoneInfoPopUp) {
        this.onShowMilestoneInfoPopUp();
      }
      if (dismissContent.data && dismissContent.data.isLessonList) {
        this.navigateToHome();
      }
      if (dismissContent.data && dismissContent.data.clickStart) {
        this.onClickStart();
      }
    });
    await modal.present();
  }

  public onSelectedOption(event) {
    if (event === PLAYER_EVENT_SOURCE.DIAGNOSTIC) {
      this.publicClassDiagnosticPlay();
    } else if (event) {
      this.showGradeList();
    }
  }

  /**
   * @function showGradeList
   * This method used to show grade list in alert
   */
  public async showGradeList() {
    const gradeListOptions = [...this.gradeList];
    const gradeRadioInputs = [];
    gradeListOptions.map((gradeItem, index) => {
      const radioInput = {
        name: `radio-${index}`,
        type: 'radio',
        label: gradeItem.grade,
        value: gradeItem.id,
        checked: this.currentGrade.id === gradeItem.id
      };
      gradeRadioInputs.push(radioInput);
    });
    const alert = await this.alertCtrl.create({
      cssClass: 'radio-grade-list',
      header: this.translate.instant('CHOOSE_SKYLINE_GRADE'),
      inputs: gradeRadioInputs,
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: this.translate.instant('SUBMIT'),
          handler: selectedId => {
            this.changeGrade(selectedId);
          }
        }
      ]
    });
    await alert.present();
  }
}
