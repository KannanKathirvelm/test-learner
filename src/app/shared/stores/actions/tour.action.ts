import { createAction, props } from '@ngrx/store';
import { TourMessagesModel } from '@shared/models/tour/tour';
export const setTourDetails = createAction(
  '[TourDetails] SetTourDetails',
  props<{ data: Array<TourMessagesModel>; }>()
);
