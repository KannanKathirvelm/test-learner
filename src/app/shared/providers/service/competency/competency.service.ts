import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { ClassService } from '@shared/providers/service/class/class.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { setSubjectCompetencyMatrix } from '@shared/stores/actions/competency.action';
import { getSubjectCompetencyMatrix } from '@shared/stores/reducers/competency.reducer';
import { cloneObject } from '@shared/utils/global';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable({
  providedIn: 'root'
})
export class CompetencyService {

  // -------------------------------------------------------------------------
  // Properties

  private competencyMatrixStoreSubscription: AnonymousSubscription;

  constructor(
    private sessionService: SessionService,
    private classService: ClassService,
    private storage: Storage,
    private competencyProvider: CompetencyProvider,
    private store: Store
  ) {
  }

  /**
   * @function getClassCompetency
   * This Method is used to get the class competency
   */
  public async getClassCompetency(storageKey): Promise<string> {
    return await this.storage.get(storageKey);
  }

  /**
   * @function computeCompetencyCount
   * This Method is used to store the class competency
   */
  public computeCompetencyCount(completedCount): Promise<number> {
    const userId = this.sessionService.userSession.user_id;
    const classDetails = this.classService.class;
    const classId = classDetails.id;
    const storageKey = `${userId}_${classId}_competency_count`;
    return this.getClassCompetency(storageKey).then((baseCompetencyCount) => {
      if (!baseCompetencyCount) {
        this.setClassCompetency(storageKey, completedCount);
        return completedCount;
      }
      // TODO: Here mastered competency count gets decreased after playing a collection
      if (completedCount >= baseCompetencyCount) {
        return baseCompetencyCount;
      } else {
        this.setClassCompetency(storageKey, completedCount);
        return completedCount;
      }
    });
  }

  /**
   * @function setClassCompetency
   * This Method is used to set the class competency
   */
  public setClassCompetency(storageKey, competencyCount) {
    this.storage.set(storageKey, competencyCount);
  }

  /**
   * @function fetchDomainTopicCompetencyMatrix
   * This Method is used to fetch collection performance
   */
  public fetchDomainTopicCompetencyMatrix(subject, year, month) {
    return this.competencyProvider.fetchDomainTopicCompetencyMatrix(subject, year, month);
  }

  /**
   * @function fetchCompletionStatus
   * This method is used to fetch lesson competency completion status
   */
  public fetchCompletionStatus(params) {
    return this.competencyProvider.fetchCompletionStatus(params);
  }

  /**
   * @function fetchSubjectDomainTopicMetadata
   * This Method is used to fetch collection performance
   */
  public fetchSubjectDomainTopicMetadata(params) {
    return this.competencyProvider.fetchSubjectDomainTopicMetadata(params);
  }

  /**
   * @function fetchUserSubjectCompetencyMatrix
   * Method to fetch the competency matrix for subject subjects
   */
  public fetchUserSubjectCompetencyMatrix(params) {
    return this.competencyProvider.fetchSubjectCompetencyMatrix(params).then((competencyMatrix) => {
      this.store.dispatch(setSubjectCompetencyMatrix({ data: competencyMatrix }));
      return cloneObject(competencyMatrix);
    });
  }

  /**
   * @function getUserSubjectCompetencyMatrix
   * Method to get the subjects competency matrix
   */
  public getUserSubjectCompetencyMatrix() {
    return new Promise((resolve, reject) => {
      this.competencyMatrixStoreSubscription = this.store.select(getSubjectCompetencyMatrix())
        .subscribe((competencyMatrix) => {
          resolve(cloneObject(competencyMatrix.data));
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @function unSubscribeEvent
   * This Method is used to un subscribe the store event
   */
  public unSubscribeEvent() {
    if (this.competencyMatrixStoreSubscription) {
      this.competencyMatrixStoreSubscription.unsubscribe();
    }
  }
}
