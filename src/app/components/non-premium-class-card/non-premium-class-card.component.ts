import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import { CourseModel } from '@shared/models/course/course';
import { calculatePercentage } from '@shared/utils/global';

@Component({
  selector: 'nav-non-premium-class-card',
  templateUrl: './non-premium-class-card.component.html',
  styleUrls: ['./non-premium-class-card.component.scss'],
})
export class NonPremiumClassCardComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public class: ClassModel;
  @Input() public course: CourseModel;
  @Input() public loadingPerformance: boolean;
  public isPublicClassShow: boolean;
  public scoreInPercentage: number;
  public performanceLoaded: boolean;
  public completedLessonsInPercentage: number;

  constructor(
    private router: Router
  ) { }

  public ngOnInit() {
    this.loadData();
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData() {
    const classPerformanceSummaryForDCA = this.class && this.class.performanceSummaryForDCA || null;
    if (classPerformanceSummaryForDCA && classPerformanceSummaryForDCA.scoreInPercentage !== null) {
      this.scoreInPercentage = classPerformanceSummaryForDCA.scoreInPercentage;
    } else {
      this.scoreInPercentage = null;
    }
    if (this.class && this.class.performanceSummary) {
      this.completedLessonsInPercentage = calculatePercentage(this.class.performanceSummary.totalCompleted, this.class.performanceSummary.total);
    }
    this.performanceLoaded = true;
  }

  /**
   * @function onNavigate
   * This method is used to redirect to page based on current location
   */
  public onNavigate() {
    this.navigateToMilestone();
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
}
