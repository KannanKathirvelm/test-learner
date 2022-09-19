import { Component, Input } from '@angular/core';
import { ProfileModel } from '@app/models/auth/signup';
import { EVENTS } from '@app/shared/constants/events-constants';
import { UniversalUserModel } from '@app/shared/models/profile-portfolio/profile-portfolio';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { PopoverService } from '@app/shared/providers/service/popover.service';
import { ProfileService } from '@app/shared/providers/service/profile/profile.service';
import { IdentifyConfirmationPopupComponent } from '../identify-confirmation-popup/identify-confirmation-popup.component';

@Component({
  selector: 'app-identify-account-pullup',
  templateUrl: './identify-account-pullup.component.html',
  styleUrls: ['./identify-account-pullup.component.scss'],
})
export class IdentifyAccountPullupComponent {
  @Input() public userProfile: ProfileModel;
  public isShowSearchResult: boolean;
  public searchTerms: string;
  public usersList: Array<UniversalUserModel>;

  constructor(
    private popoverSevice: PopoverService,
    private profileService: ProfileService,
    private modalService: ModalService,
    private parseService: ParseService
  ) { }

  // ----------------------------------------------------------------------------
  // Actions

  /**
   * @function onSearchUser
   * This action triggered search univeral users
   */
   public onSearchUser() {
    this.fetchUniversalUser();
    this.parseService.trackEvent(EVENTS.IDENTIFY_MY_ACCOUNT);
  }

  /**
   * @function onClose
   * This action triggered when click on try again button
   */
  public onClose() {
    this.isShowSearchResult = false;
  }

  /**
   * @function onClear
   * This action triggered when click on the clear button
   */
  public onClear() {
    this.searchTerms = null;
  }

  /**
   * @function onClose
   * This action triggered when click on try again button
   */
  public onCloseModal() {
    this.modalService.dismiss('onClose');
  }

  /**
   * @function onSelectedUser
   * This action triggered when selected the users checkbox
   */
  public onSelectedUser(user) {
    user.isSelected = !user.isSelected;
  }

  /**
   * @function onConfirm
   * This action triggered when click on link users
   */
  public onConfirm(event) {
    this.linkUserveralUsers(event);
  }

  /**
   * @function confirmationPopup
   * This method trigger when user clicks on more icon
   */
  public async confirmationPopup(event) {
    await this.popoverSevice.open(
      IdentifyConfirmationPopupComponent,
      {},
      'universal-identiy-popover'
    ).then(() => {
      this.onCloseModal();
    });
  }

  // ------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchUniversalUser
   * This method help to fetch the universal user list
   */
  public fetchUniversalUser() {
    const params = {
      text: this.searchTerms
    };
    this.profileService.searchUniveralUsers(params).then(usersList => {
      this.usersList = usersList.filter(user => !user.status);
      this.isShowSearchResult = true;
    });
  }

  /**
   * @function linkUserveralUsers
   * This method help to link the users list
   */
  public linkUserveralUsers(event) {
    const usersList = this.usersList;
    const selectedUsers = usersList.filter(user => user.isSelected);
    const usersIds = selectedUsers.map(user => user.id);
    if (usersIds.length) {
      const params = {
        user_ids: usersIds
      };
      this.profileService.linkUniveralUsers(params).then(() => {
        selectedUsers.forEach(user => {
          user.status = 'requested';
        });
        this.confirmationPopup(event);
      });
    }
  }

}
