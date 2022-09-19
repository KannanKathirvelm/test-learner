import { Injectable } from '@angular/core';
import { USER_ROLE } from '@shared/constants/helper-constants';
import { FeedbackCategoryModel } from '@shared/models/feedback/feedback';
import { FeedbackProvider } from '@shared/providers/apis/feedback/feedback';
import { SessionService } from '@shared/providers/service/session/session.service';
import { cloneObject } from '@shared/utils/global';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  // -------------------------------------------------------------------------
  // Properties
  private feedbackCategorySubject: BehaviorSubject<FeedbackCategoryModel>;

  constructor(private feedbackProvider: FeedbackProvider,
              private sessionService: SessionService) {
    this.feedbackCategorySubject = new BehaviorSubject<FeedbackCategoryModel>(null);
  }

  /**
   * @function fetchFeedbackCategory
   * This Method is used to get the categories
   */
  public fetchFeedbackCategory() {
    return new Promise((resolve, reject) => {
      if (!this.feedbackCategories) {
        this.feedbackProvider.fetchFeedbackCategory().then((categories) => {
          this.feedbackCategorySubject.next(categories);
          resolve(categories);
        }, reject);
      } else {
        resolve(this.feedbackCategories);
      }
    });
  }

  get feedbackCategories(): FeedbackCategoryModel {
    return this.feedbackCategorySubject ? cloneObject(this.feedbackCategorySubject.value) : null;
  }

  /**
   * @function fetchUserFeedbacks
   * This Method is used to fetch user feedbacks
   */
  public fetchUserFeedbacks(contentId) {
    return this.feedbackProvider.fetchUserFeedbacks(contentId);
  }

  /**
   * @function postUserFeedback
   * This Method is used to post the lookup details
   */
  public postUserFeedback(userFeedbacks, contentId, contentType) {
    const userId = this.sessionService.userSession.user_id;
    const userFeedbackData = userFeedbacks.map((feedback) => {
      let contentFeedback;
      if (feedback.isBoth || feedback.isQualitative) {
        contentFeedback = {
          user_feedback_qualitative: feedback.userFeedbackQualitative,
        };
      } else {
        contentFeedback = {
          user_feedback_quantitative: feedback.userFeedbackQuantitative,
        };
      }
      return {
        feeback_category_id: feedback.id,
        ...contentFeedback
      };
    });
    const feedbackData = {
      content_id: contentId,
      content_type: contentType,
      user_category_id: USER_ROLE.STUDENT,
      user_feedbacks: userFeedbackData,
      user_id: userId
    };
    return this.feedbackProvider.postUserFeedback(feedbackData);
  }
}
