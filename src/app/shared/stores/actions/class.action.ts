import { createAction, props } from '@ngrx/store';
import { ClassModel } from '@shared/models/class/class';
export const setClass = createAction(
  '[Class] SetClass',
  props<{ data: Array<ClassModel> }>()
);
