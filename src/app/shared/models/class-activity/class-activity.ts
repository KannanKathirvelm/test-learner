import { CASuggestionModel } from '@shared/models/suggestion/suggestion';

export interface ClassActivity {
  activationDate: string;
  addedDate: string;
  allowMasteryAccrual: boolean;
  classId: string;
  collection: Collection;
  contentId: string;
  contentType: string;
  endDate: string;
  forMonth: number;
  forYear: number;
  id: number;
  isCompleted: boolean;
  questionCount: number;
  resourceCount: number;
  taskCount: number;
  thumbnail: string;
  title: string;
  url: string;
  meeting_endtime: string;
  meeting_starttime: string;
  meeting_timezone: string;
  meeting_url: string;
  usersCount?: number;
  isAssessment?: boolean;
  isCollection?: boolean;
  isExternalAssessment?: boolean;
  isExternalCollection?: boolean;
  suggestion?: CASuggestionModel;
}

export interface Collection {
  collectionType: string;
  format: string;
  id: string;
  thumbnailUrl: string;
  defaultImg: string;
  title: string;
  url: string;
  description?: string;
  resourceCount?: number;
  questionCount?: number;
  oeQuestionCount?: number;
  taskCount?: number;
  performance?: Performance;
}

export interface Performance {
  attempts: string;
  collectionId: string;
  id: string;
  pathId: string;
  score: number;
  sessionId: string;
  status: string;
  timeSpent: number;
  views: number;
}
