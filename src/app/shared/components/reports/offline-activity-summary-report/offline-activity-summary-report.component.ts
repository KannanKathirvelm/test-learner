import { Component, Input } from '@angular/core';
import { GradeItemDeatilsModel } from '@shared/models/offline-activity/offline-activity';

@Component({
  selector: 'offline-activity-summary-report',
  templateUrl: './offline-activity-summary-report.component.html',
  styleUrls: ['./offline-activity-summary-report.component.scss'],
})

export class OfflineActivitySummaryReportComponent {
  @Input() public offlineActivity: GradeItemDeatilsModel;
  @Input() public performance: {
    taskCount: number,
    timespent: number,
    completedTask: number,
    score: number
  };
}
