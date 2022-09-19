import { Component, Input, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ClassProvider } from '@app/shared/providers/apis/class/class';
import { NavigateProvider } from '@app/shared/providers/apis/navigate/navigate';
import { CourseService } from '@app/shared/providers/service/course/course.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { routerPath, routerPathIdReplace } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import { CourseModel, FeaturedCourseListModel } from '@shared/models/course/course';

@Component({
  selector: 'nav-premium-class-card',
  templateUrl: './premium-class-card.component.html',
  styleUrls: ['./premium-class-card.component.scss'],
})
export class PremiumClassCardComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public class: ClassModel;
  @Input() public course: CourseModel;
  @Input() public isProgramCard: boolean;
  public navigatorProgramCourse: FeaturedCourseListModel;
  public isPublicClassShow: boolean;
  public scoreInPercentage: number;
  public performanceLoaded: boolean;
  public completedLessonsInPercentage: number;
  public isCompetencyStats: boolean;
  public thumbnailUrl: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router,
    private classProvider: ClassProvider,
    private parseService: ParseService,
    private navigateProvider: NavigateProvider,
    private courseService: CourseService,
    private ngZone: NgZone
  ) {
    this.isPublicClassShow = environment.SHOW_PUBLIC_CLASS;
  }


  public ngOnInit(): void {
    if (this.isProgramCard && this.class && this.class.course_id) {
      this.courseService.navigatorProgramCourseList.subscribe((navigatorProgramCourseList) => {
        this.ngZone.run(async () => {
          if (navigatorProgramCourseList) {
            this.navigatorProgramCourse = navigatorProgramCourseList.find((navigatorProgram) => {
              return (navigatorProgram.id === this.class.course_id) && navigatorProgram.navigatorSubProgramId !== null;
            });
          }
        });
      });
    }
  }

  /**
   * @function onNavigate
   * This method is used to redirect to page based on current location
   */
  public onNavigate() {
    if (!this.isCompetencyStats) {
      this.navigateToMilestone();
    }
  }

  /**
   * @function navigateToMilestone
   * This method is used to redirect to milestone page
   */
  public navigateToMilestone() {
    const milestoneURL = routerPathIdReplace('home', this.class.id);
    if (this.class.isPublic && this.isPublicClassShow) {
      this.router.navigate([milestoneURL], { queryParams: { isPublic: true, fromClassCard: true } });
    } else {
      this.router.navigate([milestoneURL], { queryParams: { fromClassCard: true } });
    }
  }

  /**
   * @function playCollection
   * This method is used to play collection
   */
  public playCollection(event) {
    event.stopPropagation();
    const currentLocation = this.class.currentLocation;
    const classData = this.class;
    if (classData.course) {
      if (classData.isPremiumClass && !currentLocation && classData.grade_current) {
        this.navigateToMilestone();
      } else {
        this.playContent();
      }
    } else {
      const classActivitiesURL = routerPathIdReplace('classActivityFullPath', classData.id);
      this.router.navigate([classActivitiesURL]);
    }
    this.parseService.trackEvent(EVENTS.CLICK_STUDY_HOME_START_STUDYING);
  }

  /**
   * @function playContent
   * This method is used to play content
   */
  public playContent() {
    this.navigateProvider.continueCourse(this.class.course_id, this.class.id).then((response) => {
      const content = response.context;
      const context = {
        collectionId: content ? content.collection_id : null,
        classId: this.class.id,
        milestoneId: content ? content.milestone_id : null,
        lessonId: content ? content.lesson_id : null,
        courseId: this.course.id,
        pathId: content ? content.path_id : 0,
        pathType: content ? content.path_type : null,
        unitId: content ? content.unit_id : null,
        scoreInPercentage: null,
        collectionType: content ? content.current_item_type : null,
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        isPublicClass: this.class.isPublic,
        ctxPathId: 0,
        ctxPathType: null,
        state: 'continue'
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
   * @function navigateToProficiency
   * This method is used to navigate to proficiency
   */
  public navigateToProficiency(classId) {
    const proficiencyURL = routerPathIdReplace('proficiency', classId);
    this.router.navigate([proficiencyURL]);
    this.parseService.trackEvent(EVENTS.VIEW_YOUR_SKYLINE);
  }

  /**
   * @function onClickCompetencyStats
   * This method is used open the competency popover
   */
  public onClickCompetencyStats() {
    this.isCompetencyStats = !this.isCompetencyStats;
    this.parseService.trackEvent(EVENTS.COMPLETION_MASTER_COUNT);
  }

  /**
   * @function isPremiumCourse
   * This method is to return premium or non-premium course
   */
  public isPremiumCourse() {
    const settings = this.navigatorProgramCourse.settings;
    return settings.grade_current && settings.grade_upper_bound;
  }


  /**
   * @function joinPublicClass
   * This method is to call join class api
   */
  public joinPublicClass() {
    const courseDetail = {
      courseId: this.navigatorProgramCourse.id,
    };
    const subjectCode = this.navigatorProgramCourse.subjectBucket;
    const isPremiumCourse = this.isPremiumCourse();
    if (isPremiumCourse) {
      Object.assign(courseDetail, {
        gradeLowerBound: this.navigatorProgramCourse.settings.grade_current
      });
    }
    this.classProvider.joinPublicClass(courseDetail).then((response) => {
      const classId = response.headers.location;
      this.trackStudyCourseEvent(classId);
      if (isPremiumCourse) {
        this.router.navigate(['/navigator'], { queryParams: { classId, subjectCode, isPublic: true } });
      } else {
        const classPageURL = routerPathIdReplace('home', classId);
        this.router.navigate([classPageURL]);
      }
    });
    this.parseService.trackEvent(EVENTS.CLICK_STUDY_HOME_START_STUDYING);
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
  private getCourseEventContext(classId?) {
    const course = this.navigatorProgramCourse;
    return {
      title: course.title,
      courseId: course.id,
      originalCourseId: course.originalCourseId,
      subject: course.subjectBucket,
      hasJoined: course.hasJoined,
      learnerCount: course.learnerCount,
      classId
    };
  }
}
