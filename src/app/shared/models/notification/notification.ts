export interface NotificationListModel {
  boundary: number;
  moreItemsRemaining: boolean;
  notifications: Array<NotificationModel>;
}

export interface NotificationModel {
  ctxCaId: number;
  ctxClassCode: string;
  ctxClassId: string;
  ctxCollectionId: string;
  ctxCourseId: string;
  ctxLessonId: string;
  ctxPathId: number;
  ctxPathType: string;
  ctxSource: string;
  ctxTxCode: string;
  ctxTxCodeType: string;
  ctxUnitId: string;
  currentItemId: string;
  currentItemTitle: string;
  currentItemType: string;
  id: number;
  milestoneId: string;
  notificationType: string;
  updatedAt: number;
  isSuggestion ?: boolean;
  isOverride ?: boolean;
  isGrade ?: boolean;
}
