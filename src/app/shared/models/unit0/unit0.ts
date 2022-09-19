import { CollectionPerformanceUsageDataModel } from '@shared/models/performance/performance';

export interface Unit0Model {
    lessons: Array<Unit0LessonModel>;
    milestoneId: string;
    sequenceId: number;
    milestoneTitle: string;
    isUnit0: boolean;
    competencyCount?: number;
    unitId: string;
    title: string;
    isRescoped?: boolean;
}

export interface Unit0LessonModel {
    collections: Array<Unit0CollectionModel>;
    isPerformance?: boolean;
    lessonId: string;
    lessonSequence: number;
    lessonTitle: string;
    unitId: string;
    unitTitle: string;
    unitSequence: number;
    isCurrentLesson?: boolean;
    txCompCode?: Array<string>;
    title?: string;
}

export interface Unit0CollectionModel {
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
    isVisible: boolean;
    isCollection: boolean;
    isAssessment: boolean;
    isExternalAssessment: boolean;
    isExternalCollection: boolean;
    isOfflineActivity: boolean;
}
