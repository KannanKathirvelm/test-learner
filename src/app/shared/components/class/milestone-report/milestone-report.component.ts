import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MilestoneModel, MilestoneStatsModel } from '@shared/models/milestone/milestone';
import { PerformanceModel } from '@shared/models/performance/performance';
import { ClassService } from '@shared/providers/service/class/class.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { calculatePercentage, formatTime } from '@shared/utils/global';

@Component({
  selector: 'milestone-report',
  templateUrl: './milestone-report.component.html',
  styleUrls: ['./milestone-report.component.scss'],
})
export class MilestoneReportComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public milestone: MilestoneModel;
  @Input() public milestoneIndex: number;
  @Input() public isAllContentsAreRescoped: boolean;
  @Input() public milestonesStats: Array<MilestoneStatsModel>;
  @Input() public selectedMilestoneIndex: number;
  public milestoneStats: MilestoneStatsModel;
  public fwCode: string;
  public classId: string;
  public courseId: string;
  public performance: PerformanceModel;
  public lessonCount: number;
  public scoreInPercentage: number;
  public completedLessonsInPercentage: number;
  public completedLessons: number;
  public timeSpent: number;
  public performanceLoaded: boolean;
  public computedEtlTime: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private performanceService: PerformanceService,
    private classService: ClassService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    if (this.milestone) {
      if (this.milestone.computedEtlSecs) {
        this.computedEtlTime = formatTime(this.milestone.computedEtlSecs);
      }
      this.loadData();
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.milestonesStats && changes.milestonesStats.currentValue) {
      this.getMilestoneStats();
    }
  }

  /**
   * @function getMilestoneStats
   * This method is used to get milestone stats
   */
  private getMilestoneStats() {
    const milestoneStats = this.milestonesStats.find((stats) => {
      return stats.milestoneId === this.milestone.milestoneId;
    });
    if (milestoneStats) {
      this.milestoneStats = milestoneStats;
      this.lessonCount = milestoneStats.totalLessons;
      this.completedLessons = milestoneStats.lessonsStudied;
      this.completedLessonsInPercentage = calculatePercentage(milestoneStats.lessonsStudied,
        milestoneStats.totalLessons);
    }
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData() {
    this.lessonCount = 0;
    this.completedLessons = 0;
    const classDetails = this.classService.class;
    const classPerference = classDetails.preference;
    this.fwCode = classPerference && classPerference.framework
      ? classPerference.framework
      : null;
    this.classId = classDetails.id;
    this.courseId = classDetails.course_id;
    if (this.milestone && !this.milestone.performance) {
      this.fetchMilestonePerformance();
    } else if (this.milestone && this.milestone.performance) {
      this.scoreInPercentage = this.milestone.performance.scoreInPercentage !== null
        ? this.milestone.performance.scoreInPercentage : null;
      this.timeSpent = this.milestone.performance.timeSpent;
      this.performanceLoaded = true;
    }
  }

  /**
   * @function fetchMilestonePerformance
   * This method is used to get the milestone performance
   */
  public async fetchMilestonePerformance() {
    const milestones = [this.milestone];
    const milestonesResponse = await this.performanceService.fetchMilestonePerformance(this.classId,
      this.courseId,
      this.fwCode,
      milestones);
    this.performanceLoaded = true;
    if (milestonesResponse && milestonesResponse.length) {
      this.performance = milestonesResponse[0].performance;
      this.scoreInPercentage = this.performance && this.performance.scoreInPercentage !== null ? this.performance.scoreInPercentage : null;
      this.timeSpent = this.performance && this.performance.timeSpent ? this.performance.timeSpent : 0;
    }
  }
}
