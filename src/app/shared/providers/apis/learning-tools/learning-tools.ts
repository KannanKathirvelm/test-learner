import { Injectable } from '@angular/core';
import { LearningToolConfigModel, LearningToolsModel } from '@shared/models/learning-tools/learning-tools';
import { HttpService } from '@shared/providers/apis/http';

@Injectable({
  providedIn: 'root',
})

export class LearningToolsProvider {

  // -------------------------------------------------------------------------
  // Properties

  private learningToolNamespace = 'api/learning-registry/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getLearningToolInformation
   * This Method is used to get learning tool information
   */
  public getLearningToolInformation(learningToolId) {
    const endpoint = `${this.learningToolNamespace}/learning-tools/${learningToolId}`;
    return this.httpService.get<LearningToolsModel>(endpoint).then((response) => {
      return this.normalizeLearningToolInformation(response.data);
    });
  }

  /**
   * @function normalizeLearningToolInformation
   * This Method is used to normalize learning tool information
   */
  public normalizeLearningToolInformation(payload): LearningToolsModel {
    const learningToolInformation: LearningToolsModel = {
      clientId: payload.clientId,
      description: payload.description,
      id: payload.id,
      learningToolProviderId: payload.learningToolProviderId,
      name: payload.name,
      tenantId: payload.tenantId,
      toolCategory: payload.toolCategory,
      toolConfig: this.normalizeToolConfig(payload.toolConfig),
      toolMetrics: payload.toolMetrics,
      toolType: payload.toolType
    };
    return learningToolInformation;
  }

  /**
   * @function normalizeToolConfig
   * This Method is used to normalize learning tool config
   */
  public normalizeToolConfig(payload): LearningToolConfigModel {
    const toolConfig: LearningToolConfigModel = {
      defaultLaunchContainer: payload.default_launch_container,
      deploymentId: payload.deployment_id,
      initateLoginUrl: payload.initate_login_url,
      keysetUrl: payload.keyset_url,
      ltiVersion: payload.lti_version,
      publicKeyType: payload.public_key_type,
      redirectUris: payload.redirect_uris,
      toolUrl: payload.tool_url
    };
    return toolConfig;
  }
}
