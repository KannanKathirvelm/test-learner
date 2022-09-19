import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CLASS_SKYLINE_INITIAL_DESTINATION } from '@shared/constants/helper-constants';
import { TaxonomyGrades } from '@shared/models/taxonomy/taxonomy';

@Component({
  selector: 'milestone-info',
  templateUrl: './milestone-info.component.html',
  styleUrls: ['./milestone-info.component.scss'],
})
export class MilestoneInfoComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public classTitle: string;
  @Input() public destination: string;
  @Input() public currentGrade: TaxonomyGrades;
  @Input() public showPublicClassDiagnostic: boolean;
  @Input() public isIlpInProgress: boolean;
  @Input() public isDisabled: boolean;
  public isShowDiagnosticPlay: boolean;
  public isShowDirections: boolean;
  public isBaseLineInProgress: boolean;
  public isShowCourseMap: boolean;

  constructor(private modalCtrl: ModalController) { }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    if (this.destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections) {
      this.isShowDirections = true;
      this.isShowDiagnosticPlay = false;
    } else if (this.destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay) {
      this.isShowDiagnosticPlay = true;
      this.isShowDirections = false;
    } else if (this.destination === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
      this.isShowCourseMap = true;
      this.isShowDirections = false;
    } else if (this.destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress) {
      if (this.isIlpInProgress) {
        this.isShowDirections = true;
        this.isBaseLineInProgress = false;
      } else {
        this.isBaseLineInProgress = true;
        this.isShowDirections = false;
      }
      this.isShowDiagnosticPlay = false;
    }
  }

  /**
   * @function onShowMilestoneInfoPopUp
   * This method is used to open the milestone info popup
   */
  public async onShowMilestoneInfoPopUp() {
    this.onClose({ isShowMilestoneInfoPopUp: true });
  }

  /**
   * @function onClickStart
   * This method triggers when user click start
   */
  public onClickStart() {
    this.onClose({ clickStart: true });
  }

  /**
   * @function onClickLessonList
   * This method triggers when user click the lesson list
   */
  public onClickLessonList() {
    this.onClose({ isLessonList: true });
  }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose(params?) {
    this.modalCtrl.dismiss(params);
  }

  /**
   * @function onClickDirection
   * This method triggers when user click the direction
   */
  public onClickDirection() {
    this.onClose({ isDirections: true });
  }

  /**
   * @function onDiagnosticPlay
   * This method triggers when user click the diagnostic
   */
  public onDiagnosticPlay() {
    this.onClose({ isDiagnosticPlay: true });
  }
}
