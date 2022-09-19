import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';

@Component({
  selector: 'milestone-report-progress-bar',
  templateUrl: './milestone-report-progress-bar.component.html',
  styleUrls: ['./milestone-report-progress-bar.component.scss'],
})
export class MilestoneReportProgressBarComponent implements OnInit, AfterViewInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public scoreInPercentage: number;
  @Input() public lessonCount: number;
  public readonly MIN_LESSON_POINT_GAP = 6;
  public readonly MIN_LESSON_COUNT = 12;
  public progressBarWidth: string;
  public lessonPointGap: number;
  public isMoreLessons: boolean;
  public lessonPointWidth: number;
  public maxNumberOfLessons: number;
  public completedPercentage: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private elementRef: ElementRef) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.loadProgressbarData();
  }

  public ngAfterViewInit() {
    if (this.isMoreLessons) {
      setTimeout(() => {
        this.getCompletedPercentageAndLessonGap();
      });
    }
  }

  /**
   * @function getCompletedPercentageAndLessonGap
   * This method is used to get completed percentage and lesson gap
   */
  public getCompletedPercentageAndLessonGap() {
    // Here we set the lesson gap dynamically when there is more data
    const progressBarElement = this.elementRef.nativeElement.querySelector('.progress-bar') as HTMLElement;
    const progressBarWidth = (progressBarElement.offsetWidth - 6);
    this.completedPercentage = `${this.scoreInPercentage}%`;
    const lessonCount = Math.round(progressBarWidth / (this.MIN_LESSON_POINT_GAP + this.lessonPointWidth));
    this.maxNumberOfLessons = lessonCount - 1;
    this.lessonPointGap = this.MIN_LESSON_POINT_GAP;
    if (lessonCount >= this.lessonCount) {
      this.getCompletedPercentage();
    }
  }

  /**
   * @function loadProgressbarData
   * This method is used to load progress bar data
   */
  public loadProgressbarData() {
    this.maxNumberOfLessons = 25;
    this.lessonPointGap = 15;
    this.lessonPointWidth = 6;
    // Here we check the lessonCount is greater than the min lesson count if it is greater then we use the full available width for the progress bar
    if (this.lessonCount > this.MIN_LESSON_COUNT) {
      this.lessonPointGap = null;
      this.progressBarWidth = '100%';
      this.isMoreLessons = true;
    } else {
      this.isMoreLessons = false;
      this.getCompletedPercentage();
    }
  }

  /**
   * @function getCompletedPercentage
   * This method is used to get the completed performance
   */
  private getCompletedPercentage() {
    // Here we set the progress bar width based on the lesson count and lesson gap
    const lessonCount = this.lessonCount;
    const progressBarWidth = (((this.lessonPointGap + this.lessonPointWidth) * lessonCount) + 6);
    this.progressBarWidth = `${progressBarWidth}px`;
    this.completedPercentage = (progressBarWidth / 100 * this.scoreInPercentage) + 'px';
  }
}
