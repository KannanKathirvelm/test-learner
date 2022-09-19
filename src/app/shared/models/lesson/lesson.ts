import { CollectionModel, DiagnosticCollectionModel } from '@shared/models/collection/collection';
import { LessonPerformanceUsageDataModel } from '@shared/models/performance/performance';
import { TaxonomyKeyModel } from '@shared/models/taxonomy/taxonomy';

export interface LessonModel {
  fwCode: string;
  gradeId: number;
  gradeName: string;
  gradeSeq: number;
  lessonId: string;
  lessonSequence: number;
  lessonTitle: string;
  txCompCode: string;
  txCompName: string;
  txCompSeq: number;
  txCompStudentDesc: string;
  txDomainCode: string;
  txDomainId: number;
  txDomainName: string;
  txDomainSeq: number;
  txSubjectCode: string;
  unitId: string;
  unitSequence: number;
  isLastLesson?: boolean;
  isFirstSystemSuggested?: boolean;
  isFirstTeacherSuggested?: boolean;
  isFirstSuggestedCollection?: boolean;
  firstSuggestedPathType?: string;
  unitTitle: string;
  isCurrentLesson?: boolean;
  isRescoped: boolean;
  performance?: LessonPerformanceUsageDataModel;
  collections?: Array<CollectionModel>;
  title?: string;
}

export interface LessonListModel {
  courseId: string;
  lessons: Array<LessonModel>;
  milestoneId: string;
}

export interface UnitLessonContentModel {
  aggregatedTaxonomy: TaxonomyKeyModel;
  bigIdeas: string;
  courseId: string;
  createdAt: string;
  creatorId: string;
  creatorSystem: string;
  essentialQuestions: string;
  lessonSummary: Array<UnitLessonSummaryModel>;
  metadata: string;
  modifierId: string;
  originalCreatorId: string;
  originalUnitId: string;
  ownerId: string;
  primaryLanguage: number;
  sequenceId: number;
  taxonomy: TaxonomyKeyModel;
  title: string;
  unitId: string;
  updatedAt: string;
}

export interface UnitLessonSummaryModel {
  assessmentCount: number;
  collectionCount: number;
  externalAssessmentCount: number;
  externalCollectionCount: number;
  lessonId: string;
  oaCount: number;
  sequenceId: number;
  title: string;
  collections?: Array<CollectionModel>;
  isCurrentLesson?: boolean;
  isVisible?: boolean;
  isRescoped?: boolean;
}

export interface LessonSuggestionsModel {
  id: string;
  lessonId: string;
  title: string;
  sequence_id: number;
  collections: Array<DiagnosticCollectionModel>;
}
