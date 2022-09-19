import { Component, Input } from '@angular/core';
import { GradeItemDeatilsModel, SubmissionModel } from '@shared/models/offline-activity/offline-activity';

@Component({
  selector: 'offline-activity-content-report',
  templateUrl: './offline-activity-content-report.component.html',
  styleUrls: ['./offline-activity-content-report.component.scss'],
})
export class OfflineActivityContentReportComponent {
  @Input() public offlineActivity: GradeItemDeatilsModel;
  @Input() public submissions: SubmissionModel;
  @Input() public classId: string;
  @Input() public contentId: number;
  @Input() public isTeacherGraded: boolean;
  @Input() public isPreview: boolean;
}
