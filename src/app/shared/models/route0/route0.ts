import { CollectionPerformanceUsageDataModel } from '@shared/models/performance/performance';

export interface Route0ContentModel {
  createdAt: number;
  route0Content: {
    milestones: Array<Route0MilestonesModel>
  };
  status: string;
}

export interface Route0MilestonesModel {
  lessons: Array<Route0LessonsModel>;
  milestoneId: string;
  sequenceId: number;
  milestoneTitle: string;
  isRoute0: boolean;
  competencyCount?: number;
}

export interface Route0LessonsModel {
  collections: Array<Route0CollectionsModel>;
  isPerformance?: boolean;
  lessonId: string;
  lessonSequence: number;
  lessonTitle: string;
  unitId: string;
  unitTitle: string;
  unitSequence: number;
  isCurrentLesson?: boolean;
  txCompCode?: Array<string>;
}

export interface Route0CollectionsModel {
  id: string;
  collectionSequence: number;
  collectionType: string;
  pathId: number;
  format: string;
  pathType: string;
  title: string;
  thumbnailXS: string;
  performance?: CollectionPerformanceUsageDataModel;
  ctxPathId: number;
  ctxPathType: string;
  gutCodes?: Array<string>;
  isCollection: boolean;
  isAssessment: boolean;
  isExternalAssessment: boolean;
  isExternalCollection: boolean;
  isOfflineActivity: boolean;
}
