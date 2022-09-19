import { ClassCompetencySummaryModel, CurrentLocation } from '@shared/models/competency/competency';
import { CourseModel } from '@shared/models/course/course';
import { CAPerformanceModel, ClassLessonStatsModel, ClassTimeSpentModel, PerformanceModel } from '@shared/models/performance/performance';

export interface ClassesModel {
  classes: Array<ClassModel>;
  collaborator: Array<string>;
  member: Array<string>;
  memberCount: number;
  owner: string;
  teacherDetails: Array<TeacherDetailsModel>;
  setting?: Settings;
}
export interface ClassModel {
  class_sharing: string;
  code: string;
  collaborator: string;
  classTimeSpent?: ClassTimeSpentModel;
  classLessonStats?: ClassLessonStatsModel;
  content_visibility: string;
  course_id: string;
  course_title: string;
  course_version: string;
  cover_image: string;
  created_at?: string;
  creator_id?: string;
  description: string;
  end_date?: string;
  force_calculate_ilp?: boolean;
  gooru_version?: number;
  grade: string;
  grade_current?: number;
  grade_lower_bound?: number;
  grade_upper_bound?: number;
  greeting: string;
  id: string;
  is_archived: boolean;
  milestone_view_applicable?: boolean;
  min_score: number;
  primary_language?: string;
  preference?: any;
  roster_id: string;
  route0_applicable?: boolean;
  setting: string;
  title: string;
  updated_at: string;
  currentLocation?: CurrentLocation;
  competencyStats?: ClassCompetencySummaryModel;
  course?: CourseModel;
  isPublic: boolean;
  isPremiumClass?: boolean;
  performanceSummary?: PerformanceModel;
  performanceSummaryForDCA?: CAPerformanceModel;
  teacher?: TeacherDetailsModel;
  isLoadedperformanceSummary?: boolean;
  isLoadedperformanceSummaryForDCA?: boolean;
  thumbnail?: string;
}
export interface SecondaryClasses {
  confirmation: boolean;
  list: Array<string>;
}
export interface Settings {
  coursePremium: boolean;
  masteryPpplicable: string;
  SecondaryClasses: SecondaryClasses;
}
export interface TeacherDetailsModel {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  roster_global_userid: string;
  thumbnail: string;
}
export interface ClassMembersGrade {
  userId: string;
  bounds: ClassMembersGradeBound;
}

export interface ClassMembersGradeBound {
  gradeLevel: number;
  gradeLowerBound: number;
  gradeUpperBound: number;
}

export interface DestinationModel {
  id: string;
  title: string;
  preference: {
    subject: string;
    framework: string;
  };
  classificationCode?: string;
  grade_current: string;
  isPublic: boolean;
  milestone_view_applicable: boolean;
  courseId?: string;
}
