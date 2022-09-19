import { Injectable } from '@angular/core';
import { PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { MilestoneLocationModel, ResourceLocation } from '@shared/models/location/location';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { getDefaultImageXS } from '@shared/utils/global';

@Injectable({
  providedIn: 'root'
})

export class LocationProvider {

  // -------------------------------------------------------------------------
  // Properties

  private locationNamespace = 'api/nucleus-insights/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService, private sessionService: SessionService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getCurrentLocation
   * Method to get current location of user
   */
  public getCurrentLocation(classId: string, courseId: string, fwCode?: string) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.locationNamespace}/class/${classId}/user/${userId}/current/location`;
    const params = { courseId };
    if (fwCode) {
      Object.assign(params, {
        fwCode
      });
    }
    return this.httpService.get<MilestoneLocationModel>(endpoint, params).then((res) => {
      const response = res.data.content ? res.data.content[0] : null;
      if (response) {
        const collectionType = response.collection_type ? response.collection_type : response.collectionType;
        const thumbnail = getDefaultImageXS(collectionType);
        const location: MilestoneLocationModel = {
          classId: response.classId,
          collectionId: response.collectionId || response.assessmentId,
          collectionTitle: response.collectionTitle || response.assessmentTitle,
          collectionType,
          courseId: response.courseId,
          lessonId: response.lessonId,
          milestoneId: response.milestoneId,
          pathId: response.pathId || 0,
          pathType: response.pathType || null,
          ctxPathId: response.ctxPathId || 0,
          ctxPathType: response.ctxPathType || null,
          status: response.status,
          unitId: response.unitId,
          thumbnail
        };
        return location;
      }
      return response;
    });
  }

  /**
   * @function getCurrentResourceLocation
   * Method to get current resource location of the user
   */
  public getCurrentResourceLocation(collectionId, context) {
    const userId = this.sessionService.userSession.user_id;
    const source = context.source === PLAYER_EVENT_SOURCE.DAILY_CLASS ? PLAYER_EVENT_SOURCE.CA : context.source;
    const endpoint = `${this.locationNamespace}/user/${userId}/collection/${collectionId}/current/location`;
    const params = {
      classId: context.classId,
      courseId: context.courseId,
      unitId: context.unitId,
      lessonId: context.lessonId,
      dcaContentId: context.caContentId,
      source,
      pathId: context.pathId,
      pathType: context.pathType,
    };
    return this.httpService.get<ResourceLocation>(endpoint, params).then((res) => {
      const response = res.data.content ? res.data.content[0] : null;
      if (response) {
        const location: ResourceLocation = {
          collectionId: response.collectionId,
          collectionStatus: response.collectionStatus,
          resourceId: response.resourceId,
          resourceStatus: response.resourceStatus,
          sessionId: response.sessionId,
        };
        return location;
      }
      return response;
    });
  }
}
