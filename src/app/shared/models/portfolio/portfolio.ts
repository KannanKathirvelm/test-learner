import { EvidenceModel } from '@shared/models/performance/performance';
import { OwnerModel } from '@shared/models/signature-content/signature-content';
import { TaxonomyModel } from '@shared/models/taxonomy/taxonomy';

export interface PortfolioPerformanceSummaryModel {
  assessment?: PerformanceModel;
  collection?: PerformanceModel;
  questions?: Array<SubContentModel>;
  resources?: Array<SubContentModel>;
}

export interface PerformanceModel {
  eventTime: string;
  id: string;
  reaction: number;
  score: number;
  timespent: number;
  type: string;
  sessionId?: string;
}

export interface SubContentModel {
  answerObject: Array<AnswerObjectModel>;
  isSkipped: boolean;
  answerStatus: string;
  eventTime: number;
  id: string;
  views?: number;
  isGraded: boolean;
  maxScore: number;
  questionType: string;
  reaction: number;
  resourceType: string;
  score: number;
  percentScore: number;
  timespent: number;
  title: string;
  averageScore: number;
  subQuestions?: Array<SubContentModel>;
  evidence: Array<EvidenceModel>;
}

export interface PortfolioModel {
  activityTimestamp: number;
  contentSource: string;
  efficacy: number;
  engagement: number;
  gradingStatus: number;
  gutCodes: Array<string>;
  id: string;
  lastSessionId: string;
  learningObjective: string;
  masterySummary: string;
  maxScore: number;
  owner: OwnerModel;
  questionCount: number;
  relevance: number;
  resourceCount: number;
  score: number;
  status: number;
  subType: string;
  taskCount: number;
  taxonomy: Array<TaxonomyModel>;
  thumbnailUrl: string;
  timespent: number;
  title: string;
  type: string;
  Timestamp?: string;
  isCollection: boolean;
  isAssessment: boolean;
  isOfflineActivity: boolean;
  isExternalCollection: boolean;
  isExternalAssessment: boolean;
  isDiagnostic?: boolean;
}

export interface PortfolioActivitiesModel {
  type: string;
  label: string;
  portfolioContents: Array<PortfolioModel>;
}

export interface AnswerObjectModel {
  answerId: string;
  order: number;
  skip: boolean;
  status: string;
  answer_text: string;
  timeStamp: number;
}

export interface PortfolioAllActivityAttempt {
  activityId: string;
  usageData: Array<PortfolioActivityAttempt>;
}

export interface PortfolioActivityAttempt {
  classId: string;
  contentSource: string;
  courseId: string;
  createdAt: string;
  createdDate: string;
  dcaContentId: string;
  gradingStatus: string;
  id: string;
  lessonId: string;
  maxScore: number;
  pathId: number;
  pathType: string;
  reaction: number;
  score: number;
  sessionId: string;
  status: string;
  timespent: number;
  title: string;
  type: string;
  unitId: string;
  updatedAt: string;
}

export interface PortfolioAllActivityAttempt {
  activityId: string;
  usageData: Array<PortfolioActivityAttempt>;
}

export interface PortfolioActivityAttempt {
  classId: string;
  contentSource: string;
  courseId: string;
  createdAt: string;
  createdDate: string;
  dcaContentId: string;
  gradingStatus: string;
  id: string;
  lessonId: string;
  maxScore: number;
  pathId: number;
  pathType: string;
  reaction: number;
  score: number;
  sessionId: string;
  status: string;
  timespent: number;
  title: string;
  type: string;
  unitId: string;
  updatedAt: string;
}

export interface PortfolioUniversalActivitiesModal {
  code: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  originatorEmail: string;
  originatorFirstName: string;
  originatorId: string;
  originatorLastName: string;
  originatorThumbnail: string;
  originatorUsername: string;
  status: string;
  tenantName: string;
  thumbnail: string;
  username: string;
}
