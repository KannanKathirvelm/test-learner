import { Component, Input, OnInit } from '@angular/core';
import { ATTEMP_STATUS } from '@shared/constants/helper-constants';
import { PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';

@Component({
  selector: 'assessment-summary-report',
  templateUrl: './assessment-summary-report.component.html',
  styleUrls: ['./assessment-summary-report.component.scss'],
})
export class AssessmentSummaryReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public performance: PortfolioPerformanceSummaryModel;
  @Input() public isAssessment: boolean;
  @Input() public showTapMsg: boolean;
  public correctAnswersCount: number;
  public incorrectAnswerCount: number;

  // -------------------------------------------------------------------------
  // EVENTS
  public ngOnInit() {
    if (this.performance.questions) {
      const correctAnswers = this.performance.questions.filter((question) => {
        return question.answerStatus === ATTEMP_STATUS.CORRECT;
      });
      const incorrectAnswers = this.performance.questions.filter((question) => {
        return question.answerStatus === ATTEMP_STATUS.INCORRECT;
      });
      this.correctAnswersCount = correctAnswers.length;
      this.incorrectAnswerCount = incorrectAnswers.length;
    }
  }
}
