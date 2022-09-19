import { LessonModel, LessonSuggestionsModel } from '@shared/models/lesson/lesson';
import { MilestonePerformanceModel } from '@shared/models/performance/performance';

export interface MilestoneListModel {
  aggregatedTaxonomy: any;
  collaborator?: Array<string>;
  createdAt?: string;
  creatorId: string;
  creatorSystem: any;
  description: string;
  id: string;
  license?: string;
  metadata: Array<any>;
  milestones: Array<MilestoneModel>;
  modifierId: string;
  originalCourseId: string;
  originalCreatorId: string;
  ownerId: string;
  primaryLanguage: number;
  publishDate?: string;
  publishStatus: string;
  sequenceId: number;
  subjectBucket: string;
  taxonomy: any;
  thumbnail?: string;
  title: string;
  updatedAt?: string;
  useCase: string;
  version: string;
  visibleOnProfile: boolean;
}

export interface MilestoneModel {
  gradeId: number;
  gradeName: string;
  gradeSeq: number;
  milestoneId: string;
  txSubjectCode: string;
  performance?: MilestonePerformanceModel;
  lessons?: Array<LessonModel>;
  isCurrentMilestone?: boolean;
  sequenceId: number;
  isLessonLoaded?: boolean;
  isRescoped?: boolean;
  isClassGrade?: boolean;
  nextMilestoneIsRescope?: boolean;
  competencyCount?: number;
  computedEtlSecs?: number;
  isRoute0?: boolean;
  isFirstLessonIsDiagnostic?: boolean;
  isUnit0?: boolean;
}

export interface SkippedContents {
  assessments: Array<string>;
  assessmentsExternal: Array<string>;
  collections: Array<string>;
  collectionsExternal: Array<string>;
  lessons: Array<string>;
  units: Array<string>;
  isRescoped?: boolean;
}

export interface MilestoneDetailsModel {
  milestoneId: string;
  competencyCount: number;
  domains: Array<DomainDetailsModel>;
}

export interface DomainDetailsModel {
  domainCode: string;
  domainName: string;
  domainSeq: number;
  competencyCount: number;
  topics: Array<TopicDetailsModel>;
}

export interface TopicDetailsModel {
  topicCode: string;
  topicName: string;
  topicSeq: number;
  competencyCodes: Array<string>;
  competencyCount: number;
  collections: Array<CollectionDetailsModel>;
}

export interface CollectionDetailsModel {
  collectionCode: string;
  collectionName: string;
  collectionThumbnail: string;
  collectionType: string;
  competencyCode: string;
  competencySeq: number;
  lessonId: string;
  unitId: string;
}

export interface AlternativeLearningContentsModel {
  contents: Array<LearningContentsModel>;
  milestoneId: string;
}

export interface DomainAlternativeLearningContentsModel {
  contents: Array<LearningContentsModel>;
  domainCode: string;
}

export interface TopicAlternativeLearningContentsModel {
  contents: Array<LearningContentsModel>;
  topicCode: string;
}

export interface CompetencyAlternativeLearningContentsModel {
  contents: Array<LearningContentsModel>;
  competencyCode: string;
}

export interface MilestoneStatsModel {
  lessonsStudied: number;
  milestoneId: string;
  totalLessons: number;
}

export interface LearningContentsModel {
  contentId: string;
  contentType: string;
  creatorId: string;
  description: string;
  fwCompCode: string;
  fwCompDesc: string;
  fwCompDisplayCode: string;
  gutCompCode: string;
  gutCompDesc: string;
  gutCompDisplayCode: string;
  learningDurationInMins: number;
  title: string;
  userStudiedCount: number;
  publisherName: string;
  publisherThumbnail: string;
  contentSubtype: string;
  url?: string;
  defaultThumbnail: string;
}

export interface MilestoneAlternatePathModel {
  context: MilestoneAlternatePathContextModel;
  diagnosticStats: DiagnosticStatsModel;
  lessonSuggestions: Array<LessonSuggestionsModel>;
}

export interface MilestoneAlternatePathContextModel {
  ctxClassId: string;
  ctxCollectionId: string;
  ctxCourseId: string;
  ctxGradeId: number;
  ctxLessonId: string;
  ctxMilestoneId: string;
  ctxUnitId: string;
  domainCode: string;
  gradeId: number;
}

export interface DiagnosticStatsModel {
  session_id: string;
  status: string;
}
