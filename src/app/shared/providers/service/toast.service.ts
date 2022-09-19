import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable()
export class ToastService {

  // -------------------------------------------------------------------------
  // Properties

  public defaultShowCloseButton = true;

  public defaultCloseButtonText = 'OK';

  public defaultDuration = 4000;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(public toastController: ToastController) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function presentToast
   * This Method is used to display the toast
   */

  public async presentToast(
    message: string,
    customDuration?: number,
    showCloseButton?: boolean,
    closeButtonText?: string) {
    const toast = await this.toastController.create({
      message,
      closeButtonText: closeButtonText
        ? closeButtonText
        : this.defaultCloseButtonText,
      showCloseButton: showCloseButton
        ? showCloseButton
        : this.defaultShowCloseButton,
      duration: customDuration
        ? customDuration
        : this.defaultDuration
    });
    toast.present();
    return new Promise((resolve, reject) => {
      toast.onDidDismiss().then((value) => {
        if (value.role === 'cancel') {
          resolve(value);
        }
      });
    });
  }
}
