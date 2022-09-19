import { classMembersStateReducer } from '@shared/stores/reducers/class-members.reducer';
import { classStateReducer } from '@shared/stores/reducers/class.reducer';
import { facetsCompetencyMatrixStateReducer } from '@shared/stores/reducers/competency.reducer';
import { featuredCourseStateReducer } from '@shared/stores/reducers/course.reducer';
import { competencyLearningContentsStateReducer, domainLearningContentsStateReducer, milestoneDetailsStateReducer, topicLearningContentsStateReducer } from '@shared/stores/reducers/gps-milestone-reducer';
import { tenantSettingsStateReducer } from '@shared/stores/reducers/lookup.reducer';
import { milestonesLearningContentsStateReducer, milestonesRoutesStateReducer } from '@shared/stores/reducers/milestone-routes.reducer';
import {
  lessonStateReducer,
  milestoneStateReducer,
  skippedContentStateReducer
} from '@shared/stores/reducers/milestone.reducer';
import { taxonomyGradesStateReducer } from '@shared/stores/reducers/taxonomy.reducer';
import { tourDetailsStateReducer } from '@shared/stores/reducers/tour.reducer';
import {
  unitLessonStateReducer,
  unitStateReducer
} from '@shared/stores/reducers/unit.reducer';

export const reducers = {
  milestonesRoutes: milestonesRoutesStateReducer,
  milestoneLearningContents: milestonesLearningContentsStateReducer,
  domainLearningContents: domainLearningContentsStateReducer,
  topicLearningContents: topicLearningContentsStateReducer,
  competencyLearningContents: competencyLearningContentsStateReducer,
  milestoneDetails: milestoneDetailsStateReducer,
  facetsCompetencyMatrix: facetsCompetencyMatrixStateReducer,
  milestone: milestoneStateReducer,
  lesson: lessonStateReducer,
  skippedContents: skippedContentStateReducer,
  taxonomyGrades: taxonomyGradesStateReducer,
  tenantSettings: tenantSettingsStateReducer,
  tourDetails: tourDetailsStateReducer,
  class: classStateReducer,
  unit: unitStateReducer,
  unitLesson: unitLessonStateReducer,
  classMembers: classMembersStateReducer,
  featuredCourse: featuredCourseStateReducer
};
