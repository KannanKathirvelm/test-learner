import { PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';

export interface PlayerContextModel {
  classId: string;
  source: string;
  collectionType: string;
  courseId: string;
  unitId: string;
  lessonId: string;
  pathId: number;
  pathType: string;
  caContentId?: string;
  collectionId?: string;
  isPublicClass?: boolean;
  isDiagnosticAssessment?: boolean;
}

export interface StudyPlayerContextModel {
  classId: string;
  source: string;
  collectionType: string;
  courseId: string;
  unitId: string;
  lessonId: string;
  collectionId: string;
  pathId: number;
  milestoneId: string;
  pathType: string;
  scoreInPercentage: string;
  isPublicClass?: boolean;
}

export interface CollectionEventModel {
  eventId: string;
  eventName: string;
  timezone: string;
  startTime: number;
  endTime: number;
  context: CollectionEventContextModel;
  session: {
    apiKey: null,
    sessionId: string,
    sessionToken: string
  };
  version: {
    logApi: number
  };
  user: {
    gooruUId: string
  };
}

export interface CollectionEventContextModel {
  questionCount?: number;
  contentGooruId: string;
  type: string;
  collectionType: string;
  courseGooruId: string;
  classGooruId: string;
  unitGooruId: string;
  lessonGooruId: string;
  source: string;
  appId: string;
  partnerId: string;
  pathId: number;
  contentSource: string;
}


// Offline Activity task's submission context interface
export interface OATaskSubmissionContext {
  task_id: number;
  submission_info: string;
  submission_type: string;
  submission_subtype: string;
}

// Offline Activity each task submission payload interface
export interface OATaskSubmissionPayload {
  student_id: string;
  class_id: string;
  oa_id: string;
  content_source: string;
  submissions: Array<OATaskSubmissionContext>;
  time_spent: number;
  course_id?: string;
  unit_id?: string;
  lesson_id?: string;
  oa_dca_id?: number;
}


/*performance null also happen */
export interface PlayerPerformanceModel {
  attempts?: number;
  collectionId?: string;
  id?: string;
  lastSessionId?: string;
  pathId?: number;
  score?: number;
  scoreInPercentage?: number;
  sessionId?: string;
  status?: string;
  timeSpent?: number;
  views?: number;
}

export interface PlayerLastPlayedSesssionModel {
  context: PlayerContextModel;
  performance: PortfolioPerformanceSummaryModel;
  sessionId: string;
}
