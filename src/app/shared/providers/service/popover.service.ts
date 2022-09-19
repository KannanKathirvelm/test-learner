import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PopoverService {

  public popover: HTMLIonPopoverElement;

  constructor(private popoverCtrl: PopoverController) { }

  /**
   * @function open
   * This method is used to open popover
   */
  public async open(component, props, className?) {
    if (this.popover) {
      this.popover.dismiss();
    }
    this.popover = await this.popoverCtrl.create({
      component,
      cssClass: className,
      componentProps: props
    });
    this.popover.present();
    return this.popover.onDidDismiss();
  }

  /**
   * @function dismiss
   * This method is used to dismiss popover
   */
  public dismiss(context?) {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  /**
   * @function presentPopover
   * This Method is used to present popover
   */
  public async presentPopover(component, event, componentProps, cssClassName?) {
    const popover = await this.popoverCtrl.create({
      component,
      cssClass: cssClassName,
      translucent: true,
      showBackdrop: false,
      event,
      componentProps
    });
    await popover.present();
  }

  /**
   * @function dismissPopover
   * This Method is used to dismiss popover
   */
  public dismissPopover() {
    this.popoverCtrl.dismiss();
  }
}
