import { RubricModel } from '@shared/models/rubric/rubric';

export interface GradeItemDeatilsModel {
  attempts: number;
  bidirectional: boolean;
  classroom_play_enabled: boolean;
  collectionSubType: string;
  courseId: string;
  authorEtlSecs: number;
  exemplar: string;
  format: string;
  id: string;
  isVisibleOnProfile: boolean;
  learningObjectives: string;
  lessonId: string;
  maxScore: number;
  ownerId: string;
  pathId: string;
  reference: string;
  references: Array<ReferenceModel>;
  studentRubric: RubricModel;
  teacherRubric: RubricModel;
  sequence: number;
  showFeedback: string;
  showKey: boolean;
  standards: Array<StandardModel>;
  subFormat: string;
  taskCount: number;
  tasks: Array<TaskModel>;
  thumbnailUrl: string;
  title: string;
  unitId: string;
  url: string;
}

export interface GradeDetailsModel {
  classId: string;
  contentType: string;
  content: GradeItemDeatilsModel;
  dcaContentId: number;
  collectionId: string;
}

export interface ReferenceModel {
  id: number;
  location: string;
  oaId: string;
  subType: string;
  type: string;
  name: string;
}

export interface StandardModel {
  code: string;
  description: string;
  frameworkCode: string;
  id: string;
  parentTitle: string;
  taxonomyLevel: string;
  title: string;
}

export interface TaskModel {
  description: string;
  id: number;
  oaId: string;
  oaTaskSubmissions: Array<OaTaskSubmissionModel>;
  submissionCount: number;
  title: string;
  submissions?: Array<SubmissionModel>;
  isSubmitted?: boolean;
}


export interface OaTaskSubmissionModel {
  id: string;
  oaTaskId: string;
  taskSubmissionType: string;
  taskSubmissionSubType: string;
}

export interface SelectedCategoryModel {
  selectCategoryIndex: number;
  selectedLevel: SelectedLevelModel;
  selectedLevelIndex: number;
  allowsScoring: boolean;
  levelComments?: string;
}

export interface SelectedLevelModel {
  allowsScoring: boolean;
  categoryTitle: string;
  description: string;
  maxScore: number;
  name: string;
  score: number;
  scoreInPrecentage: number;
}
export interface TabsModel {
  title: string;
  isActive: boolean;
  contentType?: string;
}

export interface SubmissionsModel {
  tasks: { taskId: number, submissions: SubmissionModel[] }[];
  oaRubrics?: {
    studentGrades?: OARubricGrade,
    teacherGrades?: OARubricGrade
  };
}

export interface SubmissionModel {
  freeFormText: SubmissionTypeModel[];
  uploaded: SubmissionTypeModel[];
  remote: SubmissionTypeModel[];
}
export interface SubmissionTypeModel {
  submissionIcon: string;
  submissionInfo: string;
  submissionSubtype: string;
  submissionType: string;
  submittedOn: string;
}

export interface OARubricGrade {
  rubricId?: string;
  timeSpent?: number;
  studentScore?: number;
  maxScore?: number;
  overallComment?: string;
  grader?: string;
  submittedOn?: string;
  categoryScore?: number;
  scoreInPercentage?: number;
}

export interface TaskFileUpload {
  uuidName: string;
  fileType: string;
  isUploaded?: boolean;
  isUploading?: boolean;
}
