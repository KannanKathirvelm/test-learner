import { createAction, props } from '@ngrx/store';
import { TaxonomyGrades } from '@shared/models/taxonomy/taxonomy';
export const setTaxonomyGrades = createAction(
  '[TaxonomyGrades] SetTaxonomyGrades',
  props<{ key: string; data: Array<TaxonomyGrades> }>()
);
