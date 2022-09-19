import { Component, Input } from '@angular/core';
import { PLAYER_EVENT_SOURCE } from '@app/shared/constants/helper-constants';
import { LessonModel } from '@app/shared/models/lesson/lesson';
import { ReportService } from '@app/shared/providers/service/report/report.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-milestone-lesson-report',
  templateUrl: './milestone-lesson-report.component.html',
  styleUrls: ['./milestone-lesson-report.component.scss'],
})
export class MilestoneLessonReportComponent {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public lessonInfo: LessonModel;
  @Input() public classId: string;
  @Input() public courseId: string;
  @Input() public unitId: string;
  @Input() public lessonId: string;

  constructor(
    private modalCtrl: ModalController,
    private reportService: ReportService
  ) {}
  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function closeReport
   * Method to close the milestone performance report
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function showCollectionReport
   * This method is used to show collection report
   */
  public showCollectionReport(event, collection) {
    event.stopPropagation();
    const context = {
      collectionType: collection.format,
      collectionId: collection.id,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: this.classId,
      courseId: this.courseId,
      unitId: this.unitId,
      lessonId: this.lessonId,
      performance: collection.performance,
    };
    this.reportService.showReport(context);
  }
}
