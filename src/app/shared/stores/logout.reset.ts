import { Action } from '@ngrx/store';

export class ActionTypes {
  public static LOGOUT = '[App] logout';
}

export class Logout implements Action {
  public readonly type = ActionTypes.LOGOUT;
}

export function clearState(reducer) {
  return function(state, action) {
    if (action.type === ActionTypes.LOGOUT) {
      state = undefined;
    }
    return reducer(state, action);
  };
}
