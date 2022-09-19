import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChangePasswordComponent } from '@app/components/change-password/change-password.component';
import { UserPersonalDetailsComponent } from '@app/components/user-personal-details/user-personal-details.component';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ProfileProvider } from '@app/shared/providers/apis/profile/profile';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { environment } from '@environment/environment';
import { Events, IonContent, IonInput } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '@providers/service/translation.service';
import { EVENTS } from '@shared/constants/events-constants';
import { SKILLS_FRAMEWORK_ID } from '@shared/constants/helper-constants';
import { ClassModel } from '@shared/models/class/class';
import { FeaturedCourseListModel, GroupedFeaturedCourseModel } from '@shared/models/course/course';
import { TourMessagesModel } from '@shared/models/tour/tour';
import { AppService } from '@shared/providers/service/app.service';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { CourseService } from '@shared/providers/service/course/course.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { TourService } from '@shared/providers/service/tour.service';
import { collapseAnimation } from 'angular-animations';
import * as moment from 'moment';

@Component({
  selector: 'nav-student-home',
  templateUrl: './student-home.page.html',
  styleUrls: ['./student-home.page.scss'],
  animations: [
    collapseAnimation({ duration: 300, delay: 0 })
  ]
})
export class StudentHomePage implements OnInit, OnDestroy {
  @ViewChild(IonInput, null) public search: IonInput;
  @ViewChild(IonContent, { static: false }) public content: IonContent;
  public showPublicClass = environment.SHOW_PUBLIC_CLASS;
  public isNewUser: boolean;
  public isClassesLoaded: boolean;
  public classList: Array<ClassModel>;
  public indepententClassList: Array<ClassModel>;
  public filteredClassList: Array<ClassModel>;
  public featuredCourseList: Array<GroupedFeaturedCourseModel>;
  public loadingPerformance: boolean;
  public startCourseIndex: number;
  public isShowRecentJounrey: boolean;
  public isMoreClasses: boolean;
  public userId: string;
  public isLoaded: boolean;
  public isShowJoinClass = true;
  public enableNavigatorProgram: boolean;
  public tenantSettings: TenantSettingsModel;
  public isEnableChangePassword: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private lookupService: LookupService,
    private parseService: ParseService,
    private events: Events,
    private session: SessionService,
    private competencyService: CompetencyService,
    private appService: AppService,
    private taxonomyService: TaxonomyService,
    private profileService: ProfileService,
    private activatedRoute: ActivatedRoute,
    private classService: ClassService,
    private zone: NgZone,
    private courseService: CourseService,
    private tourService: TourService,
    private translationService: TranslationService,
    private translate: TranslateService,
    private profileProvider: ProfileProvider,
    private modalService: ModalService
  ) {
    this.isShowRecentJounrey = true;
    this.userId = this.session.userSession.user_id;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.isReload) {
        this.refreshData();
        this.onInitLoad();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Events

  public async ngOnInit() {
    this.onInitLoad();
  }

  public async onInitLoad() {
    const userDetailsData = await this.profileProvider.fetchProfileDetails();
    this.isEnableChangePassword = userDetailsData.enableForcePasswordChange;
    if (this.isEnableChangePassword) {
      this.modalService.open(ChangePasswordComponent, { isChangedPassword: true }, 'change-password');
    }
    await this.appService.initialize();
    this.fetchProfilePreference();
    this.fetchCategories();
    this.loadData();
    this.subscribeToUpdateClassList();
    this.trackAppOpenEvent();
    this.subscribeToTakeTour();
    this.loadLanguage();
    this.loadTenantSettings();
    this.loadSubPrograms();
  }

  public ngOnDestroy() {
    this.events.unsubscribe(this.lookupService.TAKE_TOUR);
    this.events.unsubscribe(this.classService.CLASS_JOINED_UPDATE);
    this.competencyService.unSubscribeEvent();
  }

  public async ionViewDidEnter() {
    this.appService.handleAppNotification();
    this.fetchUserSubjectCompetencyMatrix();
    await this.updateClassList();
    this.handleClassList();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadLanguage
   * This method is used to load language
   */
  private async loadLanguage() {
    const lang = await this.translationService.getLanguage();
    this.translate.reloadLang(lang);
  }

  /**
   * @function startTour
   * This method is used to start the tour
   */
  public async startTour() {
    const className = 'HOME_SCREEN_TOUR_STEPS';
    const isTourApplicable = await this.tourService.isTourApplicable(className);
    if (isTourApplicable) {
      this.isShowRecentJounrey = false;
      const homeScreenTourSteps: TourMessagesModel = await this.lookupService.fetchTourMessages(className);
      if (homeScreenTourSteps) {
        const options = { padding: 0 };
        this.tourService.start(className, homeScreenTourSteps.value, options);
      }
    }
  }

  /**
   * @function subscribeToTakeTour
   * This method is used to subscribe take tour
   */
  public subscribeToTakeTour() {
    this.events.subscribe(this.lookupService.TAKE_TOUR, () => {
      this.handleTourOverlayForCourse();
      if (this.startCourseIndex >= 0) {
        this.scrollToContentView(0);
        setTimeout(() => {
          this.startTour();
        }, 1000);
      }
    });
  }

  /**
   * @function trackAppOpenEvent
   * This method is used to track the app open event
   */
  private trackAppOpenEvent() {
    this.parseService.trackEvent(EVENTS.USER_LOGIN);
  }

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public onRefresh(event) {
    event.target.complete();
    this.refreshData();
  }

  /**
   * @function refreshData
   * This method is used to refresh the data
   */
  public async refreshData() {
    await this.loadData();
    this.fetchUserSubjectCompetencyMatrix();
    this.updateClassList();
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  private loadData() {
    return Promise.all([this.fetchClasses(), this.fetchFeaturedCourseList()]).then(() => {
      const courseList = this.featuredCourseList && this.featuredCourseList.length ? this.featuredCourseList[0] : null;
      if (courseList && this.startCourseIndex >= 0) {
        this.startTour();
      }
      // set lesson and timespent performance for classes and independent course
      const classLists = this.classList.concat(this.indepententClassList);
      const classIds = classLists.map((item) => item.id);
      const featuredCourseList = this.featuredCourseList
        && this.featuredCourseList.length
        && this.featuredCourseList[this.featuredCourseList.length - 1]
        && this.featuredCourseList[this.featuredCourseList.length - 1].courses
        || [];
      featuredCourseList.forEach((item) => {
        classIds.push(item.id);
      });
      this.classService.fetchClassLessonTimespentPerformance(classLists, classIds, featuredCourseList);
      return;
    });
  }

  /**
   * @function updateClassPerformance
   * This method is used to update the class performance
   */
  private updateClassPerformance(classId) {
    this.loadingPerformance = true;
    const activeClass = this.classList.filter((classObject) => {
      return classObject.id === classId;
    });
    this.classService.fetchClassPerformance(activeClass).then((classPerformance) => {
      this.loadingPerformance = false;
    });
  }

  /**
   * @function subscribeToUpdateClassList
   * This method is used to subscribe to update class list
   */
  public subscribeToUpdateClassList() {
    this.events.subscribe(this.classService.CLASS_JOINED_UPDATE, () => {
      this.loadData();
    });
  }

  /**
   * @function updateClassList
   * This method is used to update the class list
   */
  private updateClassList() {
    return this.classService.getActiveClass().then((classId) => {
      if (classId && this.classList && this.classList.length) {
        this.updateClassPerformance(classId);
        if (classId !== this.classList[0].id) {
          const activeObject = this.classList.find((classObject) => {
            return classObject.id === classId;
          });
          if (activeObject) {
            const activeIndex = this.classList.indexOf(activeObject);
            this.classList.splice(activeIndex, 1);
            this.classList.splice(0, 0, activeObject);
          }
        }
      }
      return;
    });
  }

  /**
   * @function fetchClasses
   * This method is used to fetch the class list
   */
  private fetchClasses() {
    this.isClassesLoaded = false;
    return this.classService.fetchClassList().then((classList) => {
      this.zone.run(async () => {
        const indepententClass = classList.filter((classObject) => {
          return classObject.isPublic;
        });
        const classes = classList.filter((classObject) => {
          return !classObject.isPublic;
        });
        this.classList = classes;
        this.indepententClassList = indepententClass;
        if (!this.classList.length && !this.indepententClassList.length) {
          this.isShowRecentJounrey = false;
        }
        await this.updateClassList();
        this.handleClassList();
        this.isClassesLoaded = true;
      });
      return classList;
    });
  }

  /**
   * @function handleClassList
   * Method used to handle class list
   */
  public handleClassList() {
    if (this.classList && this.classList.length) {
      this.filteredClassList = this.classList;
    }
  }


  /**
   * @function onClickJourneyTab
   * This method is used to display recent journeys
   */
  public onClickJourneyTab() {
    this.zone.run(() => {
      this.isShowRecentJounrey = true;
    });
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_HOME_CLASSROOMS);
  }

  /**
   * @function onClickCourseTab
   * This method is used to display recommended courses
   */
  public onClickCourseTab() {
    this.zone.run(() => {
      this.isShowRecentJounrey = false;
    });
    this.parseService.trackEvent(EVENTS.CLICK_JUMP_START);
  }

  /**
   * @function fetchFeaturedCourseList
   * Method to fetch featured course list
   */
  public async fetchFeaturedCourseList() {
    this.isLoaded = false;
    const configDetails = this.lookupService.appConfig;
    const ageGradeGroup = configDetails && configDetails.age_grades ? configDetails.age_grades.value : [];
    const profileDetails = await this.profileService.fetchProfileDetail(this.userId);
    const userDOB = profileDetails.birthDate;
    let ageDiff;
    if (ageGradeGroup && userDOB) {
      ageDiff = moment().diff(moment(userDOB, 'YYYY-MM-DD'), 'years');
    }
    const coursePromise = this.enableNavigatorProgram
        ?  this.courseService.fetchSubProgramCourseList()
        : this.courseService.fetchFeaturedCourseList(ageGradeGroup, ageDiff);
    return coursePromise.then((response: Array<GroupedFeaturedCourseModel>) => {
          this.zone.run(() => {
            const featuredCourseList = response;
            if (!this.enableNavigatorProgram && ageDiff > 18) {
              const skillsObject = featuredCourseList.find((courseObject) => {
                return courseObject.framework === SKILLS_FRAMEWORK_ID;
              });
              if (skillsObject) {
                const skillsIndex = featuredCourseList.indexOf(skillsObject);
                featuredCourseList.splice(skillsIndex, 1);
                featuredCourseList.splice(0, 0, skillsObject);
              }
            }
            this.featuredCourseList = featuredCourseList;
            this.isLoaded = true;
            const classListLength = this.featuredCourseList ? this.featuredCourseList.length : 0;
            if (classListLength) {
              // Here we are setting the initial course group as active if there is any course available
              this.findTourOverlayCourseTabIndex();
              this.setActiveCourse(this.startCourseIndex);
              this.handleFeaturedCourseList();
            }
          });
        });
  }

  /**
   * @function toggleFeaturedCourses
   * Method to show more / less courses
   */
  public toggleFeaturedCourses(selectedIndex) {
    this.featuredCourseList.forEach((featuredCourse, index) => {
      if (featuredCourse.isMoreClasses && index === selectedIndex) {
        featuredCourse.isToggleCourse = !featuredCourse.isToggleCourse;
        featuredCourse.filterCourses = featuredCourse.isToggleCourse ? featuredCourse.courses : this.filterFeaturedCourses(featuredCourse.courses, 2);
      }
    });
  }

  /**
   * @function handleFeaturedCourseList
   * Method to handle the featured course
   */
  public handleFeaturedCourseList() {
    this.featuredCourseList.forEach((featuredCourse, index) => {
      featuredCourse.isMoreClasses = featuredCourse.courses.length > 2;
      featuredCourse.filterCourses = featuredCourse.isMoreClasses ? this.filterFeaturedCourses(featuredCourse.courses, 2) : featuredCourse.courses;
    });
  }

  /**
   * @function clickCourseListShowMore
   * Method to show more / less courses
   */
  public clickCourseListShowMore(selectedIndex) {
    this.toggleFeaturedCourses(selectedIndex);
  }

  /**
   * @function handleTourOverlayForCourse
   * Method to handle the tour overlay for the courses
   */
  public handleTourOverlayForCourse() {
    this.findTourOverlayCourseTabIndex();
    this.featuredCourseList.forEach((featuredCourse, index) => {
      const isActive = index === this.startCourseIndex;
      featuredCourse.isActive = isActive;
      if (isActive) {
        featuredCourse.isToggleCourse = true;
        featuredCourse.filterCourses = featuredCourse.courses;
      }
    });
  }

  /**
   * @function findTourOverlayCourseTabIndex
   * Method to get the tour overlay course tab index
   */
  public findTourOverlayCourseTabIndex() {
    this.startCourseIndex = this.featuredCourseList.findIndex((featuredCourse: GroupedFeaturedCourseModel) => {
      const studyFeaturedCourse = featuredCourse.courses.find((course: FeaturedCourseListModel) => !course.hasJoined);
      return !!studyFeaturedCourse;
    });
  }

  /**
   * @function filterFeaturedCourses
   * Method is to get featured course list
   */
  public filterFeaturedCourses(featuredCourseList, index) {
    return featuredCourseList.slice(0, index);
  }

  /**
   * @function setActiveCourse
   * Method to set active course
   */
  public setActiveCourse(selectedIndex) {
    const courseIndex = selectedIndex >= 0 ? selectedIndex : 0;
    this.featuredCourseList.forEach((course, index) => {
      if (index === courseIndex) {
        course.isActive = !course.isActive;
      }
    });
  }

  /**
   * @function fetchUserSubjectCompetencyMatrix
   * Method to fetch featured course list
   */
  public fetchUserSubjectCompetencyMatrix() {
    const user = this.session.userSession.user_id;
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
   * @function fetchCategories
   * Method to fetch categories
   */
  public fetchCategories() {
    this.taxonomyService.fetchCategories();
  }

  /**
   * @function fetchProfilePreference
   * Method to fetch profile preference
   */
  private fetchProfilePreference() {
    this.profileService.fetchProfilePreference();
    this.profileService.fetchRoleRelationshipList();
  }

  /**
   * @function scrollToTop
   * Method used to scroll to top
   */
  public scrollToTop() {
    this.content.scrollToTop(1000);
  }

  /**
   * @function onToggleClassCards
   * This method is used to toggle class cards
   */
  public onToggleClassCards(event) {
    this.scrollToContentView(event.offsetTop);
    this.setActiveCourse(event.selectedIndex);
  }

  /**
   * @function scrollToContentView
   * This method is used to scroll to content view
   */
  public scrollToContentView(scrollPosition) {
    this.content.scrollToPoint(0, scrollPosition, 1000);
  }


  /**
   * @function loadTenantSettings
   * This method is used to fetch tenant settings
   */
  public loadTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      this.tenantSettings = tenantSettings;
      this.enableNavigatorProgram = tenantSettings.uiElementVisibilitySettings
        && tenantSettings.uiElementVisibilitySettings.enableNavigatorProgram;
      this.isShowJoinClass = tenantSettings && tenantSettings.showJoinClass;
      if (this.enableNavigatorProgram) {
        this.checkStudentInfo();
      }
    });
  }

  /**
   * @function loadSubPrograms
   * This method is used to fetch navigator sub programs
   */
  public loadSubPrograms() {
    this.courseService.fetchNavigatorSubProgram();
  }

  /**
   * @function checkStudentInfo
   * This method is used to check student info
   */
  public checkStudentInfo() {
    const userId = this.session.userSession.user_id;
    this.profileProvider.fetchProfileDetails(userId).then((userDetails: any) => {
      if (!userDetails.info) {
        this.onUserDetails(userDetails);
      }
    });
  }

  /**
   * @function onUserDetails
   * This method is used to view user details
   */
  public onUserDetails(userDetails) {
    this.modalService.open(UserPersonalDetailsComponent, {
      isInitialFlow: true,
      userProfile: userDetails
    }).then(() => {
      this.isShowRecentJounrey = false;
    });
  }
}
