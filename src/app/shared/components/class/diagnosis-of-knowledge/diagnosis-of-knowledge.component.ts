import { Component, HostListener } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { EVENTS } from '@shared/constants/events-constants';
import { ASSESSMENT, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { ClassModel } from '@shared/models/class/class';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { PlayerService } from '@shared/providers/service/player/player.service';

@Component({
  selector: 'diagnosis-of-knowledge',
  templateUrl: './diagnosis-of-knowledge.component.html',
  styleUrls: ['./diagnosis-of-knowledge.component.scss'],
})
export class DiagnosisOfKnowledgeComponent {
  private diagnosticId: string;
  private classId: string;
  public classInfo: ClassModel;
  public isPublicClass: boolean;
  public played: boolean;
  public taxonomySubject: { subject: string };
  private isProgramCourse: boolean;
  private userSelectedUpperBound: number;

  /** Stop hardware back button */
  @HostListener('document:ionBackButton', ['$event'])
  public overrideHardwareBackAction(event) {
    this.onBack();
  }

  constructor(
    private parseService: ParseService,
    public modalController: ModalController,
    private playerService: PlayerService,
    private navParams: NavParams
  ) {
    this.classInfo = this.navParams.get('classInfo');
  }

  /**
   * @function onBack
   * This method will trigger when user clicks on back
   */
  public onBack(params?) {
    this.modalController.dismiss(params);
  }

  /**
   * @function onTakeTest
   * This method will trigger when user clicks on take test
   */
  public onTakeTest() {
    const collectionId = this.diagnosticId;
    const classId = this.classId;
    const source = PLAYER_EVENT_SOURCE.DIAGNOSTIC;
    const collectionType = ASSESSMENT;
    const classInfo = this.classInfo;
    const context = {
      classId,
      collectionType,
      source,
      collectionId,
      isDiagnosticAssessment: true,
      isProgramCourse: this.isProgramCourse,
      userSelectedUpperBound: this.userSelectedUpperBound,
    };
    this.trackTakeDiagnosticEvent();
    this.playerService.openPlayer({ context, classInfo });
    this.played = true;
    this.onBack({ isTakeDiagnostic: true });
  }

  /**
   * @function getDiagnosticEventContext
   * This method is used to get the context for diagnostic event
   */
  private getDiagnosticEventContext() {
    const diagnosticId = this.diagnosticId;
    const source = PLAYER_EVENT_SOURCE.DIAGNOSTIC;
    const collectionType = ASSESSMENT;
    const classInfo = this.classInfo;
    const subject = classInfo.preference ? classInfo.preference.subject : null;
    const framework = classInfo.preference ? classInfo.preference.framework : null;
    return {
      title: classInfo.title,
      classId: classInfo.id,
      courseId: classInfo.course_id,
      courseTitle: classInfo.course_title,
      source,
      collectionType,
      diagnosticId,
      code: classInfo.code,
      isPublic: classInfo.isPublic,
      subject,
      framework
    };
  }

  /**
   * @function trackTakeDiagnosticEvent
   * This method is used to track the take diagnosis event
   */
  private trackTakeDiagnosticEvent() {
    const context = this.getDiagnosticEventContext();
    this.parseService.trackEvent(EVENTS.TAKE_DIAGNOSTIC, context);
  }
}
