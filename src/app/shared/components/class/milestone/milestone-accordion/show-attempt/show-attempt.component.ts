import { Component, Input } from '@angular/core';
import { ASSESSMENT, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { CollectionModel } from '@shared/models/collection/collection';
import { PortfolioActivityAttempt } from '@shared/models/portfolio/portfolio';
import { ReportService } from '@shared/providers/service/report/report.service';

@Component({
  selector: 'show-attempt',
  templateUrl: './show-attempt.component.html',
  styleUrls: ['./show-attempt.component.scss'],
})

export class ShowAttemptComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activityAttempts: Array<PortfolioActivityAttempt>;
  @Input() public isCurrentSuggestedCollection: boolean;
  @Input() public isNextSuggestedCollection: boolean;
  @Input() public isNextTeacherSuggested: boolean;
  @Input() public isNextSystemSuggested: boolean;
  @Input() public isCurrentTeacherSuggested: boolean;
  @Input() public isCurrentSystemSuggested: boolean;
  @Input() public isLastCollectionInMilestone: boolean;
  @Input() public collection: CollectionModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private reportService: ReportService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function showReport
   * This method is used to show report based on type
   */
  public showAttemptReport(event, attempt) {
    event.stopPropagation();
    const context = {
      collectionType: attempt.type,
      collectionId: attempt.id,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: attempt.type === ASSESSMENT ? attempt.classId : null,
      courseId: attempt.courseId,
      unitId: attempt.unitId,
      lessonId: attempt.lessonId,
      pathId: attempt.pathId,
      sessionId: attempt.sessionId,
      performance: {
        attemptStatus: attempt.status,
        collectionId: attempt.id,
        completedCount: null,
        gradingStatus: attempt.gradingStatus,
        reaction: attempt.reaction,
        score: attempt.score,
        scoreInPercentage: attempt.score,
        timeSpent: attempt.timespent,
        totalCount: null,
        views: null,
        sessionId: attempt.sessionId
      }
    };
    this.reportService.showReport(context);
  }
}
