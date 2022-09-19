import { createAction, props } from '@ngrx/store';
import { UnitSummaryModel } from '@shared/models/course-map/course-map';
import { UnitLessonSummaryModel } from '@shared/models/lesson/lesson';
export const setUnit = createAction('[Unit] SetUnit', props<{ key: string; data: Array<UnitSummaryModel> }>());
export const setUnitLesson = createAction('[Unit Lesson] SetUnitLesson', props<{ key: string; data: Array<UnitLessonSummaryModel> }>());
