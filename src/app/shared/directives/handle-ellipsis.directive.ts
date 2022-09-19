import { Directive, HostListener, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TitlePopoverComponent } from '@shared/components/title-popover/title-popover.component';

@Directive({
  selector: '[tooltip]'
})
export class HandleEllipsisDirective {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public text: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    public popoverController: PopoverController
  ) {
  }

  // -------------------------------------------------------------------------
  // Actions

  @HostListener('click', ['$event'])
  public onClick(event): void {
    event.stopPropagation();
    this.presentPopover(event);
  }

  /**
   * @function presentPopover
   * This method is called when user clicks on ellipsis applied text
   */
  public async presentPopover(event) {
    const popover = await this.popoverController.create({
      component: TitlePopoverComponent,
      event,
      componentProps: { text: this.text },
      showBackdrop: false,
    });
    return await popover.present();
  }
}
