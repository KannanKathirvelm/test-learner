import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setFeaturedCourse } from '@shared/stores/actions/course.action';

const stateValue = (state) => state;

export const getFeaturedCourse = () => createSelector(stateValue, (stateItem) => {
  return stateItem.featuredCourse ? stateItem.featuredCourse : null;
});

const featuredCourseReducer = createReducer({},
  on(setFeaturedCourse, (state, { data }) => setStateData(state, data)));

function setStateData(state, data) {
  return {
    ...state,
    data
  };
}

export function featuredCourseStateReducer(state, action: Action) {
  return featuredCourseReducer(state, action);
}
