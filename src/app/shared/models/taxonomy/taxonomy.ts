export interface TaxonomyModel {
  code: string;
  id: string;
  title: string;
  frameworkCompetencyCode?: string;
  isDefault?: boolean;
  frameworkId?: string;
}

export interface TaxonomySubjectModel {
  code: string;
  description: string;
  frameworks: any;
  id: string;
  standardFrameworkId: string;
  title: string;
}

export interface TaxonomyGrades {
  grade: string;
  description: string;
  id: number;
  sequence?: number;
  thumbnail?: string;
  code: string;
  frameworkId?: string;
  sequenceId?: number;
  showGradeLevel?: boolean;
  levels?: Array<GradeLevels>;
}

export interface GradeLevels {
  id: number;
  label?: string;
  grade?: string;
  description: string;
  levelSequence: number;
}

export interface TaxonomyGradesSubjectmodel {
  [key: string]: Array<TaxonomyGrades>;
}

export interface CategoryClassificationModel {
  code: string;
  id: string;
  isLoad: boolean;
  subjectList: Array<SubjectModel>;
  title: string;
}

export interface SubjectModel {
  code: string;
  description?: string;
  frameworks?: Array<FrameworkModel>;
  id: number;
  standardFrameworkId?: string;
  title?: string;
  sequenceId?: number;
  frameworkId?: string;
}


export interface GradeBoundaryModel {
  domainCode: string;
  highline: string;
  highlineTopic: string;
  highlineComp?: string;
  averageComp?: string;
  topicAverageComp?: string;
  topicHighlineComp: string;
  topicCode: string;
}

export interface MultiGradeActiveList {
  [key: number]: GradeBoundaryModel;
}

export interface FrameworkModel {
  standardFrameworkId: string;
  taxonomySubjectId: string;
  taxonomySubjectTitle: string;
  title: string;
}

export interface TaxonomyKeyModel {
  [key: string]: {
    code: string;
    title: string;
    parent_title: string;
    framework_code: string;
  };
}
