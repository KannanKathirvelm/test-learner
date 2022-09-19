import { CollectionsModel } from '@shared/models/collection/collection';
import { PrerequisitesModel } from '@shared/models/competency/competency';
import { TaxonomyModel } from '@shared/models/taxonomy/taxonomy';

export interface SignatureContentModel {
  creator: CreatorModel;
  description: string;
  efficacy: number;
  engagement: number;
  id: string;
  owner: OwnerModel;
  relevance: number;
  thumbnail: string;
  title: string;
  collection: CollectionsModel;
  collectionType: string;
  suggestedContentType: string;
  suggestedContentId: string;
  isAssessment?: boolean;
  isCollection?: boolean;
}

export interface OwnerModel {
  firstName: string;
  id: string;
  lastName: string;
  profileImage?: string;
  username: string;
  usernameDisplay?: string;
  avatarUrl: string;
}

export interface CreatorModel {
  firstname: string;
  id: string;
  lastname: string;
  profileImage?: string;
  username?: string;
  usernameDisplay?: string;
  avatarUrl?: string;
}

export interface SearchCompetencyLearingMapModel {
  code: string;
  contents: SearchContentModel;
  course: string;
  domain: string;
  gutCode: string;
  learningMapsContent: LearningMapsContent;
  owner?: string;
  prerequisites: PrerequisitesModel;
  signatureContents: ContentTypeModel;
  subject: string;
  title: string;
}

export interface ContentTypeModel {
  [key: string]: Array<SignatureContentModel>;
}

export interface SearchContentModel {
  assessment: SearchContentType;
  assessmentExternal: SearchContentType;
  collection: SearchContentType;
  collectionExternal: SearchContentType;
  course: SearchContentType;
  lesson: SearchContentType;
  offlineActivity: SearchContentType;
  question: SearchContentType;
  resource: SearchContentType;
  rubric: SearchContentType;
  unit: SearchContentType;
}

export interface SearchContentType {
  resultCount: number;
  searchResults: Array<SerachResultModel>;
  totalHitCount: number;
}

export interface LearningMapsContent {
  assessment: Array<ContentModel>;
  collection: Array<ContentModel>;
  course: Array<ContentModel>;
  lesson: Array<ContentModel>;
  question: Array<ContentModel>;
  resource: Array<ContentModel>;
  rubric: Array<ContentModel>;
  unit: Array<ContentModel>;
}

export interface ContentModel {
  course?: string;
  courseId?: string;
  creator: CreatorModel;
  description: string;
  efficacy: number;
  engagement: number;
  format?: string;
  id: string;
  isVisibleOnProfile: string;
  learningObjectives?: string;
  owner: OwnerModel;
  publishStatus?: string;
  questionCount?: number;
  relevance: number;
  remixCount?: string;
  resourceCount?: number;
  lessonCount?: number;
  standards: TaxonomyModel;
  thumbnailUrl: string;
  title: string;
  version?: string;
  unitCount?: string;
  publisher?: Array<string>;
  subjectSequence?: string;
  subjectName?: string;
  subject?: string;
  contentSubFormat?: string;
  type?: string;
  lastModified?: string;
  assessmentCount?: string;
  collectionCount?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  isPublished?: boolean;
  sequence?: number;
}
export interface AnswerModel {
  answerId: string;
  answerText: string;
  answerType: string;
}
export interface SerachResultModel {
  answers?: Array<AnswerModel>;
  collaboratorCount: number;
  collectionItemCount?: number;
  collectionRemixCount?: number;
  creator: OwnerModel;
  efficacy: number;
  engagement: number;
  format: string;
  contentFormat: string;
  explanation: string;
  grade?: string;
  id: string;
  isCrosswalked: boolean;
  hasFrameBreaker?: boolean;
  isFeatured: boolean;
  learningObjective?: string;
  publishStatus: string;
  hints?: string;
  publisher?: Array<string>;
  questionText?: string;
  originalCreator?: string;
  questionCount?: number;
  lessonCount?: number;
  remixedInAssessmentCount?: number;
  externalAssessmentCount?: number;
  remixedInCollectionCount?: number;
  relevance: number;
  assessmentCount?: number;
  collectionCount?: number;
  remixedInClassCount?: number;
  remixedInCourseCount?: number;
  resourceCount?: number;
  taskCount?: number;
  taxonomy: TaxonomyModel;
  thumbnail: string;
  title: string;
  url?: string;
  usedByStudentCount?: number;
  user?: OwnerModel;
  viewCount?: number;
}
