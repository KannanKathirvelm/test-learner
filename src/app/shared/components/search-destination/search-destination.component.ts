import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Events, IonContent, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EVENTS } from '@shared/constants/events-constants';
import { ClassModel } from '@shared/models/class/class';
import { SubjectCompetencyMatrixModel } from '@shared/models/competency/competency';
import { FeaturedCourseListModel } from '@shared/models/course/course';
import { TaxonomyGrades } from '@shared/models/taxonomy/taxonomy';
import { ClassProvider } from '@shared/providers/apis/class/class';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CourseService } from '@shared/providers/service/course/course.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { NavigatorService } from '@shared/providers/service/navigator/navigator.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { ToastService } from '@shared/providers/service/toast.service';
import { filterList } from '@shared/utils/global';
import axios from 'axios';

@Component({
  selector: 'search-destination',
  templateUrl: './search-destination.component.html',
  styleUrls: ['./search-destination.component.scss']
})
export class SearchDestinationComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public classList: Array<ClassModel>;
  public featuredCourseList: Array<FeaturedCourseListModel>;
  public filteredFeaturedCourses: Array<FeaturedCourseListModel>;
  public filteredClasses: Array<ClassModel>;
  public isShowJoinClass: boolean;
  public searchText: string;
  public userSelectedSubject: SubjectCompetencyMatrixModel;
  public selectedCourse: FeaturedCourseListModel;
  public gradeList: Array<TaxonomyGrades>;
  public selectedGrade: TaxonomyGrades;
  public gradeMsg: string;
  public showGradeMsg: boolean;
  public intialGradeMatch: boolean;
  public showClassGradient: boolean;
  public headerContainerHeight: number;
  public classPanelHeight: number;
  @ViewChild(IonContent, { static: false }) public content: IonContent;
  @Input() public showJoinClass: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  public constructor(
    private parseService: ParseService,
    private events: Events,
    private navigatorService: NavigatorService,
    private classService: ClassService,
    private translate: TranslateService,
    private toastService: ToastService,
    private loader: LoadingService,
    private router: Router,
    private classProvider: ClassProvider,
    private courseService: CourseService,
    private modalCtrl: ModalController,
  ) {
    this.filteredClasses = [];
    this.filteredFeaturedCourses = [];
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.loadData();
    this.trackSelectDestinationEvent();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function trackSelectDestinationEvent
   * Method to is used to track the select destination header event
   */
  private trackSelectDestinationEvent() {
    this.parseService.trackEvent(EVENTS.SELECT_DESTINATION_HEADER);
  }

  /**
   * @function loadData
   * Method to is used to load the data
   */
  public loadData() {
    this.headerContainerHeight = 112;
    this.classPanelHeight = 48;
    this.userSelectedSubject = this.navigatorService.getUserSelectedSubject;
    axios.all<{}>([
      this.getFeaturedCourse(),
      this.getClassList()
    ]).then(axios.spread((featuredCourseList: Array<FeaturedCourseListModel>, classList: Array<ClassModel>) => {
      this.classList = classList;
      const notJoinedFeaturedCourse = featuredCourseList.filter(item => !item.hasJoined);
      this.featuredCourseList = notJoinedFeaturedCourse;
      this.isShowJoinClass = ((!this.classList || !this.classList.length) && (!this.featuredCourseList || !this.featuredCourseList.length));
      if (this.userSelectedSubject) {
        if (classList && classList.length) {
          this.filteredClasses = classList.filter((classData) => {
            return classData.preference && classData.preference.subject === this.userSelectedSubject.subjectCode;
          });
        }
        if (notJoinedFeaturedCourse && notJoinedFeaturedCourse.length) {
          this.filteredFeaturedCourses = notJoinedFeaturedCourse.filter((course) => {
            return course.subjectBucket === this.userSelectedSubject.subjectCode;
          });
        }
        this.isShowJoinClass = ((!this.filteredClasses || !this.filteredClasses.length) && (!this.filteredFeaturedCourses || !this.filteredFeaturedCourses.length));
      } else {
        this.filteredClasses = this.classList;
        this.filteredFeaturedCourses = this.featuredCourseList;
      }
      // here we are using setTimeout for animation
      setTimeout(() => {
        this.handleScrollableData();
      }, 200);
    })
    );
  }

  /**
   * @function handleScrollableData
   * Method to is used to handle the scrollable data
   */
  private handleScrollableData() {
    const featuredCourseCount = this.filteredFeaturedCourses && this.filteredFeaturedCourses.length ? this.filteredFeaturedCourses.length : 0;
    const classListCount = this.filteredClasses && this.filteredClasses.length ? this.filteredClasses.length : 0;
    this.handleClassListGradient(featuredCourseCount, classListCount);
  }

  /**
   * @function handleClassListGradient
   * Method to is used to show the class gradient
   */
  private handleClassListGradient(featuredCourseCount, classListCount) {
    const classScrollContainerHeight = (this.content['el'].clientHeight - this.headerContainerHeight);
    const viewportClassCount = Math.round(classScrollContainerHeight / this.classPanelHeight);
    this.showClassGradient = (featuredCourseCount + classListCount) >= viewportClassCount;
  }
  /**
   * @function getFeaturedCourse
   * Method to load the featured course
   */
  private getFeaturedCourse() {
    return new Promise((resolve, reject) => {
      this.courseService.getFeaturedCourse().then((featuredCourseList: Array<FeaturedCourseListModel>) => {
        resolve(featuredCourseList);
      }, reject);
    });
  }

  /**
   * @function getClassList
   * Method to load the class list
   */
  private getClassList() {
    return new Promise((resolve, reject) => {
      this.classService.getClassList().then((classList: Array<ClassModel>) => {
        resolve(classList);
      }, reject);
    });
  }

  /**
   * @function filterClassList
   * Method to is used to filter the search text
   */
  public filterClassList(evt) {
    this.searchText = evt.srcElement.value;
    this.filterList(this.searchText);
  }

  /**
   * @function filterList
   * Method to is used to filter the given list
   */
  private filterList(searchText) {
    this.filteredClasses = filterList(this.classList, searchText, 'title', 'code');
    this.filteredFeaturedCourses = filterList(this.featuredCourseList, searchText, 'title');
    const featuredCourseCount = this.filteredFeaturedCourses && this.filteredFeaturedCourses.length ? this.filteredFeaturedCourses.length : 0;
    const classListCount = this.filteredClasses && this.filteredClasses.length ? this.filteredClasses.length : 0;
    this.handleClassListGradient(featuredCourseCount, classListCount);
    this.isShowJoinClass = ((!this.filteredClasses || !this.filteredClasses.length) && (!this.filteredFeaturedCourses || !this.filteredFeaturedCourses.length));
  }

  /**
   * @function onClose
   * Method to is used to close the destination pull down
   */
  public onClose() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function onShowGradeLevel
   * Method to is used to show the grade level
   */
  public onShowGradeLevel(course) {
    this.selectedCourse = course;
    this.joinPublicClass();
  }

  /**
   * @function isPremiumCourse
   * This method is to return premium or non-premium course
   */
  public isPremiumCourse() {
    const settings = this.selectedCourse.settings;
    return settings.grade_current && settings.grade_upper_bound ? true : false;
  }

  /**
   * @function joinPublicClass
   * This method is to call join class api
   */
  public joinPublicClass() {
    this.onClose();
    const courseDetail = {
      courseId: this.selectedCourse.id,
    };
    if (this.isPremiumCourse()) {
      Object.assign(courseDetail, {
        gradeLowerBound: this.selectedCourse.settings.grade_current
      });
    }
    this.classProvider.joinPublicClass(courseDetail).then((response) => {
      const classId = response.headers.location;
      if (!this.selectedCourse.hasJoined) {
        this.trackJoinFeaturedCourseEvent(classId);
      }
      this.trackStudyCourseEvent(classId);
      const subjectCode = this.selectedCourse.subjectBucket;
      this.onSelectDestination(classId, true, subjectCode);
    });
  }

  /**
   * @function trackStudyCourseEvent
   * This method is used to track the study featured course event
   */
  private trackStudyCourseEvent(classId) {
    const context = this.getCourseEventContext(classId);
    this.parseService.trackEvent(EVENTS.STUDY_RECOMMENDED_COURSE, context);
  }

  /**
   * @function getCourseEventContext
   * This method is used to get the context for course event
   */
  private getCourseEventContext(classId) {
    const course = this.selectedCourse;
    return {
      title: course.title,
      id: course.id,
      courseId: course.originalCourseId,
      subject: course.subjectBucket,
      hasJoined: course.hasJoined,
      learnerCount: course.learnerCount,
      classId
    };
  }

  /**
   * @function trackJoinFeaturedCourseEvent
   * This method is used to track the join featured course event
   */
  private trackJoinFeaturedCourseEvent(classId) {
    const context = this.getCourseEventContext(classId);
    this.parseService.trackEvent(EVENTS.JOIN_FEATURED_COURSE, context);
  }

  /**
   * @function onSelectClass
   * Method triggers when user click the class
   */
  public onSelectClass(selectedClass) {
    this.onSelectDestination(selectedClass.id, selectedClass.isPublic, selectedClass.preference.subject);
  }

  /**
   * @function onSelectDestination
   * Method to is used to set the selected grade
   */
  public onSelectDestination(classId, isPublic, subjectCode?) {
    this.onClose();
    this.navigatorService.setDestinationClass(classId);
    this.navigate(classId, isPublic, subjectCode);
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
   * @function joinClass
   * This method is used to join a class
   */
  public joinClass() {
    this.loader.displayLoader();
    this.classProvider.joinClass(this.searchText).then((res) => {
      if (!res.headers.location) {
        this.displayToast('ALREADY_MEMBER');
      } else {
        this.searchText = null;
        const classId = res.headers.location;
        this.trackClassCodeEvent(classId);
        this.onClose();
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
   * @function displayToast
   * This method is used to display toast
   */
  private displayToast(errorMessage) {
    this.translate.get(errorMessage).subscribe((value) => {
      this.toastService.presentToast(value);
    });
  }

}
