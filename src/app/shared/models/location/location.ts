export interface MilestoneLocationModel {
  classId: string;
  collectionId: string;
  collectionTitle: string;
  collectionType: string;
  courseId: string;
  lessonId: string;
  milestoneId: string;
  pathId?: number;
  pathType?: string;
  status?: string;
  unitId: string;
  thumbnail?: string;
  ctxPathId?: number;
  ctxPathType?: string;
}

export interface ResourceLocation {
  collectionId: string;
  collectionStatus: string;
  resourceId: string;
  resourceStatus: string;
  sessionId: string;
}
