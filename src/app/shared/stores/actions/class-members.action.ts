import { createAction, props } from '@ngrx/store';
import { ClassMembersGrade } from '@shared/models/class/class';
export const setClassMembers = createAction(
  '[ClassMembers] SetClassMembers',
  props<{ key: string; data: Array<ClassMembersGrade> }>()
);
