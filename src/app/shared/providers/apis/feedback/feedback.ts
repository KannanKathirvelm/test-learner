import { Injectable } from '@angular/core';
import { FEEDBACK_TYPES, USER_ROLE } from '@shared/constants/helper-constants';
import { CategoryModel, FeedbackCategoryModel, UserFeedbackCategoryModel, UserFeedbacksModel } from '@shared/models/feedback/feedback';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
@Injectable({
  providedIn: 'root'
})
export class FeedbackProvider {

  // -------------------------------------------------------------------------
  // Properties
  private lookupNamespace = 'api/nucleus/v1/lookups';
  private feedbackNamespace = 'api/ds/users';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService, private sessionService: SessionService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchFeedbackCategory
   * This method is used to fetch the feedback list
   */
  public fetchFeedbackCategory() {
    const endpoint = `${this.lookupNamespace}/feedback-categories`;
    const params = { user_category_id: USER_ROLE.STUDENT };
    return this.httpService.get<FeedbackCategoryModel>(endpoint, params).then((response) => {
      return this.normalizeFeedbackCategories(response.data.feedback_categories);
    });
  }

  /**
   * @function normalizeFeedbackCategories
   * This method is used to normalize the feedback categories
   */
  private normalizeFeedbackCategories(result) {
    const categories: FeedbackCategoryModel = {
      collections: this.normalizeFeedbackCategory(result.collections),
      courses: this.normalizeFeedbackCategory(result.courses),
      assessments: this.normalizeFeedbackCategory(result.assessments),
      externalAssessments: this.normalizeFeedbackCategory(result.externalAssessments),
      externalCollections: this.normalizeFeedbackCategory(result.externalCollections),
      offlineActivities: this.normalizeFeedbackCategory(result.offlineActivities),
      questions: this.normalizeFeedbackCategory(result.questions),
      resources: this.normalizeFeedbackCategory(result.resources),
    };
    return categories;
  }

  /**
   * @function normalizeFeedbackCategory
   * This method is used to normalize the feedback category
   */
  private normalizeFeedbackCategory(resources) {
    return resources.map((category) => {
      const categoryModel: CategoryModel = {
        category_name: category.category_name,
        feedback_type_id: category.feedback_type_id,
        isQualitative: FEEDBACK_TYPES.QUALITATIVE === category.feedback_type_id,
        isQuantitative: FEEDBACK_TYPES.QUANTITATIVE === category.feedback_type_id,
        isBoth: FEEDBACK_TYPES.BOTH === category.feedback_type_id,
        id: category.id,
        max_scale: category.max_scale
      };
      return categoryModel;
    });
  }

  /**
   * @function fetchUserFeedbacks
   * This method is used to get the user feedback
   */
  public fetchUserFeedbacks(contentId) {
    const endpoint = `${this.feedbackNamespace}/v2/activity/feedbacks`;
    const userId = this.sessionService.userSession.user_id;
    const params = { user_id: userId, content_id: contentId };
    return this.httpService.get<UserFeedbacksModel>(endpoint, params).then((response) => {
      return this.normalizeUserFeedbacks(response.data);
    });
  }

  /**
   * @function normalizeUserFeedbacks
   * This method is used to normalize user feedbacks
   */
  private normalizeUserFeedbacks(feedbacks) {
    const userActivityFeedbacksModel: UserFeedbacksModel = {
      userActivityFeedbacks: this.normalizeUserFeedbackCategory(feedbacks.userActivityFeedbacks),
    };
    return userActivityFeedbacksModel;
  }

  /**
   * @function normalizeUserFeedbackCategory
   * This method is used to normalize user feedback category
   */
  private normalizeUserFeedbackCategory(userActivityFeedbacks) {
    return userActivityFeedbacks.map((category) => {
      const feedbackCategory: UserFeedbackCategoryModel = {
        feedbackCategoryId: category.feedbackCategoryId,
        userFeedbackQualitative: category.userFeedbackQualitative,
        userFeedbackQuantitative: category.userFeedbackQuantitative,
      };
      return feedbackCategory;
    });
  }

  /**
   * @function postUserFeedback
   * This method is used to post the feedback details
   */
  public postUserFeedback(postData) {
    const endpoint = `${this.feedbackNamespace}/v2/activity/feedbacks`;
    return this.httpService.post(endpoint, postData);
  }
}
