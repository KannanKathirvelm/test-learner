import { TaxonomyModel } from '@shared/models/taxonomy/taxonomy';

export interface ClassCompetencySummaryModel {
  classId: string;
  completedCompetencies: number;
  totalCompetencies: number;
  completionPercentage: number;
  masteredCompetencies?: number;
  totalCompletion?: number;
}
export interface CurrentLocation {
  classId: string;
  collectionId: string;
  collectionTitle: string;
  collectionType: string;
  courseId: string;
  lessonId: string;
  milestoneId: string;
  pathId: number;
  pathType: string;
  ctxPathId: number;
  ctxPathType: string;
  scoreInPercentage: number;
  status: string;
  unitId: string;
}

export interface CompetencyCompletionModel {
  competencyStatus: Array<CompetencyCompletionStatusModel>;
}

export interface CompetencyCompletionStatusModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStudentDesc: string;
  domainCode: string;
  domainSeq: number;
  source: string;
  status: number;
  topicCode: string;
  topicSeq: number;
}

export interface SubjectCompetencyMatrixModel {
  classificationCode: string;
  classificationName: string;
  classificationSeq: number;
  competencyStats: Array<SubjectCompetencyMatrixCountModel>;
  subjectCode: string;
  subjectName: string;
  subjectSeq: number;
  totalCompetenciesCount?: number;
  isActive?: boolean;
  sequence: number;
  competenciesCount?: Array<UserSubjectCompetencyCountModel>;
  masteredCompetenciesCount?: number;
}

export interface UserSubjectCompetencyCountModel {
  count: number;
  status: number;
}

export interface SubjectCompetencyMatrixCountModel {
  competencyCount: number;
  competencyStatus: number;
}

export interface CompetencyStyleModel {
  left: string;
  top: string;
  width: string;
  height: string;
}

export interface SelectedCompetencyModel {
  competency: CompetencyModel;
  domainCompetencyList: DomainModel;
  showFullReport?: boolean;
}

export interface CompetencyMatrixModel {
  competencies: Array<CompetencyModel>;
  domainCode: string;
  domainName: string;
  domainSeq: number;
}

export interface CrossWalkModel {
  domainName: string;
  domainSeq: number;
  domainCode: string;
  fwDomainName: string;
  topics: Array<CrossWalkTopicModel>;
}

export interface CrossWalkTopicModel {
  fwTopicName: string;
  topicCode: string;
  topicName: string;
  topicSeq: number;
  competencies?: Array<CompetencyModel>;
}

export interface FwCompetenciesModel {
  [key: string]: FwCompetencyModel;
}

export interface DomainModel {
  domainName: string;
  domainSeq: number;
  domainCode: string;
  competencies?: Array<CompetencyModel>;
}

export interface TopicsModel {
  competencies: Array<TopicsCompetencyModel>;
  completedCompetencies: number;
  domainCode: string;
  domainSeq: number;
  inferredCompetencies: number;
  inprogressCompetencies: number;
  masteredCompetencies: number;
  notstartedCompetencies: number;
  topicCode: string;
  topicDesc: string;
  topicName: string;
  topicSeq: number;
}

export interface DomainTopicsModel {
  completedCompetencies: number;
  domainCode: string;
  domainName: string;
  domainSeq: number;
  inferredCompetencies: number;
  inprogressCompetencies: number;
  isActive: boolean;
  isExpanded: boolean;
  masteredCompetencies: number;
  notstartedCompetencies: number;
  topics: Array<TopicsModel>;
  totalCompetencies: number;
  isShowMasteredCompetency?: boolean;
}

export interface GradeBoundaryPointsModel {
  domainSeq: number;
  hiLineCompSeq: number;
  isExpanded: boolean;
  isHiLineAvailable?: boolean;
  skylineCompetencySeq?: number;
  topics: Array<{
    hiLineCompSeq: number;
    topicSeq: number;
    skylineCompetencySeq?: number;
  }>;
}

export interface DomainTopicCompetencyMatrixModel {
  completedCompetencies?: number;
  domainCode: string;
  inferredCompetencies?: number;
  inprogressCompetencies?: number;
  masteredCompetencies?: number;
  notstartedCompetencies?: number;
  topics: Array<TopicMatrixModel>;
  totalCompetencies?: number;
}

export interface MatrixCoordinatesModel {
  domainCode: string;
  domainName: string;
  domainSeq: number;
  topics: Array<MatrixCoordinatesTopicsModel>;
}

export interface MatrixCoordinatesTopicsModel {
  domainCode: string;
  domainSeq: number;
  topicCode: string;
  topicDesc: string;
  topicName: string;
  topicSeq: number;
}

export interface SelectedTopicsModel {
  topic: TopicsModel;
  domain: DomainTopicsModel;
  competency: TopicsCompetencyModel;
}

export interface TopicMatrixModel {
  competencies: Array<TopicsCompetencyModel>;
  completedCompetencies?: number;
  inferredCompetencies?: number;
  inprogressCompetencies?: number;
  masteredCompetencies?: number;
  notstartedCompetencies?: number;
  topicCode: string;
  isSkyLineCompetency?: boolean;
  topicSeq: number;
}

export interface SkyLineCompetencyModel {
  domainSeq: number;
  isExpanded?: boolean;
  skylineCompetencySeq: number;
  topicSkylinePoints: Array<TopicSkylinePointsModel>;
}

export interface UserSubjectCompetencySkylinePointsModel {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TopicSkylinePointsModel {
  skylineCompetencySeq: number;
  topicSeq: number;
}

export interface TopicsCompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStatus?: number;
  competencyStudentDesc: string;
  domainCode?: string;
  domainName?: string;
  domainSeq?: number;
  isGradeBoundary?: boolean;
  isInferred?: boolean;
  isMastered?: boolean;
  isSkylineCompetency?: boolean;
  source: string;
  status: number;
  topicCode?: string;
  topicSeq?: number;
  domainLevelCompetencySeq?: number;
  isExpanded?: boolean;
  isMappedWithFramework?: boolean;
}

export interface CrossWalkSubjectModel {
  [key: string]: Array<DomainModel>;
}

export interface FwCompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStudentDesc: string;
  frameworkCompetencyCode: string;
  frameworkCompetencyDisplayCode: string;
  frameworkCompetencyName: string;
  loCode: string;
  loName: string;
}

export interface PrerequisitesModel {
  code: string;
  id: string;
  status?: number;
  title: string;
  codeType?: string;
  isActive?: boolean;
  isSelectable?: boolean;
  parentTaxonomyCodeId?: string;
  sequenceId?: string;
}

export interface MicroCompetenciesModel {
  code: string;
  codeType: string;
  id: string;
  isActive: boolean;
  isSelectable: boolean;
  parentTaxonomyCodeId: string;
  sequenceId: number;
  title: string;
}

export interface CompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStudentDesc: string;
  status: number;
  competencyStatus?: number;
  domainCode?: string;
  domainName?: string;
  domainSeq?: number;
  isMastered?: boolean;
  isSkyLineCompetency?: boolean;
  isInferred?: boolean;
  isGradeBoundary?: boolean;
  className?: string;
  isLowline?: boolean;
  showSignatureAssessment?: boolean;
  isNoMapping?: boolean;
  isActive?: boolean;
  noFrameWork: boolean;
  isMappedWithFramework: boolean;
  framework: TaxonomyModel;
  isInferredCompetency?: boolean;
  source: string;
}
