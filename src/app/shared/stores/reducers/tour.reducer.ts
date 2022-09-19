import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setTourDetails } from '@shared/stores/actions/tour.action';

const stateValue = (state) => state;

export const getTourMessages = () => createSelector(stateValue, (stateItem) => {
  return stateItem.tourDetails ? stateItem.tourDetails.data : null;
});

export const getTourMessagesByKey = (screenName) => createSelector(stateValue, (stateItem) => {
  if (stateItem.tourDetails && stateItem.tourDetails.data) {
    const screen = stateItem.tourDetails.data.find((steps) => {
      return steps.key === screenName;
    });
    return screen;
  }
  return;
});

const tourDetailsReducer = createReducer({},
  on(setTourDetails, (state, { data }) => setStateData(state, data)));

function setStateData(state, data) {
  return {
    ...state,
    data
  };
}

export function tourDetailsStateReducer(state, action: Action) {
  return tourDetailsReducer(state, action);
}
