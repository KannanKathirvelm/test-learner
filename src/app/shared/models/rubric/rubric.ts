export interface RubricModel {
  audience: string;
  categories: Array<CategoriesModel>;
  createdDate: string;
  description: string;
  feedback: string;
  grader: string;
  gradeType?: string;
  gutCodes: string;
  id: string;
  increment: number;
  isPublished: boolean;
  maxScore: number;
  modifierId?: string;
  originalCreatorId?: string;
  originalRubricId?: string;
  parentRubricId?: string;
  publishDate: string;
  requiresFeedback: boolean;
  rubricOn?: string;
  scoring: boolean;
  tenant?: string;
  tenantRoor?: string;
  thumbnail: string;
  title: string;
  updatedDate?: string;
  uploaded: boolean;
  url: string;
  comment?: string;
  score?: number;
}

export interface CategoriesModel {
  allowsLevels: boolean;
  allowsScoring: boolean;
  feedbackGuidance: string;
  levels: Array<LevelModel>;
  requiresFeedback: boolean;
  title: string;
  maxScore?: number;
  comment?: string;
  scoreInPrecentage?: number;
}

export interface LevelModel {
  name: string;
  score: number;
  description: string;
  scoreInPrecentage: number;
  isSelected?: boolean;
  comments?: string;
  isChecked?: boolean;
}

export interface SelectedLevelModel {
  level: LevelModel;
  levelIndex: number;
  allowsScoring?: boolean;
}
