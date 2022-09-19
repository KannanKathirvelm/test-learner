import { Component } from '@angular/core';
import { PLAYER_EVENT_SOURCE } from '@app/shared/constants/helper-constants';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-option-menu-popover',
  templateUrl: './option-menu-popover.component.html',
  styleUrls: ['./option-menu-popover.component.scss'],
})
export class OptionMenuPopoverComponent {

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private popoverController: PopoverController
  ) { }

  /**
   * @function onTakeDiagnostic
   * This method is used to take the diagnostic
   */
  public onTakeDiagnostic(): void  {
    this.popoverController.dismiss(PLAYER_EVENT_SOURCE.DIAGNOSTIC);
  }

  /**
   * @function onChooseLevel
   * This method is used to choose your grade level
   */
  public onChooseLevel(): void {
    this.popoverController.dismiss('chooseLevel');
  }
}

