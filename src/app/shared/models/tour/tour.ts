export interface TourModel {
  element: string;
  popover: any;
}

export interface TourMessagesModel {
  key: string;
  value: Array<TourModel>;
}
