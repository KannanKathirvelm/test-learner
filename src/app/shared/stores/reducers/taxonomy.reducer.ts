import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setTaxonomyGrades } from '@shared/stores/actions/taxonomy.action';

const stateValue = (state) => state;

export const getTaxonomyGradesByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.taxonomyGrades ? stateItem.taxonomyGrades[classId] : null;
});

const taxonomyGradesReducer = createReducer({},
  on(setTaxonomyGrades, (state, { key, data }) => setStateData(state, key, data)));

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function taxonomyGradesStateReducer(state, action: Action) {
  return taxonomyGradesReducer(state, action);
}
