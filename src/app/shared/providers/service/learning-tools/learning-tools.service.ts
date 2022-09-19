import { Injectable } from '@angular/core';
import { LearningToolsProvider } from '@shared/providers/apis/learning-tools/learning-tools';

@Injectable({
  providedIn: 'root'
})
export class LearningToolsService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private learningToolsProvider: LearningToolsProvider
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getLearningToolInformation
   * This Method is used to get learning tool information
   */
  public getLearningToolInformation(learningToolId) {
    return this.learningToolsProvider.getLearningToolInformation(learningToolId);
  }
}
