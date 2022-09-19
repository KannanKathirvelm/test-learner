import { Component, Input, OnInit } from '@angular/core';
import { ClassModel } from '@shared/models/class/class';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { MilestoneModel } from '@shared/models/milestone/milestone';
import { ModalService } from '@shared/providers/service/modal.service';
import { cloneObject } from '@shared/utils/global';
import { slideInLeftAnimation, slideInRightAnimation } from 'angular-animations';

@Component({
  selector: 'milestone-with-performance-report',
  templateUrl: './milestone-with-performance-report.component.html',
  styleUrls: ['./milestone-with-performance-report.component.scss'],
  animations: [slideInLeftAnimation({ duration: 300, delay: 0 }), slideInRightAnimation({ duration: 300, delay: 0 })]
})
export class MilestoneWithPerformanceReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public milestones: Array<MilestoneModel>;
  @Input() public milestoneIndex: number;
  @Input() public selectedMilestoneIndex: number;
  @Input() public classDetails: ClassModel;
  public currentLocation: MilestoneLocationModel;
  public milestoneList: Array<MilestoneModel>;
  public nextSlideChanged: boolean;
  public prevSlideChanged: boolean;
  public currentSlideIndex: number;
  public selectedMilestone: MilestoneModel;
  public slideChanged: boolean;
  public isLoaded: boolean;
  public isShowCarousel: boolean;
  public scoreInPercentage: number;
  public timeSpent: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private modalService: ModalService) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.isShowCarousel = this.milestones.length > 1;
    this.nextSlideChanged = false;
    this.prevSlideChanged = false;
    this.isLoaded = true;
    this.initialize();
  }

  /**
   * @function onSlidePrevious
   * Method triggers when slide changes
   */
  public onSlidePrevious() {
    this.isLoaded = false;
    const lastMilestoneIndex = (this.milestones.length - 1);
    const milestoneIndex = (this.currentSlideIndex - 1);
    this.currentSlideIndex = milestoneIndex >= 0 ? milestoneIndex : lastMilestoneIndex;
    this.handleCurrentMilestone();
    this.prevSlideChanged = true;
    this.slideChanged = false;
    setTimeout(() => {
      this.prevSlideChanged = false;
      this.isLoaded = true;
    }, 300);
  }

  /**
   * @function onSlideNext
   * Method triggers when slide changes
   */
  public onSlideNext() {
    this.isLoaded = false;
    const lastMilestoneIndex = (this.milestones.length - 1);
    const milestoneIndex = (this.currentSlideIndex + 1);
    this.currentSlideIndex = milestoneIndex <= lastMilestoneIndex ? milestoneIndex : 0;
    this.handleCurrentMilestone();
    this.nextSlideChanged = true;
    this.slideChanged = false;
    setTimeout(() => {
      this.nextSlideChanged = false;
      this.isLoaded = true;
    }, 300);
  }

  /**
   * @function initialize
   * Method to initialize the milestone report data
   */
  public initialize() {
    this.milestoneList = cloneObject(this.milestones);
    this.currentSlideIndex = this.milestoneIndex;
    this.handleCurrentMilestone();
  }

  /**
   * @function handleCurrentMilestone
   * Method to handle the current milestone
   */
  public handleCurrentMilestone() {
    const milestone = this.milestoneList[this.currentSlideIndex];
    this.selectedMilestone = milestone;
    this.scoreInPercentage = milestone.performance && milestone.performance.scoreInPercentage !== null ?
      milestone.performance.scoreInPercentage : null;
    this.timeSpent = milestone.performance && milestone.performance.timeSpent;
  }

  /**
   * @function closeReport
   * Method to close the milestone performance report
   */
  public closeReport() {
    this.modalService.dismiss();
  }
}
