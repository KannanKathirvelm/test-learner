import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ERROR_TYPES, ROUTE_STATUS } from '@shared/constants/helper-constants';
import { Route0Provider } from '@shared/providers/apis/route0/route0';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { setMilestoneLesson } from '@shared/stores/actions/milestone.action';
import { cloneObject } from '@shared/utils/global';

@Injectable({
  providedIn: 'root'
})
export class Route0Service {

  constructor(private store: Store, private parseService: ParseService, private route0Provider: Route0Provider, private performanceService: PerformanceService) { }

  /**
   * @function fetchRoute0Contents
   * This Method is used to fetch route0 contents
   */
  public fetchRoute0Contents(classId: string, courseId: string, fwCode: string) {
    return this.route0Provider.getRoute0List(classId, courseId).then((route0ContentResponse) => {
      const route0Contents = route0ContentResponse ? route0ContentResponse.route0Content : [];
      if (route0Contents && route0Contents.milestones) {
        const milestones = route0Contents.milestones;
        if (milestones.length) {
          milestones.forEach((milestone) => {
            const lessons = cloneObject(milestone.lessons);
            if (lessons) {
              const milestoneId: string = milestone.milestoneId;
              this.store.dispatch(setMilestoneLesson({ key: milestoneId, data: lessons }));
            }
          });
          this.performanceService.fetchMilestonePerformance(classId, courseId, fwCode, milestones);
        }
        return route0ContentResponse;
      }
    }).catch((error) => {
      this.parseService.trackErrorLog(ERROR_TYPES.FATAL, error);
      return null;
    });
  }

  /**
   * @function fetchRoute0Suggestions
   * This Method is used to fetch route0 suggestions
   */
  public fetchRoute0Suggestions(classId, courseId, unitId, lessonId, collections) {
    return this.route0Provider.fetchRoute0Suggestions(classId, courseId, unitId, lessonId).then((response) => {
      this.handleAlternatePaths(response, collections);
    });
  }

  /**
   * @function handleAlternatePaths
   * This Method is used to handle alternate paths
   */
  public handleAlternatePaths(payload, collections) {
    const teacherSuggestions = payload.alternatePaths.teacherSuggestions;
    const systemSuggestions = payload.alternatePaths.systemSuggestions;
    const suggestions = teacherSuggestions.concat(systemSuggestions);
    suggestions.forEach((suggestion) => {
      const collectionIndex = collections.findIndex((collection) => {
        return collection.id === suggestion.collectionId;
      });
      collections.splice(collectionIndex + 1, 0, suggestion);
    });
    return collections;
  }

  /**
   * @function updateRoute0Status
   * This Method is used to update route0 status
   */
  public updateRoute0Status(classId: string, courseId: string, status) {
    return this.route0Provider.updateRoute0Status(classId, courseId, status);
  }

  /**
   * @function checkAndRetrieveRoute0ByStatus
   * This method is used to check and update status of route0 if its not accepted
   */
  public checkAndRetrieveRoute0ByStatus(classId, courseId, fwCode, status) {
    return new Promise((resolve, reject) => {
      this.fetchRoute0Contents(classId, courseId, fwCode).then((route0ContentResponse) => {
        const route0Status = route0ContentResponse.status;
        if (route0Status === ROUTE_STATUS.PENDING || route0Status === ROUTE_STATUS.REJECTED) {
          this.updateRoute0Status(classId, courseId, status)
            .then(() => {
              this.fetchRoute0Contents(classId, courseId, fwCode).then((route0ContentResult) => {
                resolve(route0ContentResult);
              });
            });
        } else {
          resolve(route0ContentResponse);
        }
      });
    });
  }
}
