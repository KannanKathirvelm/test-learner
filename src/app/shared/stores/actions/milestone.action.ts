import { createAction, props } from '@ngrx/store';
import { MilestoneModel, SkippedContents } from '@shared/models/milestone/milestone';
export const setMilestone = createAction('[Milestone] SetMilestone', props<{ key: string; data: Array<MilestoneModel> }>());
export const setMilestoneLesson = createAction('[Milestone Lesson] SetMilestoneLesson', props<{ key: string; data: Array<any> }>());
export const setSkippedContent = createAction('[SkippedContent] SetSkippedContent', props<{key: string; data: SkippedContents }>());
