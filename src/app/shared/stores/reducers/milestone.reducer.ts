import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setMilestone, setMilestoneLesson, setSkippedContent } from '@shared/stores/actions/milestone.action';

const stateValue = (state) => state;

export const getMilestoneByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.milestone ? stateItem.milestone[classId] : null;
});

export const getLessonByMilestoneId = (milestoneId) => createSelector(stateValue, (stateItem) => {
  return stateItem.lesson ? stateItem.lesson[milestoneId] : null;
});

export const getSkippedContentsByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.skippedContents ? stateItem.skippedContents[classId] : null;
});

const milestoneReducer = createReducer({},
  on(setMilestone, (state, { key, data }) => setStateData(state, key, data)));

const lessonReducer = createReducer({},
  on(setMilestoneLesson, (state, { key, data }) => setStateData(state, key, data)));

const skippedContentReducer = createReducer({},
  on(setSkippedContent, (state, { key, data }) => setStateData(state, key, data)));

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function milestoneStateReducer(state, action: Action) {
  return milestoneReducer(state, action);
}

export function lessonStateReducer(state, action: Action) {
  return lessonReducer(state, action);
}

export function skippedContentStateReducer(state, action: Action) {
  return skippedContentReducer(state, action);
}
