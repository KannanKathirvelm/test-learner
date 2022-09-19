import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setClassMembers } from '@shared/stores/actions/class-members.action';

const stateValue = (state) => state;

export const getClassMembersByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.classMembers ? stateItem.classMembers[classId] : null;
});

const classMembersReducer = createReducer({},
  on(setClassMembers, (state, { key, data }) => setStateData(state, key, data)));

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function classMembersStateReducer(state, action: Action) {
  return classMembersReducer(state, action);
}
