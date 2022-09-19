import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EVENTS } from '@shared/constants/events-constants';
import { routerPathIdReplace } from '@shared/constants/router-constants';
import { FeaturedCourseListModel } from '@shared/models/course/course';
import { TaxonomyGrades } from '@shared/models/taxonomy/taxonomy';
import { ClassProvider } from '@shared/providers/apis/class/class';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';

@Component({
  selector: 'nav-featured-course-card',
  templateUrl: './featured-course-card.component.html',
  styleUrls: ['./featured-course-card.component.scss'],
})
export class FeaturedCourseCardComponent {
  @Input() public courseContent: FeaturedCourseListModel;
  @Output() public scrollToTop = new EventEmitter();
  public showLevelList: boolean;
  public gradeList: Array<TaxonomyGrades>;
  public selectedGrade: TaxonomyGrades;
  public gradeMsg: string;
  public showGradeMsg: boolean;
  public showPreview: boolean;
  public intialGradeMatch: boolean;

  constructor(
    private parseService: ParseService,
    private taxonomyService: TaxonomyService,
    private classProvider: ClassProvider,
    private router: Router,
    private translate: TranslateService,
  ) {
    this.showLevelList = false;
    this.showPreview = false;
    this.intialGradeMatch = true;
  }

  /**
   * @function onClickPreview
   * This method is used to show description
   */
  public onClickPreview() {
    this.showPreview = true;
    this.trackExpandCourseEvent();
  }

  /**
   * @function onClose
   * This method is used to close study now button
   */
  public onClose(event) {
    event.stopPropagation();
    this.showPreview = false;
  }

  /**
   * @function trackExpandCourseEvent
   * This method is used to track the expand course event
   */
  private trackExpandCourseEvent() {
    const context = this.getCourseEventContext();
    this.parseService.trackEvent(EVENTS.EXPAND_RECOMMENDED_COURSE, context);
  }

  /**
   * @function getCourseEventContext
   * This method is used to get the context for course event
   */
  private getCourseEventContext(classId?) {
    const course = this.courseContent;
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

  /**
   * @function trackStudyCourseEvent
   * This method is used to track the study featured course event
   */
  private trackStudyCourseEvent(classId) {
    const context = this.getCourseEventContext(classId);
    this.parseService.trackEvent(EVENTS.STUDY_RECOMMENDED_COURSE, context);
  }

  /**
   * @function studyNow
   * This method is used to show level list
   */
  public studyNow() {
    this.joinPublicClass();
    this.showPreview = false;
  }

  /**
   * @function fetchGradeList
   * This method is used to fetch grade list
   */
  public fetchGradeList() {
    const filters = {
      subject: this.filterSubjectCode(this.courseContent.subjectBucket),
      fw_code: this.courseContent.settings.framework,
    };
    this.taxonomyService
      .fetchGradesBySubject(filters)
      .then((taxonomyGrades: Array<TaxonomyGrades>) => {
        const gradeListBySequenceId = taxonomyGrades.sort(
          (grade1, grade2) => grade1.sequenceId - grade2.sequenceId
        );
        this.gradeList = gradeListBySequenceId;
        if (this.courseContent.settings.grade_current === this.courseContent.settings.grade_upper_bound) {
          const grade = gradeListBySequenceId.find(
            (item) => item.id === this.courseContent.settings.grade_current
          );
          this.gradeSelected(grade);
        }
      });
  }

  /**
   * @function filterSubjectCode
   * This method is used to filter subject code
   */
  public filterSubjectCode(subjectCode) {
    const splitSubjectCode = subjectCode.split('.');
    if (splitSubjectCode.length === 3) {
      splitSubjectCode.shift();
    }
    return splitSubjectCode.join('.');
  }

  /**
   * @function dismissLevelList
   * This method is used to hide level list
   */
  public dismissLevelList() {
    this.showLevelList = false;
    this.selectedGrade = null;
    this.dismissPrompt();
  }

  /**
   * @function gradeSelected
   * This method is run after grade selected
   */
  public gradeSelected(grade) {
    this.selectedGrade = grade;
    this.showGradeMsg = true;
    const upperBoundSequenceId = this.gradeList.find(
      (item) => item.id === this.courseContent.settings.grade_upper_bound
    ).sequenceId;
    if (grade.sequenceId > upperBoundSequenceId) {
      this.gradeMsg = this.translate.instant('IS_GRADE_ABOVE_MSG', { grade: this.selectedGrade.grade });
    } else if (grade.sequenceId === upperBoundSequenceId) {
      if (this.intialGradeMatch) {
        this.gradeMsg = this.translate.instant('IS_GRADE_SAME_MSG', { grade: this.selectedGrade.grade });
        this.intialGradeMatch = false;
      } else {
        this.gradeMsg = this.translate.instant('IS_GRADE_BELOW_MSG', { grade: this.selectedGrade.grade });
      }
    } else {
      this.gradeMsg = this.translate.instant('IS_GRADE_BELOW_MSG', { grade: this.selectedGrade.grade });
    }
  }

  /**
   * @function isPremiumCourse
   * This method is to return premium or non-premium course
   */
  public isPremiumCourse() {
    const settings = this.courseContent.settings;
    return settings.grade_current && settings.grade_upper_bound;
  }

  /**
   * @function joinPublicClass
   * This method is to call join class api
   */
  public joinPublicClass() {
    const courseDetail = {
      courseId: this.courseContent.id,
    };
    const subjectCode = this.courseContent.subjectBucket;
    const isPremiumCourse = this.isPremiumCourse();
    if (isPremiumCourse) {
      Object.assign(courseDetail, {
        gradeLowerBound: this.courseContent.settings.grade_current
      });
    }
    this.classProvider.joinPublicClass(courseDetail).then((response) => {
      const classId = response.headers.location;
      if (!this.courseContent.hasJoined) {
        this.trackJoinFeaturedCourseEvent(classId);
      }
      this.trackStudyCourseEvent(classId);
      if (isPremiumCourse) {
        this.router.navigate(['/navigator'], { queryParams: { classId, subjectCode, isPublic: true } });
      } else {
        const classPageURL = routerPathIdReplace('home', classId);
        this.router.navigate([classPageURL]);
      }
    });
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
   * @function proceedToHigherLevel
   * This method is to run after click yes in prompt
   */
  public proceedToHigherLevel() {
    this.showLevelList = false;
    this.dismissPrompt();
    this.joinPublicClass();
    this.selectedGrade = null;
  }

  /**
   * @function dismissPrompt
   * This method is to run after click no in prompt(close prompt)
   */
  public dismissPrompt() {
    this.showGradeMsg = false;
  }
}
