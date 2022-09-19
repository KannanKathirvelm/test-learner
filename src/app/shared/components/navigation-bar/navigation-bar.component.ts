import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { locationPullDownAnimation } from '@shared/animations/pull-down';
import { locationPullUpAnimation } from '@shared/animations/pull-up';
import { UserSubjectCompetencyComponent } from '@shared/components/proficiency/user-subject-competency/user-subject-competency.component';
import { SearchDestinationComponent } from '@shared/components/search-destination/search-destination.component';
import { EVENTS } from '@shared/constants/events-constants';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { OptionMenuPopoverComponent } from './option-menu-popover/option-menu-popover.component';

@Component({
  selector: 'navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
})
export class NavigationBarComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public selectedDestination: string;
  @Input() public readOnly: boolean;
  @Input() public subjectCode: string;
  @Input() public subjectName: string;
  @Input() public isShowJoinClass: boolean;
  @Input() public showUpdateLocationOption: boolean;
  @Output() public selectedOption = new EventEmitter();

  constructor(
    private parseService: ParseService,
    private modalCtrl: ModalController,
    private popoverController: PopoverController
    ) { }

  // -------------------------------------------------------------------------
  // Methods
  /**
   * @function chooseYourLocation
   * This method will trigger when user clicks on location item
   */
  public chooseYourLocation() {
    const subjectCode = this.subjectCode;
    this.openModal(UserSubjectCompetencyComponent,
      {
        subjectCode
      },
      'user-subject-facets-modal'
    ).then((modal) => {
      modal.present();
      this.trackClickYourLocationEvent();
    });
  }

  /**
   * @function trackClickYourLocationEvent
   * Method to is used to track the select destination header event
   */
  private trackClickYourLocationEvent() {
    this.parseService.trackEvent(EVENTS.CLICK_YOUR_LOCATION);
  }

  /**
   * @function chooseYourDestination
   * This method will trigger when user clicks on destination item
   */
  public chooseYourDestination() {
    const context = {
      showJoinClass: this.isShowJoinClass
    };
    this.openModal(SearchDestinationComponent, context, 'search-destination-modal').then((modal) => {
      modal.present();
    });
  }

  /**
   * @function openModal
   * This method is used to open modal
   */
  public openModal(component, context, className) {
    return this.modalCtrl.create({
      component,
      cssClass: className,
      enterAnimation: locationPullDownAnimation,
      leaveAnimation: locationPullUpAnimation,
      componentProps: {
        ...context
      }
    });
  }

  public async showOptions(event) {
    this.presentPopover(OptionMenuPopoverComponent, event, {}, 'option-menu-popover');
  }

  public async presentPopover(component, event, componentProps, cssClassName?) {
    const popover = await this.popoverController.create({
      component,
      cssClass: cssClassName,
      translucent: true,
      showBackdrop: false,
      event,
      componentProps
    });
    await popover.present();
    popover.onDidDismiss().then((response) => {
      this.selectedOption.emit(response.data);
    });
  }
}
