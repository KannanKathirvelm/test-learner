import { Component, Input, OnInit } from '@angular/core';
import { ClassModel } from '@app/shared/models/class/class';
import { CurrentLocation } from '@app/shared/models/competency/competency';
import { MilestoneModel } from '@app/shared/models/milestone/milestone';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ModalService } from '@app/shared/providers/service/modal.service';

@Component({
  selector: 'app-lesson-list-pullup',
  templateUrl: './lesson-list-pullup.component.html',
  styleUrls: ['./lesson-list-pullup.component.scss'],
})
export class LessonListPullupComponent implements OnInit {

  @Input() public milestones: Array<MilestoneModel>;
  @Input() public class: ClassModel;
  @Input() public isPublicClass: boolean;
  @Input() public tenantSettings: TenantSettingsModel;
  @Input() public currentLocation: CurrentLocation;
  @Input() public totalLessonsCount: number;
  @Input() public classTitle: string;
  @Input() public milestoneCount: number;
  @Input() public computedEtlTime: number;
  @Input() public isDisabled: boolean;
  public isToggleRescopedInfo = false;
  public isPremiumClass: boolean;
  public competencyCount: number;

  constructor(
    private modalService: ModalService
  ) { }

  public ngOnInit() {
    this.isPremiumClass = this.class.isPremiumClass;
  }

  // --------------------------------------------------------------------------------------
  // Actions

  public onClose() {
    this.modalService.dismiss();
  }

  /**
   * @function onPlayContent
   * This method used to dismiss onplay
   */
  public onPlayContent() {
    this.modalService.dismiss('onPlay');
  }
}
