export interface TenantSettingsModel {
  translationSetting?: {
    language: string;
  };
  allowMultiGradeClass: string;
  defaultSkylineGradeDiffForDiagnostic?: number;
  competencyCompletionDefaultMinScore: number;
  competencyCompletionMinScore: CompetencyCompletionMinScoretModel;
  competencyCompletionThresholdForAssessment: CompetencyCompletionThresholdForAssessmentModel;
  enableClsVideoConfSetup: string;
  groupHierarchy: string;
  filterNonPremiumCourse?: string;
  navigatorClassSetting: NavigatorClassSettingModel;
  txSubClassifierPrefs: TxSubClassifierPrefsModel;
  txSubPrefs: TxSubPrefsModel;
  twFwPref: {
    [key: string]: FwIdsModel
  };
  preferredFacetSubjectCodes: Array<string>;
  defaultSkylineGradeDiff: {
    [key: string]: number
  };
  useLearnerDataVisibiltyPref: string;
  navigatorRouteMapViewApplicable: {
    [key: string]: boolean
  };
  enableMilestoneViewAtFwLevel: {
    [key: string]: boolean
  };
  isShowReaction: boolean;
  showJoinClass: boolean;
  uiElementVisibilitySettings: {
    questionEvidenceVisibility ?: QuestionEvidence;
    showQuestionEvidence?: boolean;
    classCreateShowSubjectCards?: boolean;
    showLogo: boolean;
    lessonLabelCourseMap?: string;
    enableStudyPlayerFullscreenMode: boolean;
    logoUrl: string;
    studyPlayerPgImage: string;
    isLearningJourneyPathView: boolean;
    enableNavigatorProgram: boolean;
    hideCourseMapViewContentLabelSeq?: boolean;
  };
  enableGuardianCollectionPreview: boolean;
  hideGuardianAnswerDetails: boolean;
}

export interface FwIdsModel {
  fw_ids: Array<string>;
}

export interface QuestionEvidence {
  default ?: boolean;
  fillInTheBlankQuestion?: boolean;
  hotTextReorderQuestion ?: boolean;
  multipleAnswerQuestion?: boolean;
  multipleChoiceQuestion ?: boolean;
  openEndedQuestion?: boolean;
  trueFalseQuestion?: boolean;
}

export interface TxSubClassifierPrefsModel {
  defaultubClassificationId: string;
  isGlobalVisible: boolean;
}

export interface TxSubPrefsModel {
  subject: string;
  defaultGutSubjectCode: string;
  isGlobalVisible: boolean;
}

export interface CompetencyCompletionMinScoretModel {
  [key: string]: number;
}

export interface CompetencyCompletionThresholdForAssessmentModel {
  [key: string]: number;
}

export interface NavigatorClassSettingModel {
  subjectCode: string;
  classOrigin: number;
  classVersion: string;
  courseId: string;
  diagnosticApplicable: boolean;
  framework: string;
  route0Applicable: boolean;
  studentMathLevel: number;
}
