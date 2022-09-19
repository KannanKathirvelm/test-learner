import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setMilestoneLearningContents, setMilestonesRoutes } from '@shared/stores/actions/milestone-routes.action';

const stateValue = (state) => state;

export const getMilestonesRoutesByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.milestonesRoutes ? stateItem.milestonesRoutes[classId] : null;
});

const milestonesRoutesReducer = createReducer({},
  on(setMilestonesRoutes, (state, { key, data }) => setStateData(state, key, data)));

export const getMilestonesLearningContentsByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.milestoneLearningContents ? stateItem.milestoneLearningContents[classId] : null;
});

const milestonesLearningContentsReducer = createReducer({},
  on(setMilestoneLearningContents, (state, { key, data }) => setStateData(state, key, data)));

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function milestonesRoutesStateReducer(state, action: Action) {
  return milestonesRoutesReducer(state, action);
}

export function milestonesLearningContentsStateReducer(state, action: Action) {
  return milestonesLearningContentsReducer(state, action);
}
