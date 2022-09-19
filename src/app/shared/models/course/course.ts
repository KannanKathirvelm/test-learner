import { ClassCompetencySummaryModel } from '@shared/models/competency/competency';
import { TaxonomyKeyModel } from '@shared/models/taxonomy/taxonomy';

export interface CourseModel {
  id: string;
  subject: string;
  thumbnailUrl?: string;
  title: string;
  version: string;
  ownerId: string;
}

export interface GroupedFeaturedCourseModel {
  categoryId: string;
  categoryTitle: string;
  subjectId: string;
  subjectTitle: string;
  isActive?: boolean;
  isToggleCourse?: boolean;
  isMoreClasses?: boolean;
  framework: string;
  filterCourses?: Array<FeaturedCourseListModel>;
  courses: Array<FeaturedCourseListModel>;
  isJoinedClass?: boolean;
}

export interface FeaturedCourseListModel {
  aggregatedTaxonomy: TaxonomyKeyModel;
  collaborator: any;
  collabaratorCount?: number;
  description: string;
  id: string;
  learnerCount: number;
  originalCourseId: string;
  originalCreatorId: string;
  ownerId: string;
  summary: string;
  additionalInfo: AdditionalInfoModel;
  primaryLanguage: number;
  publishStatus: string;
  sequenceId: number;
  settings: CourseSettings;
  subjectBucket: string;
  taxonomy: TaxonomyKeyModel;
  thumbnail: string;
  title: string;
  visibleOnProfile: boolean;
  hasJoined: boolean;
  isPublicClass?: boolean;
  isActive?: boolean;
  courseCompletion?: {
    classId: string;
    completedLessons: number;
    totalLessons: number;
    totalPercentage: number;
  };
  competencyStats?: ClassCompetencySummaryModel;
  defaultGradeLevel: number;
  navigatorSubProgramId: number;
  navigatorProgramInfo: any;
}

export interface AdditionalInfoModel {
  category: {
    id: string, title: string
  };
  subject: {
    id: string, title: string
  };
}

export interface CourseSettings {
  force_calculate_ilp: boolean;
  framework: string;
  grade_current: number;
  grade_lower_bound: number;
  grade_upper_bound: number;
  instructor_id: string;
  route0_applicable: boolean;
}

export interface CourseContentVisibility {
  assessments: Array<ContentVisibility>;
  collections: Array<ContentVisibility>;
}

export interface ContentVisibility {
  id: string;
  visible: string;
}

export interface NavigatorProgram {
  description: string;
  id: number;
  sequence: number;
  title: string;
  images: any;
}
