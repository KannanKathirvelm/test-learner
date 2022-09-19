import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setUnit, setUnitLesson } from '@shared/stores/actions/unit.action';

const stateValue = (state) => state;

export const getUnitByCourseId = (courseId) => createSelector(stateValue, (stateItem) => {
  return stateItem.unit ? stateItem.unit[courseId] : null;
});

export const getLessonByUnitId = (unitId) => createSelector(stateValue, (stateItem) => {
  return stateItem.unitLesson ? stateItem.unitLesson[unitId] : null;
});

const unitReducer = createReducer({},
  on(setUnit, (state, { key, data }) => setStateData(state, key, data)));

const lessonReducer = createReducer({},
  on(setUnitLesson, (state, { key, data }) => setStateData(state, key, data)));

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function unitStateReducer(state, action: Action) {
  return unitReducer(state, action);
}

export function unitLessonStateReducer(state, action: Action) {
  return lessonReducer(state, action);
}
