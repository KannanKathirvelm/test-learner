import { Component, Input } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { CONTENT_TYPES } from '@app/shared/constants/helper-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { PortfolioModel } from '@shared/models/portfolio/portfolio';
import { ReportService } from '@shared/providers/service/report/report.service';

@Component({
  selector: 'portfolio-content-card',
  templateUrl: './portfolio-content-card.component.html',
  styleUrls: ['./portfolio-content-card.component.scss'],
})
export class PortfolioContentCardComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public activity: PortfolioModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private reportService: ReportService,
    private parseService: ParseService
  ) {
  }


  /**
   * @function showReport
   * This method used to call report function based on type
   */
  public showReport() {
    const performance = {
      id: this.activity.id,
      score: this.activity.score,
      timeSpent: this.activity.timespent,
      type: this.activity.type,
      sessionId: this.activity.lastSessionId
    };
    const context = {
      collectionType: this.activity.type,
      collectionId: this.activity.id,
      sessionId: this.activity.lastSessionId,
      contentSource: this.activity.contentSource,
      performance
    };
    this.reportService.showReport(context);
    if (this.activity.type === CONTENT_TYPES.ASSESSMENT || this.activity.type === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
      this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_GRADE_RANGE_ASSESSMENT);
    } else {
      this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_GRADE_RANGE_COLLECTION);
    }
  }
}
