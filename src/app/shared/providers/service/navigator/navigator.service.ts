import { Injectable } from '@angular/core';
import { SubjectCompetencyMatrixModel } from '@shared/models/competency/competency';
import { cloneObject } from '@shared/utils/global';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigatorService {

  // -------------------------------------------------------------------------
  // Properties

  private userSelectedSubject: BehaviorSubject<SubjectCompetencyMatrixModel>;
  private destinationClassSubject: BehaviorSubject<string>;

  constructor() {
    this.userSelectedSubject = new BehaviorSubject<SubjectCompetencyMatrixModel>(null);
    this.destinationClassSubject = new BehaviorSubject<string>(null);
  }

  get getDestinationClass(): string {
    return this.destinationClassSubject ? this.destinationClassSubject.value : null;
  }

  get getUserSelectedSubject() {
    return this.userSelectedSubject ? cloneObject(this.userSelectedSubject.value) : null;
  }

  /**
   * @function setDestinationClass
   * Method is set the destination
   */
  public setDestinationClass(classId) {
    this.destinationClassSubject.next(classId);
  }

  /**
   * @function setUserSelectedSubject
   * This Method is used to set the selected location
   */
  public setUserSelectedSubject(location) {
    this.userSelectedSubject.next(location);
  }
}
