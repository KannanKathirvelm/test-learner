import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  // -------------------------------------------------------------------------
  // Properties

  public modalController: HTMLIonModalElement;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private modalCtrl: ModalController) { }

  // -------------------------------------------------------------------------
  // Methods


  /**
   * @function open
   * This method is used to open modal
   */
  public async open(component, props, className?, enterAnimation?, leaveAnimation?) {
    this.modalController = await this.modalCtrl.create({
      component,
      cssClass: className,
      enterAnimation: enterAnimation ? enterAnimation : pullUpAnimation,
      leaveAnimation: leaveAnimation ? leaveAnimation : pullDownAnimation,
      componentProps: props,
    });
    await this.modalController.present();
    return new Promise((resolve, reject) => {
      this.modalController.onDidDismiss().then((response) => {
        if (response.data) {
          resolve(response.data);
        }
      });
    });
  }

  /**
   * @function dismiss
   * This method is used to dismiss modal
   */
  public dismiss(context?) {
    if (this.modalController) {
      this.modalController.dismiss(context);
    }
  }

  /**
   * @function dismissModal
   * This Method is used to dismiss the model
   */
  public async dismissModal(context?) {
    return await this.modalCtrl.dismiss(context);
  }
}
