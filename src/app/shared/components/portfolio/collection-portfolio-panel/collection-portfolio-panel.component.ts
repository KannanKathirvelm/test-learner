import { Component, Input } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { PortfolioModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { ReportService } from '@shared/providers/service/report/report.service';

@Component({
  selector: 'collection-portfolio-panel',
  templateUrl: './collection-portfolio-panel.component.html',
  styleUrls: ['./collection-portfolio-panel.component.scss']
})
export class CollectionPortfolioPanelComponent {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public portfolioData: PortfolioModel;

  /**
   * @function portfolioStatus
   * This Property is used to set the portfolio status
   */
  get portfolioStatus() {
    const status = this.portfolioData.status;
    return status === 'complete' ? 'completed' : status;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private reportService: ReportService, private parseService: ParseService) { }

  /**
   * @function onPreview
   * This method used to preview the student report by guardian
   */
  public onPreview() {
    if (!environment.APP_LEARNER) {
      this.showReport(true);
    }
  }

  /**
   * @function showReport
   * This method used to call report function based on type
   */
  public showReport(isPreview?) {
    const performanceValue = {
      score: this.portfolioData.score,
      timeSpent: this.portfolioData.timespent,
      id: this.portfolioData.id,
      type: this.portfolioData.type,
      sessionId: this.portfolioData.sessionId
    };
    const context = {
      collectionType: this.portfolioData.type,
      collectionId: this.portfolioData.id,
      sessionId: !isPreview ? this.portfolioData.sessionId : null,
      contentSource: !isPreview ? PLAYER_EVENT_SOURCE.DAILY_CLASS : null,
      performance: !isPreview ? performanceValue : null,
      isPreview
    };
    this.reportService.showReport(context);
    if (this.portfolioData.type === CONTENT_TYPES.ASSESSMENT || this.portfolioData.type === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
      this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_GRADE_RANGE_ASSESSMENT);
    } else {
      this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_GRADE_RANGE_COLLECTION);
    }
  }
}
