import { UnitLessonSummaryModel } from '@shared/models/lesson/lesson';
import { UnitPerformance } from '@shared/models/performance/performance';
import { TaxonomyKeyModel } from '@shared/models/taxonomy/taxonomy';

export interface CourseDetailModel {
  aggregatedTaxonomy: TaxonomyKeyModel;
  collaborator: string;
  createdAt: string;
  creatorId: string;
  creatorSystem: string;
  description: string;
  id: string;
  license: number;
  metadata: string;
  modifierId: string;
  originalCourseId: string;
  originalCreatorId: string;
  ownerId: string;
  primaryLanguage: string;
  publishDate: string;
  publishStatus: string;
  sequenceId: number;
  subjectBucket: string;
  taxonomy: TaxonomyKeyModel;
  thumbnail: string;
  title: string;
  unitSummary: Array<UnitSummaryModel>;
  updatedAt: string;
  useCase: string;
  version: string;
  visibleOnProfile: boolean;
}

export interface UnitSummaryModel {
  lessonCount: number;
  sequenceId: number;
  title: string;
  unitId: string;
  lessons?: Array<UnitLessonSummaryModel>;
  performance?: UnitPerformance;
  isCurrentUnit?: boolean;
  isUnit0?: boolean;
  isRescoped?: boolean;
  lessonId?: boolean;
}
