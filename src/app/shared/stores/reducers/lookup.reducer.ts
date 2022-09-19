import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setTenantSettings } from '@shared/stores/actions/lookup.action';

const stateValue = (state) => state;

export const getTenantSettings = () => createSelector(stateValue, (stateItem) => {
  return stateItem.tenantSettings ? stateItem.tenantSettings.data : null;
});

const tenantSettingsReducer = createReducer({},
  on(setTenantSettings, (state, { data }) => setStateData(state, data)));

function setStateData(state, data) {
  return {
    ...state,
    data
  };
}

export function tenantSettingsStateReducer(state, action: Action) {
  return tenantSettingsReducer(state, action);
}
