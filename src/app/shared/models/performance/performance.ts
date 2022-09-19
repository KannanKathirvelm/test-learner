import { PlayerContextModel } from '@shared/models/player/player';
import { PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';

export interface PerformanceModel {
  classId: string;
  id: string;
  score: number;
  sessionId: string;
  timeSpent: number;
  total: number;
  totalCompleted: number;
  scoreInPercentage?: number;
}
export interface CAPerformanceModel {
  classId: string;
  completedCount: number;
  scoreInPercentage: number;
}
export interface AnalyticsModel {
  classId: string;
  collectionId: string;
  collectionTitle: string;
  collectionType: string;
  courseId: string;
  lessonId: string;
  pathId: string;
  pathType: string;
  status: string;
  unitId: string;
}
export interface MilestonePerformanceModel {
  attempts: number;
  completedCount: number;
  reaction?: any;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  completedInPrecentage: number;
}
export interface LessonPerformanceUsageDataModel {
  attempts: number;
  completedCount: number;
  lessonId: string;
  reaction?: any;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  unitId: string;
}
export interface CollectionPerformanceUsageDataModel {
  attemptStatus: string;
  collectionId: string;
  completedCount: number;
  gradingStatus: string;
  score: number;
  reaction: number;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  views: number;
}
export interface PlayerPerformanceModel {
  sessionId: string;
  performance: PortfolioPerformanceSummaryModel;
  context: PlayerContextModel;
}
export interface UnitPerformance {
  attemptStatus: string;
  attempts: number;
  completedCount: number;
  reaction: number;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  unitId: string;
}
export interface UnitLessonPerformance {
  attemptStatus: string;
  attempts: number;
  completedCount: number;
  reaction: number;
  scoreInPercentage: number;
  timeSpent: number;
  totalCount: number;
  lessonId: string;
}
export interface ClassTimeSpentModel {
  classId: string;
  totalTimespent: number;
  collectionTimespent: number;
  assessmentTimespent: number;
  caTimespent: number;
  ljTimespent: number;
  destinationEta: number;
}
export interface ClassLessonStatsModel {
  classId: string;
  completedLessons: number;
  totalLessons: number;
  totalPercentage?: number;
}
export interface EvidenceModel {
  filename: string;
  originalFilename: string;
  url?: string;
}
export interface PerformancesModel {
  attempts: string;
  collectionId: string;
  score: number;
  timeSpent: number;
}
