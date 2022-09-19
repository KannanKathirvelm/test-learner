import { createAction, props } from '@ngrx/store';
import { FeaturedCourseListModel } from '@shared/models/course/course';
export const setFeaturedCourse = createAction('[FeaturedCourse] SetFeaturedCourse', props<{ data: Array<FeaturedCourseListModel> }>());
