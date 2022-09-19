import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';
import {
  MilestoneWithPerformanceReportComponent
} from '@shared/components/milestone-with-performance-report/milestone-with-performance-report.component';
import { ClassModel } from '@shared/models/class/class';
import { MilestoneModel, MilestoneStatsModel } from '@shared/models/milestone/milestone';
import { PerformanceModel } from '@shared/models/performance/performance';
import { ClassService } from '@shared/providers/service/class/class.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { ModalService } from '@shared/providers/service/modal.service';
import { formatTime } from '@shared/utils/global';

@Component({
  selector: 'journey-report',
  templateUrl: './journey-report.component.html',
  styleUrls: ['./journey-report.component.scss'],
})
export class JourneyReportComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public isShowJourneyReport: boolean;
  @Input() public isMilestoneReport: boolean;
  @Input() public classPerformance: PerformanceModel;
  @Input() public milestones: Array<MilestoneModel>;
  @Input() public selectedMilestoneIndex: number;
  public classDetails: ClassModel;
  public totalComputedETL: string;
  public isAllContentsAreRescoped: boolean;
  public milestonesStats: Array<MilestoneStatsModel>;
  @Output() public closeJourneyReport = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private milestoneService: MilestoneService,
    private classService: ClassService
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.isShowJourneyReport && changes.isShowJourneyReport.currentValue) {
      this.classDetails = this.classService.class;
      this.isAllContentsAreRescoped = false;
      this.loadData();
    }
  }

  /**
   * @function loadData
   * This method is used to load the full course data for the milestone
   */
  private async loadData() {
    this.getTotalComputedETL();
    this.loadMilestoneStats();
    this.handleFullCourse();
  }

  /**
   * @function openMilestoneReport
   * Method to show milestone with performance report
   */
  public openMilestoneReport(milestoneIndex) {
    const params = {
      classDetails: this.classDetails,
      milestones: this.milestones,
      milestoneIndex,
      selectedMilestoneIndex: this.selectedMilestoneIndex
    };
    this.modalService.open(
      MilestoneWithPerformanceReportComponent,
      params,
      'milestone-wth-performance-report',
      pullUpAnimation,
      pullDownAnimation);
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
    const totalComputedETL: number = milestonesEtlTime.reduce(
      (previousValue: number, currentValue: number) => {
        return previousValue + currentValue;
      });
    if (totalComputedETL) {
      this.totalComputedETL = formatTime(totalComputedETL);
    }
  }

  /**
   * @function loadMilestoneStats
   * Method to fetch the milestone stats
   */
  public async loadMilestoneStats() {
    const milestoneIds = this.getListOfMilestoneIds();
    this.milestonesStats = await this.milestoneService.fetchMilestoneStats(milestoneIds,
      this.classDetails.id);
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
   * @function handleFullCourse
   * This method is used to handle the full course
   */
  private handleFullCourse() {
    const rescopedContent = this.milestones.filter((milestone) => {
      return milestone.isRescoped;
    });
    this.isAllContentsAreRescoped = rescopedContent.length === this.milestones.length;
  }

  /**
   * @function onCloseJourneyReport
   * This method is used to close milestone summary report
   */
  public onCloseJourneyReport() {
    this.milestonesStats = null;
    this.totalComputedETL = null;
    this.closeJourneyReport.emit();
  }
}
