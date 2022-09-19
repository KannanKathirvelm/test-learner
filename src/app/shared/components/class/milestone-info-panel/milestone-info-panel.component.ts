import { Component, OnInit } from '@angular/core';
import { MilestoneModel } from '@shared/models/milestone/milestone';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { ModalService } from '@shared/providers/service/modal.service';

@Component({
  selector: 'milestone-info-panel',
  templateUrl: './milestone-info-panel.component.html',
  styleUrls: ['./milestone-info-panel.component.scss'],
})
export class MilestoneInfoPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public milestoneContent: MilestoneModel;
  public classId: string;
  public courseId: string;
  public framework: string;
  public performance: number;
  public lessonsCount: number;
  public completedCompetencyPercentage: number;
  public completedInPrecentage: number;
  public milestoneInitialPerformance: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private milestoneService: MilestoneService, private modalService: ModalService) { }

  // --------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.completedCompetencyPercentage = 0;
    this.lessonsCount = 0;
    this.completedInPrecentage = 0;
    this.milestoneInitialPerformance = 0;
    this.loadData();
  }

  // --------------------------------------------------------------------------
  // Methods

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData() {
    if (this.milestoneContent.performance && this.milestoneContent.performance.scoreInPercentage) {
      this.performance = this.milestoneContent.performance.scoreInPercentage;
    }
    if (this.milestoneContent.performance && this.milestoneContent.performance.completedInPrecentage) {
      this.completedInPrecentage = this.milestoneContent.performance.completedInPrecentage;
    }
    if (this.milestoneContent.performance && this.milestoneContent.performance.totalCount) {
      this.completedCompetencyPercentage = (this.milestoneContent.performance.completedCount / this.milestoneContent.performance.totalCount);
    }
    this.fetchLessons();
  }

  /**
   * @function fetchLessons
   * This method is used to fetch the lessons
   */
  public async fetchLessons() {
    if (this.milestoneContent.lessons && this.milestoneContent.lessons.length) {
      this.lessonsCount = this.milestoneContent.lessons.length;
    } else {
      const lessons = await this.milestoneService.fetchLessonList(
        this.classId,
        this.milestoneContent.milestoneId,
        this.courseId,
        this.framework
      );
      if (lessons && lessons.length) {
        this.lessonsCount = lessons.length;
      }
    }
  }

  /**
   * @function dismissModal
   * This method is used to dismiss modal
   */
  public dismissModal() {
    this.modalService.dismiss();
  }
}
