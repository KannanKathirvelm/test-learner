import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-identify-confirmation-popup',
  templateUrl: './identify-confirmation-popup.component.html',
  styleUrls: ['./identify-confirmation-popup.component.scss'],
})
export class IdentifyConfirmationPopupComponent  {

  constructor(
    private popoverCtrl: PopoverController
    ) { }

  // ---------------------------------------------------------------------------
  // Actions

  /**
   * @function onClosePopup
   * This method help to close the popup
   */
  public onClosePopup() {
    this.popoverCtrl.dismiss();
  }
}
