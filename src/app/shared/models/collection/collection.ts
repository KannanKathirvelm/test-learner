import { SafeUrl } from '@angular/platform-browser';
import { LessonModel } from '@shared/models/lesson/lesson';
import { CollectionPerformanceUsageDataModel } from '@shared/models/performance/performance';
import { PortfolioPerformanceSummaryModel, SubContentModel } from '@shared/models/portfolio/portfolio';

export interface CollectionListModel {
  alternatePaths: {
    teacherSuggestions: Array<CollectionSuggestionModel>;
    systemSuggestions: Array<CollectionSuggestionModel>
  };
  coursePath?: CollectionSummaryModel;
}

export interface CollectionSummaryModel {
  aggregatedTaxonomy: any;
  collectionSummary: Array<CollectionModel>;
  courseId: string;
  createdAt: string;
  creatorId: string;
  creatorSystem?: any;
  lessonId: string;
  lessonPlan?: any;
  metadata?: any;
  modifierId: string;
  originalCreatorId: string;
  originalLessonId: string;
  ownerId: string;
  primaryLanguage: number;
  sequenceId: number;
  taxonomy?: any;
  title: string;
  unitId: string;
  updatedAt: string;
}

export interface CollectionModel {
  format: string;
  id: string;
  oeQuestionCount?: number;
  questionCount?: number;
  resourceCount?: number;
  sequenceId?: number;
  subformat?: any;
  taskCount?: number;
  thumbnail: string;
  thumbnailXS?: string;
  title: string;
  url?: string;
  isLastCollectionInLesson?: boolean;
  isLastCollectionInMilestone?: boolean;
  isSuggestedContent?: boolean;
  isNextSuggestedCollection?: boolean;
  isNextSystemSuggested?: boolean;
  iSystemSuggested?: boolean;
  isTeacherSuggested?: boolean;
  isNextTeacherSuggested?: boolean;
  nextCollectionPathType?: string;
  learningObjective?: string;
  pathType?: string;
  isCurrentCollection?: boolean;
  performance?: CollectionPerformanceUsageDataModel;
  isCollection: boolean;
  isAssessment: boolean;
  isRescoped?: boolean;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  isShowAttempts?: boolean;
  isOfflineActivity: boolean;
  gutCodes?: Array<string>;
  isVisible?: boolean;
}

export interface CollectionsModel {
  id: string;
  url: string;
  collaborator: Array<string>;
  content: Array<ContentModel>;
  courseId: string;
  creatorId: string;
  format: string;
  grading: string;
  learningToolId: number;
  learningObjective: string;
  lessonId: string;
  license: string;
  metadata: any;
  originalCollectionId: string;
  originalCreatorId: string;
  ownerId: string;
  primaryLanguage: number;
  publishDate: string;
  subformat: string;
  thumbnail: string;
  title: string;
  unitId: string;
  visibleOnProfile: boolean;
  settings: CollectionSettings;
  taxonomy: any;
  questionCount?: number;
  collectionType?: string;
  suggestionType?: string;
  isSuggested?: boolean;
  isCollection: boolean;
  isAssessment: boolean;
  gutCodes?: Array<string>;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  isOfflineActivity: boolean;
  lesson?: LessonModel;
  isNextLesson?: boolean;
  showEdvience?: boolean;
}

export interface CollectionSettings {
  attemptsAllowed: number;
  bidirectionalPlay: boolean;
  classroomPlayEnabled: boolean;
  contributesToMastery: boolean;
  contributesToPerformance: boolean;
  randomizePlay: boolean;
  showExplanation: boolean;
  showFeedback: string;
  showHints: boolean;
  showKey: string;
}

export interface ContentModel {
  answer: Array<AnswerModel>;
  contentFormat: string;
  contentSubformat: string;
  creatorId?: string;
  description: string;
  displayGuide?: any;
  hintExplanationDetail?: string;
  id: string;
  isCopyrightOwner?: boolean;
  maxScore?: number;
  metadata?: any;
  player_metadata?: {
    additional_attributes: { hard_text: string, soft_text: string };
  };
  narration?: string;
  originalCreatorId?: string;
  publishDate?: string;
  sequenceId: number;
  taxonomy: any;
  thumbnail: string;
  title: string;
  url: string;
  visibleOnProfile?: boolean;
  subQuestions?: Array<AnswerModel>;
  creator?: {
    firstName: string;
    gooruUId: string;
    lastName: string;
    profileImageUrl: string;
    username: string;
    usernameDisplay: string;
  };
  showEvidence?: boolean;
}

export interface CollectionContextModel {
  answersPayLoad?: Array<SelectedAnswersModel>;
  sessionId?: string;
  performance?: PortfolioPerformanceSummaryModel;
}

export interface SelectedAnswersModel {
  questionId: string;
  contentFormat: string;
  selectedAnswers?: Array<AnswerModel>;
  alreadyPlayedQuestions?: SubContentModel;
}

export interface AnswerModel {
  answer_text: string;
  answer_type?: string;
  highlight_type?: string;
  is_correct?: number;
  sequence?: number;
  user_selected?: number;
  selected?: boolean;
  status?: string;
  userAnswerText?: string;
  correct_answer?: Array<string>;
  struggles?: Array<StrugglesModel>;
  text?: string;
  audioUrl?: SafeUrl;
  audioBlob?: Blob;
  answer_audio_filename?: string;
  answerInLetters?: Array<string>;
  order?: number;
  isNotSorted?: boolean;
  contentFormat?: string;
  contentSubformat?: string;
}

export interface StrugglesModel {
  manifest_comp_code: string;
  origin_comp_code: string;
  struggle_code: string;
  subject_code: string;
}

export interface CollectionSuggestionModel {
  id: string;
  title: string;
  format: string;
  collectionId: string;
  classId: string;
  courseId: string;
  unitId: string;
  lessonId: string;
  pathId: number;
  pathType: string;
  resourceCount: number;
  contentSubFormat: string;
  source: string;
  thumbnail: string;
  thumbnailXS?: string;
  isSuggestedContent: true;
  isCollection: boolean;
  isAssessment: boolean;
  isRescoped: boolean;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  isOfflineActivity: boolean;
  ctxPathId: number;
  ctxPathType: string;
}

export interface DiagnosticCollectionModel {
  id: string;
  title: string;
  format: string;
  sequenceId: number;
  thumbnailUrl: string;
  url: string;
  subformat: string;
  gutCodes: Array<string>;
  learningObjective: string;
  metadata?: any;
  resourceCount: number;
  questionCount: number;
  oeQuestionCount: number;
  taskCount: number;
}
