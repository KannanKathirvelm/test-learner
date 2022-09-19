import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MilestoneModel } from '@shared/models/milestone/milestone';
import { ClassService } from '@shared/providers/service/class/class.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';

@Component({
  selector: 'milestone-modal',
  templateUrl: './milestone-modal.component.html',
  styleUrls: ['./milestone-modal.component.scss'],
})
export class MilestoneModalComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public title: string;
  @Input() public competencyCount: number;
  @Input() public milestoneCount: number;
  @Input() public startCourse: boolean;
  @Input() public isDisabled: boolean;
  public milestones: Array<MilestoneModel>;
  public isLoaded: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private classService: ClassService, private milestoneService: MilestoneService, private modalCtrl: ModalController) { }

  // --------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.fetchMilestone();
  }

  /**
   * @function onClickStart
   * this Method triggers when user click the start
   */
  public onClickStart() {
    this.modalCtrl.dismiss({
      clickStart: true
    });
  }

  /**
   * @function fetchMilestone
   * This method is used to fetch milestones
   */
  public fetchMilestone() {
    this.isLoaded = false;
    const classDetails = this.classService.class;
    const classPerference = classDetails.preference;
    const fwCode = classPerference && classPerference.framework ? classPerference.framework : null;
    if (fwCode) {
      this.milestoneService.fetchMilestone().then((milestones) => {
        this.milestones = milestones;
        this.isLoaded = true;
      });
    } else {
      this.isLoaded = true;
    }
  }

  /**
   * @function onModalClose
   * this Method is used to dismiss the milestone modal
   */
  public onModalClose() {
    this.modalCtrl.dismiss();
  }
}
