import { Component, OnInit } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { AddGuardianFormComponent } from '@components/profile/add-guardian-form/add-guardian-form.component';
import { GuardianProfileModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { LoadingService } from '@shared/providers/service/loader.service';
import { ModalService } from '@shared/providers/service/modal.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';

@Component({
  selector: 'app-guardian',
  templateUrl: './guardian.page.html',
  styleUrls: ['./guardian.page.scss'],
})

export class GuardianPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public guardianList: Array<GuardianProfileModel>;
  public isLoaded: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileService: ProfileService,
    private modalService: ModalService,
    private loadingService: LoadingService,
    private parseService: ParseService
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.getGuardianList();
  }

  /**
   * @function getGuardianList
   * This method is used to get the guardian list
   */
  public getGuardianList() {
    this.profileService.fetchGuardianList().then((response) => {
      this.guardianList = response;
      this.isLoaded = true;
    });
  }

  /**
   * @function openAddGuardianForm
   * This method is used to open add guardian form
   */
  public openAddGuardianForm() {
    this.modalService.open(AddGuardianFormComponent, {}, 'guardian-form-modal').then(() => {
      this.getGuardianList();
    });
    this.parseService.trackEvent(EVENTS.ACCESS_LEARNING_DATA);
  }

  /**
   * @function guardianAcceptEvent
   * Method to accept guardian
   */
  public guardianAcceptEvent(guardianId) {
    this.loadingService.displayLoader();
    this.profileService.acceptGuardianRequest(Number(guardianId)).then(() => {
      this.getGuardianList();
      this.loadingService.dismissLoader();
    });
  }
}
