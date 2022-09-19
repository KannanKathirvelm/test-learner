export interface FeedbackCategoryModel {
  assessments: Array<CategoryModel>;
  externalAssessments: Array<CategoryModel>;
  questions: Array<CategoryModel>;
  resources: Array<CategoryModel>;
  offlineActivities: Array<CategoryModel>;
  externalCollections: Array<CategoryModel>;
  courses: Array<CategoryModel>;
  collections: Array<CategoryModel>;
}
export interface CategoryModel {
  category_name: string;
  feedback_type_id: number;
  max_scale: number;
  id: number;
  isQualitative: boolean;
  isQuantitative: boolean;
  isBoth: boolean;
  userFeedbackQuantitative?: number;
  userFeedbackQualitative?: string;
}

export interface UserActivityFeedbackModel {
  content_id: string;
  content_type: string;
  user_id: string;
  user_category_id: string;
  user_feedbacks: Array<UserFeedbackModel>;
}

export interface UserFeedbackModel {
  feeback_category_id: number;
  user_feedback_quantitative: number;
  user_feedback_qualitative: string;
}

export interface UserFeedbacksModel {
  userActivityFeedbacks: Array<UserFeedbackCategoryModel>;
}

export interface UserFeedbackCategoryModel {
  feedbackCategoryId: number;
  userFeedbackQuantitative: number;
  userFeedbackQualitative: string;
}
