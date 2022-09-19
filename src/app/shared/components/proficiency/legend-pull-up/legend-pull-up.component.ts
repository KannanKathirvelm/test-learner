import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SubjectModel } from '@shared/models/taxonomy/taxonomy';

@Component({
  selector: 'legend-pull-up',
  templateUrl: './legend-pull-up.component.html',
  styleUrls: ['./legend-pull-up.component.scss'],
})
export class LegendPullUpComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public activeSubject: SubjectModel;
  @Input() public isEmitCloseEvent: boolean;
  @Output() public closePullUp = new EventEmitter();
  @Input() public showSkylineContent: boolean;

  constructor(private modalController: ModalController) { }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose() {
    if (this.isEmitCloseEvent) {
      this.closePullUp.emit();
    } else {
      this.modalController.dismiss();
    }
  }
}
