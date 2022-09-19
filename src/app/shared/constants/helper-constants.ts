export const GRADING_SCALE = [
  {
    LOWER_LIMIT: 0,
    COLOR: '#F46360',
    RANGE: '0-59'
  },
  {
    LOWER_LIMIT: 60,
    COLOR: '#ED8E36',
    RANGE: '60-69'
  },
  {
    LOWER_LIMIT: 70,
    COLOR: '#FABA36',
    RANGE: '70-79'
  },
  {
    LOWER_LIMIT: 80,
    COLOR: '#A8C99C',
    RANGE: '80-89'
  },
  {
    LOWER_LIMIT: 90,
    COLOR: '#4B9740',
    RANGE: '90-100'
  }
];

export const ERROR_TYPES = {
  FATAL: 'fatal',
  NON_FATAL: 'non-fatal'
};

export const SKILLS_FRAMEWORK_ID = 'EMP';

export const DEFAULT_IMAGE = 'assets/images/default-course.png';
export const LAST_ACTIVITY = 'Last Activity';
export const RESUME_CURRENT_ACTIVITY = 'Resume Current Activity';
export const DEFAULT_IMAGES = {
  COLLECTION: 'assets/images/collection-default.png',
  ASSESSMENT: 'assets/images/assessment-default.png',
  ASSESSMENT_EXTERNAL: 'assets/images/assessment-default.png',
  OFFLINE_ACTIVITY: 'assets/images/offline-activity.png'
};
export const DEFAULT_IMAGES_XS = {
  COLLECTION: 'assets/images/collection-default-xs.png',
  ASSESSMENT: 'assets/images/assessment-default-xs.png',
  ASSESSMENT_EXTERNAL: 'assets/images/assessment-default-xs.png'
};
export const OFFLINE_ACTIVITY = 'offline-activity';
export const ASSESSMENT = 'assessment';
export const COLLECTION = 'collection';
export const ASSESSMENT_EXTERNAL = 'assessment-external';
export const COLLECTION_EXTERNAL = 'collection-external';
export const GOORU_SHORT_NAME = 'gooru';
export const CORRECT_ANSWER_YES = 'yes';
export const CORRECT_ANSWER_NO = 'no';
export const ANSWER_YES_VALUE = 1;
export const ANSWER_NO_VALUE = 0;
export const FOLLOWERS = 'followers';
export const FOLLOWINGS = 'followings';
export const NO_PROFILE = 'assets/images/no-profile.png';
export const CLASS_SKYLINE_INITIAL_DESTINATION = {
  courseMap: 'course-map',
  diagnosticPlay: 'diagnostic-play',
  showDirections: 'show-directions',
  ILPInProgress: 'ilp-in-progress',
  classSetupInComplete: 'class-setup-incomplete'
};
export const MIN_AGE_TO_GOOGLE_SIGNUP = 13;

export const MIN_AGE = 3;

export const PLAYER_EVENT_SOURCE = {
  COURSE_MAP: 'coursemap',
  DAILY_CLASS: 'dailyclassactivity',
  OFFLINE_CLASS: 'offline-activity',
  INDEPENDENT_ACTIVITY: 'ILActivity',
  RGO: 'rgo',
  DIAGNOSTIC: 'diagnostic',
  MASTER_COMPETENCY: 'competencyMastery',
  CLASS_ACTIVITY: 'class-activity',
  PROFICIENCY: 'proficiency',
  CA: 'ca'
};

export const RESOURCES_DEFAULT_IMAGES = {
  audio_resource: 'assets/images/default-audio-resource.png',
  image_resource: 'assets/images/default-image-resource.png',
  interactive_resource: 'assets/images/default-interactive-resource.png',
  text_resource: 'assets/images/default-text-resource.png',
  webpage_resource: 'assets/images/default-website-resource.png',
  video_resource: 'assets/images/default-video-resource.png'
};

export const RESOURCES_IMAGES = [
  {
    id: 'audio_resource',
    url: 'assets/images/icons/resource-icons/audio-resource.svg'
  },
  {
    id: 'image_resource',
    url: 'assets/images/icons/resource-icons/image-resource.svg'
  },
  {
    id: 'interactive_resource',
    url: 'assets/images/icons/resource-icons/interactive-resource.svg'
  },
  {
    id: 'text_resource',
    url: 'assets/images/icons/resource-icons/text-resource.svg'
  },
  {
    id: 'webpage_resource',
    url: 'assets/images/icons/resource-icons/webpage-resource.svg'
  },
  {
    id: 'video_resource',
    url: 'assets/images/icons/resource-icons/video-resource.svg'
  }
];

export const RESOURCES_LOADER_IMAGES = [
  {
    id: 'audio_resource',
    url: 'assets/images/icons/resource-icons/resource-loader-icons/audio-resource.svg'
  },
  {
    id: 'image_resource',
    url: 'assets/images/icons/resource-icons/resource-loader-icons/image-resource.svg'
  },
  {
    id: 'interactive_resource',
    url: 'assets/images/icons/resource-icons/resource-loader-icons/interactive-resource.svg'
  },
  {
    id: 'text_resource',
    url: 'assets/images/icons/resource-icons/resource-loader-icons/text-resource.svg'
  },
  {
    id: 'webpage_resource',
    url: 'assets/images/icons/resource-icons/resource-loader-icons/webpage-resource.svg'
  },
  {
    id: 'video_resource',
    url: 'assets/images/icons/resource-icons/resource-loader-icons/video-resource.svg'
  }
];

export const PLAYER_EVENT_TYPES = {
  START: 'start',
  STOP: 'stop'
};

export const PATH_TYPES = {
  SYSTEM: 'system',
  TEACHER: 'teacher',
  ROUTE: 'route0',
  UNIT0: 'unit0'
};

export const VIDEO_RESOURCE_TYPES = {
  YOUTUBE: 'youtube',
  VIMEO: 'vimeo'
};

export const PLAYER_TOOLBAR_OPTIONS = {
  BACKGROUND_COLOR: '#0072bc',
  FONT_COLOR: '#ffffff'
};

export const PLAYER_EVENTS = {
  REACTION: 'reaction.create',
  COLLECTION_PLAY: 'collection.play',
  RESOURCE_PLAY: 'collection.resource.play'
};

export const TAXONOMY_LEVELS = {
  COURSE: 'course',
  DOMAIN: 'domain',
  STANDARD: 'standard',
  MICRO: 'micro-standard',
  QUESTION: 'question',
  RESOURCE: 'resource'
};


export const COMPETENCY_STATUS = [
  'Not Started',
  'In Progress',
  'Mastered (Inferred)',
  'Mastered (Asserted)',
  'Mastered (Earned)',
  'Mastered (External system)',
  'Mastered'
];

export const DEFAULT_SUBJECT = 'K12.MA';

export const DEFAULT_FRAMEWORK = 'GDT';

export const PROFICIENCY = 'proficiency';

export const CONTENT_TYPES = {
  COLLECTION: 'collection',
  ASSESSMENT: 'assessment',
  EXTERNAL_ASSESSMENT: 'assessment-external',
  EXTERNAL_COLLECTION: 'collection-external',
  COURSE: 'course',
  UNIT: 'unit',
  LESSON: 'lesson',
  RESOURCE: 'resource',
  QUESTION: 'question',
  RUBRIC: 'rubric',
  OFFLINE_ACTIVITY: 'offline-activity',
  ACTIVITY: 'activity'
};

export const MICRO_COMPETENCY_CODE_TYPES = [
  'learning_target_level_0',
  'learning_target_level_1',
  'learning_target_level_2'
];

export const COMPETENCY = 'competency';

export const COMPETENCY_STATUS_VALUE = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  INFERRED: 2,
  ASSERTED: 3,
  EARNED: 4,
  DEMONSTRATED: 5,
  REINFERRED: 6
};

export const ASSESSMENT_SHOW_VALUES = {
  IMMEDIATE: 'immediate',
  SUMMARY: 'summary',
  NEVER: 'never'
};

export const SUBMISSION_TYPES = [
  'uploaded',
  'remote',
  'free-form-text'
];

export const GUT = 'GUT';

export const RUBRIC = {
  STUDENT: 'Self',
  TEACHER: 'Teacher',
  RUBRIC: 'Rubric'
};

export const CALENDAR_VIEW = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  DATE_FORMAT: 'YYYY-MM-DD',
  DATE_RANGE: 'dateRange'
};

export const REPORT_PERIOD_TYPE = {
  CURRENT_WEEK: 'current-week',
  PREVIOUS_WEEK: 'previous-week',
  TILL_NOW: 'till-now',
  CUSTOM_RANGE: 'custom-range'
};

export const OA = {
  UPLOADS: 'uploaded',
  FREE_FORM_TEXT: 'free-form-text',
  FORM_TEXT: 'freeFormText'
};

export const OA_TASK_SUBMISSION_TYPES = [
  {
    value: 'image',
    submissionType: 'uploaded',
    validExtensions: '.jpg, .jpeg, .gif, .png',
    icon: 'fa-file-image-o'
  },
  {
    value: 'pdf',
    submissionType: 'uploaded',
    validExtensions: '.pdf',
    icon: 'fa-file-pdf-o'
  },
  {
    value: 'presentation',
    submissionType: 'uploaded',
    validExtensions: '.ppt, .pptx',
    icon: 'fa-file-powerpoint-o'
  },
  {
    value: 'document',
    submissionType: 'uploaded',
    validExtensions: '.doc, .docx',
    icon: 'fa-file-word-o'
  },
  {
    value: 'others',
    submissionType: 'uploaded',
    validExtensions: '',
    icon: 'fa-file'
  },
  {
    value: 'url',
    submissionType: 'remote',
    validExtensions: '',
    icon: 'fa-link'
  }
];
export const COLLECTION_TYPES = {
  collection: 'collections',
  assessment: 'assessments',
  'assessment-external': 'assessments-external',
  'collection-external': 'collections-external'
};
export const COLLECTION_SUB_FORMAT_TYPES = {
  RESOURCE: 'resource',
  QUESTION: 'question'
};
export const MULTIPLE_SELECT_IMAGES = 'hot_spot_image_question';
export const OPEN_ENDED_QUESTION = 'open_ended_question';
export const IMAGE = 'image';
export const FILE = 'fa-file';

export const TEACHER_GRADING_QUESTIONS = ['OE', 'SERP_SOL', 'SERP_DA'];

export const QUESTION_TYPES = {
  fill_in_the_blank_question: 'FIB',
  multiple_choice_question: 'MC',
  true_false_question: 'T/F',
  hot_text_reorder_question: 'HT_RO',
  multiple_answer_question: 'MA',
  hot_spot_image_question: 'HS_IMG',
  hot_spot_text_question: 'HS_TXT',
  hot_text_highlight_question: 'HT_HL',
  open_ended_question: 'OE',
  serp_lang_say_out_loud_question: 'SERP_SOL',
  serp_encoding_assessment_question: 'SERP_EA',
  serp_decoding_assessment_question: 'SERP_DA',
  serp_pick_n_choose_question: 'SERP_PNC',
  serp_sorting_question: 'SERP_SO',
  serp_lang_activities_for_comprehension_question: 'SERP_AFC',
  serp_multi_choice_question: 'SERP_MC',
  serp_silent_reading_question: 'SERP_SR',
  likert_scale_question: 'LS',
  scientific_free_response_question: 'SE_FRQ',
  scientific_fill_in_the_blank_question: 'SE_FIB'
};

export const SUPPORTED_SERP_QUESTION_TYPES = [
  'serp_lang_say_out_loud_question',
  'serp_encoding_assessment_question',
  'serp_decoding_assessment_question',
  'serp_pick_n_choose_question',
  'serp_sorting_question',
  'serp_lang_activities_for_comprehension_question',
  'serp_multi_choice_question',
  'serp_silent_reading_question'
];

export const SERP_QUESTION_TITLES = {
  serp_lang_say_out_loud_question: 'SAY_OUT_LOUD',
  serp_encoding_assessment_question: 'ENCODING_ASSESSMENT',
  serp_decoding_assessment_question: 'DECODING_ASSESSMENT',
  serp_pick_n_choose_question: 'PICK_AND_CHOOSE',
  serp_sorting_question: 'SORTING',
  serp_lang_activities_for_comprehension_question: 'COMPREHENSION',
  serp_lang_identify_digraph_question: 'UNDERLINE',
  serp_words_per_minute_question: 'WORDS_PER_MINUTE',
  serp_silent_reading_question: 'SILENT_READING',
  serp_phrase_cued_reading_question: 'READING_QUESTION',
  serp_lang_identify_base_word_question: 'BASE_WORD',
  serp_lang_vowel_teams_question: 'VOWEL_TEAMS',
  serp_lang_counting_syllables_question: 'COUNTING_SYLLABLES',
  serp_lang_syllable_division_question: 'SYLLABLE_DIVISION',
  serp_classic_question: 'CLASSIC_QUESTION',
  serp_choose_one_question: 'CHOOSE_ONE_QUESTION',
  serp_multi_choice_question: 'SERP_MULTI_CHOICE'
};

export const ATTEMP_STATUS = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  SKIPPED: 'skipped',
  ATTEMPTED: 'attempted'
};

export const FEEDBACK_CONTENT_TYPES = {
  assessment: 'assessments',
  collection: 'collections',
  offlineActivitiy: 'offlineActivities',
  question: 'questions',
  resource: 'resources',
  offlineActivities: 'offline-activity',
  'assessment-external': 'externalAssessments',
  'collection-external': 'externalCollections'
};

export const USER_ROLE = {
  TEACHER: 1,
  STUDENT: 2
};

export const FEEDBACK_TYPES = {
  QUANTITATIVE: 1,
  QUALITATIVE: 2,
  BOTH: 3
};

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  GUARDIAN: 'guardian'
};

export const NOTIFICATION_TYPE = {
  TEACHER_SUGGESTION: 'teacher.suggestion',
  TEACHER_OVERRIDE: 'teacher.override',
  TEACHER_GRADING_COMPLETE: 'teacher.grading.complete'
};

export const SUGGESTION_TYPE = {
  CA_TEACHER: 'ca.teacher',
  PROFICIENY_TEACHER: 'proficiency.teacher'
};

export const SUGGESTION_SCOPE = {
  CLASS_ACTIVITY: 'class-activity',
  COURSE_MAP: 'course-map',
  PROFICIENCY: 'proficiency',
  DAILY_CLASS_ACTIVITY: 'dca'
};

export const IMAGE_EXTENSIONS = [
  'jpeg', 'jpg', 'png', 'gif'
];

export const DOCUMENT_EXTENSIONS = [
  'doc', 'docx'
];

export const PRESENTATION_EXTENSIONS = [
  'ppt', 'pptx'
];

export const FILE_EXTENSION = {
  IMAGE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  PRESENTATION_EXTENSIONS
};

export const MAX_FILE_UPLOAD_SIZE = 3145728;

export const REACTIONS = [
  {
    className: 'reaction-one',
    status: false,
    value: 1
  },
  {
    className: 'reaction-two',
    status: false,
    value: 2
  },
  {
    className: 'reaction-three',
    status: false,
    value: 3
  },
  {
    className: 'reaction-four',
    status: false,
    value: 4
  },
  {
    className: 'reaction-five',
    status: false,
    value: 5
  }
];

export const SCORES = {
  REGULAR: 60,
  GOOD: 70,
  VERY_GOOD: 80,
  EXCELLENT: 90
};

export const SIGNATURE_CONTENTS = {
  SIGNATURE_ASSESMENT: 'signature-assessment',
  SIGNATURE_COLLECTION: 'signature-collection'
};

export const ATTEMPTED_STATUS = {
  COMPLETE: 'complete',
  IN_PROGRESS: 'in-progress'
};

export const EXTERNAL_APP_PACKAGES = {
  GOOGLE_MEET_IOS_APP: 'com.google.apple.apps.meetings',
  GOOGLE_MEET_ANDROID_APP: 'com.google.android.apps.meetings',
  GOOGLE_CHROME_ANDROID_APP: 'com.android.chrome',
  GOOGLE_CHROME_IOS_APP: 'com.apple.chrome',
  SAFARI_APP: 'com.apple.safari'
};

export const API_ERROR_MSG = {
  EMAIL_NOT_VERIFIED_MSG: 'email address still not verified'
};

export const SETTINGS = {
  ON: 'on'
};

export const ROUTE_STATUS = {
  ACCEPTED: 'accepted',
  PENDING: 'pending',
  REJECTED: 'rejected',
  NA: 'na'
};

export const SORTING_TYPES = {
  ascending: 'asc',
  descending: 'desc'
};

export const DIAGNOSTIC_STATE = {
  DIAGNOSTIC_SERVED: 'diagnostic-served',
  DIAGNOSTIC_DONE: 'done',
  DIAGNOSTIC_END: 'diagnostic-end'
};

export const CONTENT_STATUS = {
  COMPLETE: 'complete',
  FAILED: 'failed'
};

export const DIAGNOSTIC_STATUS = {
  0: 'common.not_started',
  1: 'common.not-required',
  2: 'common.in-progress',
  3: 'common.completed',
  4: 'common.not-required',
  5: 'common.online-offline'
};

export const COMPETENCY_MASTERY_SOURCE = [
  {
    source: 'ForceCalculateTrigger',
    label: 'MASTERY_DETERMINED'
  },
  {
    source: 'NWEA',
    label: 'MASTERY_NWEA'
  },
  {
    source: 'Teacher-Asserted',
    label: 'MASTERY_ASSERTION'
  }
];

export const ALTER_RESOURCE_CONTENT_KEYS = {
  0: 'milestoneId',
  1: 'domainCode',
  2: 'topicCode',
  3: 'competencyCode'
};

export const DATA_COLLECTIONS_KEYS = {
  0: 'domains',
  1: 'topics',
  2: 'collections',
};

export const DEPENDENT_LESSON_SUGGESTION_EVENTS = {
  start: 'dep-lesson-suggestion-start',
  served: 'dep-lesson-suggestion-served',
  source: 'dep-lesson-suggestion'
};
