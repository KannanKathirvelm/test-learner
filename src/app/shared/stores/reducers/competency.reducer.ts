import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setSubjectCompetencyMatrix } from '@shared/stores/actions/competency.action';

const stateValue = (state) => state;

export const getSubjectCompetencyMatrix = () => createSelector(stateValue, (stateItem) => {
  return stateItem.facetsCompetencyMatrix ? stateItem.facetsCompetencyMatrix : null;
});

const subjectCompetencyMatrixReducer = createReducer({},
  on(setSubjectCompetencyMatrix, (state, { data }) => setStateData(state, data)));

function setStateData(state, data) {
  return {
    ...state,
    data
  };
}

export function facetsCompetencyMatrixStateReducer(state, action: Action) {
  return subjectCompetencyMatrixReducer(state, action);
}
