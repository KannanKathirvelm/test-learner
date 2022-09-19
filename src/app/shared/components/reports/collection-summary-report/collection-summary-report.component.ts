import { Component, Input, OnInit } from '@angular/core';
import { ATTEMP_STATUS } from '@shared/constants/helper-constants';
import { PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';

@Component({
  selector: 'collection-summary-report',
  templateUrl: './collection-summary-report.component.html',
  styleUrls: ['./collection-summary-report.component.scss'],
})
export class CollectionSummaryReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public performance: PortfolioPerformanceSummaryModel;
  @Input() public isCollection: boolean;
  @Input() public showTapMsg: boolean;
  public correctAnswersCount: number;
  public incorrectAnswerCount: number;

  // -------------------------------------------------------------------------
  // EVENTS
  public ngOnInit() {
    if (this.isCollection) {
      const correctAnswers = this.performance.resources.filter((question) => {
        return question.answerStatus === ATTEMP_STATUS.CORRECT;
      });
      const incorrectAnswers = this.performance.resources.filter((question) => {
        return question.answerStatus === ATTEMP_STATUS.INCORRECT;
      });
      this.correctAnswersCount = correctAnswers.length;
      this.incorrectAnswerCount = incorrectAnswers.length;
    }
  }
}
