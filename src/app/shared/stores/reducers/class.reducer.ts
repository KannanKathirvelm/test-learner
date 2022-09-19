import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setClass } from '@shared/stores/actions/class.action';

const stateValue = (state) => state;

export const getClass = () => createSelector(stateValue, (stateItem) => {
  return stateItem.class ? stateItem.class : null;
});

const classReducer = createReducer({},
  on(setClass, (state, { data }) => setStateData(state, data)));

function setStateData(state, data) {
  return {
    ...state,
    data
  };
}

export function classStateReducer(state, action: Action) {
  return classReducer(state, action);
}
