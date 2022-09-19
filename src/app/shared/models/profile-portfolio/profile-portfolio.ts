import { TaxonomyKeyModel } from '@shared/models/taxonomy/taxonomy';

export interface ProfilePortfolioModel {
  usageData: Array<PortfolioModel>;
  userId: string;
}

export interface PortfolioModel {
  id: string;
  type: string;
  subType: string;
  title: string;
  learningObjective: string;
  thumbnail: string;
  taxonomy: Array<TaxonomyKeyModel>;
  gutCodes: Array<string>;
  questionCount: number;
  resourceCount: number;
  taskCount: number;
  owner: Array<OwnerModel>;
  efficacy: string;
  engagement: string;
  relevance: string;
  timespent: number;
  score: number;
  maxScore: number;
  sessionId: string;
  contentSource: string;
  activityTimestamp: number;
  updatedAt: number;
  gradingStatus: string;
  status: string;
  isCollection?: boolean;
  isExternalCollection?: boolean;
  isAssessment?: boolean;
  isExternalAssessment?: boolean;
  isOfflineActivity?: boolean;
  contentType?: string;
  contentTypeName?: string;
}

export interface ProfileModel {
  about: string;
  birthDate: string;
  country: string;
  countryId: string;
  course: string;
  createdAt: string;
  email: string;
  firstName: string;
  followers: number;
  followings: number;
  gender: string;
  id: string;
  isFollowing: boolean;
  lastName: string;
  loginType: string;
  metadata: string;
  parentUserId: string;
  referenceId: string;
  rosterGlobalUserid: string;
  rosterId: string;
  school: string;
  schoolDistrict: string;
  schoolDistrictId: string;
  schoolId: string;
  state: string;
  stateId: string;
  thumbnail: string;
  updatedAt: string;
  userCategory: string;
  username: string;
  deletionTriggerDate: Date;
  info: any;
  enableForcePasswordChange: boolean;
}

export interface PortfolioActivities {
  content: Array<PortfolioModel>;
  contentType?: string;
  contentTypeName?: string;
  isAssessment: boolean;
  isCollection: boolean;
  isOfflineActivity: boolean;
}

export interface OwnerModel {
  id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  thumbnail: string;
}

export interface UniversalUserModel {
  id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  thumbnail: string;
  tenantName: string;
  email: string;
  status: string;
  isSelected?: boolean;
}

export interface RoleModel {
  id: number;
  name: string;
}

export interface RoleModel {
  id: number;
  name: string;
}

export interface GuardianProfileModel {
  firstName: string;
  id: string;
  lastName: string;
  relationId: number;
  relationType: string;
  status: boolean;
  thumbnail: string;
  username: string;
  inviteStatus: string;
  invitedBy: string;
}
