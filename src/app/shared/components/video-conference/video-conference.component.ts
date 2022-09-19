import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalService } from '@shared/providers/service/modal.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';

@Component({
  selector: 'app-video-conference',
  templateUrl: './video-conference.component.html',
  styleUrls: ['./video-conference.component.scss'],
})
export class VideoConferenceComponent {

  // -------------------------------------------------------------------------
  // Properties

  public context: { title: string, startDate: Date, endDate: Date, meetingLink: string };

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private navParams: NavParams,
    private utilsService: UtilsService
  ) {
    const paramsData = this.navParams.data;
    this.context = {
      title: paramsData.title,
      startDate: paramsData.startDate,
      endDate: paramsData.endDate,
      meetingLink: paramsData.meetingLink
    };
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function closeAlert
   * This method is used to close alert
   */
  public closeAlert(params?) {
    this.modalService.dismiss(params);
  }

  /**
   * @function joinMetting
   * This method is used to join metting
   */
  public joinMetting() {
    this.closeAlert({ join: true });
  }

  /**
   * @function onCopy
   * This method is used to copy metting
   */
  public onCopy() {
    this.utilsService.copyToClipBoard(this.context.meetingLink);
  }
}
