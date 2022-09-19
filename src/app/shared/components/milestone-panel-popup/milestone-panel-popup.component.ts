import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyGrades } from '@shared/models/taxonomy/taxonomy';
import { TourMessagesModel } from '@shared/models/tour/tour';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { TourService } from '@shared/providers/service/tour.service';
import { scrollToItemInPopup } from '@shared/utils/global';

@Component({
  selector: 'milestone-panel-popup',
  templateUrl: './milestone-panel-popup.component.html',
  styleUrls: ['./milestone-panel-popup.component.scss']
})
export class MilestonePanelPopUpComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public currentGrade: TaxonomyGrades;
  @Input() public gradeList: Array<TaxonomyGrades>;
  @Input() public showGradeListPopUp: boolean;

  constructor(
    private lookupService: LookupService,
    public modalController: ModalController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private tourService: TourService
  ) { }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    setTimeout(() => {
      this.startTour();
    }, 800);
  }

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function startTour
   * This method is used to start tour
   */
  public async startTour() {
    const navigatorScreenTourSteps: TourMessagesModel = await this.lookupService.fetchTourMessages('UPDATE_LEVE_SCREEN_TOUR_STEPS');
    if (navigatorScreenTourSteps) {
      this.tourService.start('update-my-level-tour', navigatorScreenTourSteps.value);
    }
  }

  /**
   * @function onSkipDiagnostic
   * This method triggers when user click skip diagnostic
   */
  public onSkipDiagnostic() {
    this.onClose({ skipDiagnostic: true });
  }

  /**
   * @function onClose
   * This method used to close the popup
   */
  public onClose(params?) {
    this.modalController.dismiss(params);
  }

  /**
   * @function onDiagnosticPlay
   * This method triggers when user click diagnostic play
   */
  public onDiagnosticPlay() {
    this.onClose({ publicClassDiagnosticPlay: true });
  }

  /**
   * @function onChangeDestination
   * This method change destination
   */
  public onChangeDestination() {
    this.showGradeList();
  }

  /**
   * @function showGradeList
   * This method used to show grade list in alert
   */
  public async showGradeList() {
    const gradeListOptions = [...this.gradeList];
    const gradeRadioInputs = [];
    gradeListOptions.map((gradeItem, index) => {
      const radioInput = {
        name: `radio-${index}`,
        type: 'radio',
        label: gradeItem.grade,
        value: gradeItem.id,
        checked: this.currentGrade.id === gradeItem.id
      };
      gradeRadioInputs.push(radioInput);
    });
    const alert = await this.alertCtrl.create({
      cssClass: 'radio-grade-list',
      header: this.translate.instant('SELECT_GRADE'),
      inputs: gradeRadioInputs,
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: this.translate.instant('SUBMIT'),
          handler: selectedId => {
            this.onClose({ selectedDestinationId: selectedId });
          }
        }
      ]
    });
    await alert.present();
    scrollToItemInPopup();
  }
}
