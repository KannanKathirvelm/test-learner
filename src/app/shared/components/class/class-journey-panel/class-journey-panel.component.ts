import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@shared/constants/router-constants';
import { UnitSummaryModel } from '@shared/models/course-map/course-map';
import { PerformanceModel } from '@shared/models/performance/performance';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CourseMapService } from '@shared/providers/service/course-map/course-map.service';

@Component({
  selector: 'class-journey-panel',
  templateUrl: './class-journey-panel.component.html',
  styleUrls: ['./class-journey-panel.component.scss'],
})
export class ClassJourneyPanelComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public classPerformance: PerformanceModel;
  @Input() public isMilestonePerformanceLoaded: boolean;
  @Input() public classId: string;
  @Input() public isPremiumClass: boolean;
  @Input() public isShowJourney: boolean;
  @Input() public unitList: Array<UnitSummaryModel>;
  @Output() public clickClassJourney = new EventEmitter();
  @Output() public toggleRescopedInfo = new EventEmitter();
  @Output() public openJourneyReport = new EventEmitter();
  @Input() public milestoneViewApplicable: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router,
    private classService: ClassService,
    private courseMapService: CourseMapService
  ) { }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function onToggleRescopedInfo
   * This method is used to toggle the rescoped info
   */
  public onToggleRescopedInfo(event) {
    event.stopPropagation();
    this.toggleRescopedInfo.emit();
  }

  /**
   * @function getPerformance
   * This method get the class performance
   */
  public getPerformance(performance) {
    return performance ? performance.score : null;
  }

  /**
   * @function onClickClassJourney
   * This method triggers when user click the journey
   */
  public onClickClassJourney() {
    if (this.isPremiumClass) {
      this.navigateToJourney();
    } else {
      const classPerformance = this.getPerformance(this.classPerformance);
      if (classPerformance) {
        this.clickClassJourney.emit();
      }
    }
  }

  /**
   * @function navigateToJourney
   * This method is used to navigate to journey page
   */
  public navigateToJourney() {
    if (this.isShowJourney) {
      const journeyURL = routerPathIdReplace('journey', this.classId);
      this.router.navigate([journeyURL]);
    }
  }

  /**
   * @function openCourseMapReportPullup
   * This method is used to show report in pull up
   */
  public openCourseMapReportPullup(event) {
    event.stopPropagation();
    if (!this.milestoneViewApplicable) {
      const classDetails = this.classService.class;
      const params = {
        classId: this.classId,
        courseId: classDetails.course_id,
        courseTitle: classDetails.title,
        unitList: this.unitList
      };
      this.courseMapService.openCourseMapReport(params, 'course-map-report');
    } else {
      this.openJourneyReport.emit();
    }
  }
}
