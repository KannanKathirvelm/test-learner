export interface StreakStatsModel {
  classId: string;
  streakCompetencies: string;
}

export interface SuggestionStatsModel {
  acceptedSuggestions: string;
  classId: string;
  totalSuggestions: string;
}

export interface MasteredStatsModel {
  completedCompetencies: string;
  [key: string]: string;
}

export interface CompetencyModel {
  id: string;
  code: string;
  status: string;
}

export interface StudentsReportModel {
    class: ClassDetailModel;
    course: CourseDetailModel;
    studentsSummaryData?: Array<StudentSummaryDataModel>;
    teacher: TeacherDetailModel;
}

export interface ClassDetailModel {
    activeStudentCount: number;
    code: string;
    grade?: string;
    id: string;
    title: string;
}

export interface CourseDetailModel {
    id: string;
    title: string;
}

export interface TeacherDetailModel {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
    profileImage: string;
}

export interface StudentDetailModel {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
    thumbnailUrl: string;
}

export interface StudentSummaryDataModel {
    completedCompetencies: Array<CompetencyModel>;
    masteredCompetenciesCount?: number;
    diagnosticGainedStatus?: number;
    inprogressCompetenciesCount?: number;
    masteryChallengeCount?: number;
    collectionTimespent?: number;
    assessmentTimespent?: number;
    endDate: string;
    inferredCompetencies: Array<CompetencyModel>;
    inprogressCompetencies: Array<CompetencyModel>;
    interactionData: InteractionDataModel;
    masteredCompetencies: Array<CompetencyModel>;
    startDate: string;
    totalTimespent: string;
    suggestionData: InteractionDataModel;
}

export interface StudentDataModel {
  completedCompetencies: number;
  endDate: string;
  inferredCompetencies: number;
  inprogressCompetencies: number;
  interactionData: InteractionDataModel;
  masteredCompetencies: number;
  startDate: string;
  suggestionData: InteractionDataModel;
}

export interface InteractionDataModel {
    assessmentData: InteractionsModel;
    collectionData: InteractionsModel;
}

export interface InteractionsModel {
    averageScore: number;
    count: number;
    sessionsCount: number;
    totalMaxScore: number;
    totalTimespent: number;
    isNotStarted: boolean;
}

export interface TimespentModel {
    assessmentTimespent: number;
    caTimespent: number;
    classTd: string;
    collectionTimespent: number;
    destinationEta: number;
    ljTimespent: number;
    totalTimespent: number;
}

export interface StudentClassReportModel {
    reportDate: string;
    code: string;
    title: string;
    description: string;
    score: number;
    status: string;
    tries: number;
    assessmentId: string;
}

export interface StudentOverallCompetenciesModel {
    diagnostics: Array<StudentClassReportModel>;
    reinforced: Array<StudentClassReportModel>;
    mastered: Array<StudentClassReportModel>;
    growth: Array<StudentClassReportModel>;
    concern: Array<StudentClassReportModel>;
    inprogress: Array<StudentClassReportModel>;
}

export interface StudentsTimeSpentModel {
    id: string;
    firstName: string;
    lastName: string;
    thumbnail: string;
    totalCollectionTimespent: string;
    totalAssessmentTimespent: string;
    totalOfflineActivityTimespent: string;
}

export interface StudentDatewiseTimespentModel {
    reportDate: string;
    data: Array<StudentDatewiseDataModel>;
}

export interface StudentDatewiseDataModel {
    id: string;
    title: string;
    format: string;
    totalTimespent: string;
    sessions: Array<{sessionId: string, contentSource: string}>;
    competencies: Array<{title: string, code: string}>;
    score: number;
    source: string;
    status: string;
}
