import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class FeedbackComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public contentId: string;
  @Input() public contentType: string;
  @Input() public showCollapsedView: boolean;
  @Input() public feedbackCategory: Array<CategoryModel>;
  @Output() public feedbackSkiporSubmit = new EventEmitter();
  public showFeedBack: boolean;
  public translateParam: { contentType: string };
  public feedbackCompleted: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private feedbackService: FeedbackService) {
    this.feedbackCompleted = false;
  }

  // --------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.fetchUserFeedbacks();
    this.showFeedBack = this.showCollapsedView || false;
    const contentType = FEEDBACK_CONTENT_TYPES[this.contentType];
    this.translateParam = { contentType };
  }

  /**
   * @function fetchUserFeedbacks
   * This Method is used to fetch user feedbacks
   */
  public fetchUserFeedbacks() {
    this.feedbackService.fetchUserFeedbacks(this.contentId).then((data) => {
      const userActivityFeedbacks = data.userActivityFeedbacks;
      if (userActivityFeedbacks.length) {
        this.feedbackCompleted = true;
        this.feedbackCategory.map((category) => {
          const userFeedBack = userActivityFeedbacks.find((feedback) => {
            return category.id === feedback.feedbackCategoryId;
          });
          if (userFeedBack) {
            category.userFeedbackQuantitative = userFeedBack.userFeedbackQuantitative;
            category.userFeedbackQualitative = userFeedBack.userFeedbackQualitative;
          }
        });
      }
    });
  }

  /**
   * @function onRateChange
   * This Method is used change the rating feedback details
   */
  public onRateChange(value, category) {
    category.userFeedbackQuantitative = value;
  }

  /**
   * @function onSubmitFeedback
   * This method is used to submit the feedback details
   */
  public onSubmitFeedback() {
    this.feedbackService.postUserFeedback(this.feedbackCategory, this.contentId, this.contentType)
      .then(() => {
        this.feedbackCompleted = true;
        this.toggleFeedback();
        this.feedbackSkiporSubmit.emit();
      });
  }

  /**
   * @function skipFeedback
   * This method is used to skip feedback
   */
  public skipFeedback() {
    this.toggleFeedback();
    this.feedbackSkiporSubmit.emit();
  }

  /**
   * @function toggleFeedback
   * This method is used to toggle the feedback
   */
  public toggleFeedback() {
    this.showFeedBack = !this.showFeedBack;
  }

}
