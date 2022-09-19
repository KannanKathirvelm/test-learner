export interface LearningToolsModel {
  clientId: string;
  description: string;
  id: number;
  learningToolProviderId: number;
  name: string;
  tenantId: string;
  toolCategory: string;
  toolConfig: LearningToolConfigModel;
  toolMetrics: any;
  toolType: string;
}

export interface LearningToolConfigModel {
  defaultLaunchContainer: string;
  deploymentId: string;
  initateLoginUrl: string;
  keysetUrl: string;
  ltiVersion: string;
  publicKeyType: string;
  redirectUris: Array<string>;
  toolUrl: string;
}
