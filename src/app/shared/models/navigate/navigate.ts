import { AnswerModel, CollectionsModel } from '@shared/models/collection/collection';
export interface NextCollectionModel {
  content: CollectionsModel;
  context: NextContextModel;
  suggestions: Array<SuggestionModel>;
}

export interface NextContextModel {
  class_id: string;
  collection_id: string;
  context_data: string;
  course_id: string;
  current_item_id: string;
  current_item_subtype: string;
  current_item_type: string;
  lesson_id: string;
  milestone_id: string;
  path_id: number;
  path_type: string;
  score_percent: number;
  state: string;
  resources?: Array<ResourcesModel>;
  unit_id: string;
  ctx_path_id: number;
  ctx_path_type: string;
  diagnostic?: DiagnosticContentModel;
}

export interface DiagnosticContentModel {
  chunk_id: string;
  diagnostic_domain: string;
  diagnostic_grade: number;
  session_id: string;
  starting_domain: string;
  starting_domain_name: string;
  starting_grade: number;
  student_grade: number;
}

export interface ResourcesModel {
  resource_id: string;
  resource_type: string;
  status: string;
  answer: Array<AnswerModel>;
}

export interface SuggestionModel {
  format: string;
  id: string;
  metadata: string;
  questionCount: number;
  resourceCount: number;
  subformat: string;
  suggestedContentSubType: string;
  taxonomy: string;
  thumbnail: string;
  title: string;
}
