import { createAction, props } from '@ngrx/store';
import { AlternativeLearningContentsModel } from '@shared/models/milestone/milestone';
export const setMilestonesRoutes = createAction('[MilestonesRoutes] SetMilestonesRoutes', props<{ key: string; data: Array<any> }>());
export const setMilestoneLearningContents = createAction('[MilestoneLearningContents] SetMilestoneLearningContents', props<{ key: string; data: Array<AlternativeLearningContentsModel> }>());
