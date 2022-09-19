import { Injectable } from '@angular/core';
import { ERROR_TYPES } from '@app/shared/constants/helper-constants';
import { cloneObject } from '@app/shared/utils/global';
import { Store } from '@ngrx/store';
import { Unit0Provider } from '@shared/providers/apis/unit0/unit0';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { setMilestoneLesson } from '@shared/stores/actions/milestone.action';


@Injectable({
  providedIn: 'root'
})
export class Unit0Service {

  constructor(private unit0Provider: Unit0Provider, private store: Store, private parseService: ParseService, private performanceService: PerformanceService) { }

  /**
   * @function fetchUnit0Contents
   * This Method is used to fetch unit0 contents
   */
  public fetchUnit0Contents(classId: string, courseId: string, fwCode: string) {
    return this.unit0Provider.getUnit0List(classId, courseId).then((unit0Content: any) => {
      if (unit0Content && unit0Content.length) {
        unit0Content.forEach((milestone) => {
          const lessons = cloneObject(milestone.lessons);
          if (lessons) {
            const milestoneId: string = milestone.milestoneId;
            this.store.dispatch(setMilestoneLesson({ key: milestoneId, data: lessons }));
          }
        });
        this.performanceService.fetchMilestonePerformance(classId, courseId, fwCode, unit0Content);
        return unit0Content;
      }
    }).catch((error) => {
      this.parseService.trackErrorLog(ERROR_TYPES.FATAL, error);
      return null;
    });
  }
}
