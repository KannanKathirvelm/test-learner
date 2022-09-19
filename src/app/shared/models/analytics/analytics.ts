export interface CollectionSessionModel {
  eventTime: string;
  sequence: number;
  sessionId: string;
}
export interface AnalyticEventsModel {
  eventName: string;
  sessionId: string;
  context?: Array<ContextModel>;
  userId?: string;
  appVersion?: string;
  deviceInfo?: Array<DeviceInfoModel>;
}

export interface ContextModel {
  pageName?: string;
  startTime?: number;
  endTime?: number;
  classId: string;
  collectionId: string;
  collectionTitle?: string;
  collectionType: string;
  taxonomy?: string;
  contextSource?: string;
  notificationType?: string;
  context?: string;
  pathId?: string;
  pathType?: string;
  gradeLevel?: string;
  accepted?: boolean;
  skipped?: boolean;
  activityTitle?: string;
  contentType?: string;
}

export interface LocationModel {
  city: string;
  country: string;
  countryCode: string;
  isp: string;
  lat: number;
  lon: number;
  org: string;
  query: string;
  region: string;
  regionName: string;
  timezone: string;
  pin: string;
}

export interface DeviceInfoModel {
  deviceId: string;
  deviceName: string;
  deviceVersion: string;
  devicePlathform: string;
}
