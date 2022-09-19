import { Component, OnInit } from '@angular/core';
import { IdentifyAccountPullupComponent } from '@app/components/identify-account-pullup/identify-account-pullup.component';
import { EVENTS } from '@app/shared/constants/events-constants';
import { PortfolioUniversalActivitiesModal } from '@app/shared/models/portfolio/portfolio';
import { ProfileModel } from '@app/shared/models/profile-portfolio/profile-portfolio';
import { PortfolioProvider } from '@app/shared/providers/apis/portfolio/portfolio';
import { ProfileProvider } from '@app/shared/providers/apis/profile/profile';
import { ModalService } from '@app/shared/providers/service/modal.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { SessionService } from '@app/shared/providers/service/session/session.service';

@Component({
  selector: 'app-universal',
  templateUrl: './universal.page.html',
  styleUrls: ['./universal.page.scss'],
})
export class UniversalPage implements OnInit {

  public userId: string;
  public userIdentities: Array<PortfolioUniversalActivitiesModal>;
  public userProfile: ProfileModel;

  constructor(
    private sessionService: SessionService,
    private portfolioProvider: PortfolioProvider,
    private profileProvider: ProfileProvider,
    private modalService: ModalService,
    private parseService: ParseService
  ) { }

  public ngOnInit() {
    this.userId = this.sessionService.userSession.user_id;
    this.fetchUsersIdentities();
    this.profileProvider.fetchProfileDetails().then((profile) => {
      this.userProfile = profile;
    });
  }

  // ------------------------------------------------------------------------
  // Actions

  /**
   * @function onResendMail
   * This method is used to resend email
   */
  public onResendMail(user) {
    this.resendEmail(user);
  }

  /**
   * @function onCancel
   * This method is used to cancel universal request
   */
  public onCancel(user) {
    this.cancelUniversalRequest(user);
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public openUniversalLink() {
    this.modalService.open(IdentifyAccountPullupComponent, {
      userProfile: this.userProfile
    }).then((action) => {
      if (action) {
        this.fetchUsersIdentities();
        this.onClosePullUp();
      }
    });
    this.parseService.trackEvent(EVENTS.ADD_LINKED_ACCOUNT);
  }

  /**
   * @function onClosePullUp
   * This method is used to close the pullup
   */
  public onClosePullUp() {
    this.modalService.dismiss();
  }


  // ------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchUsersIdentities
   * This method is used to fetch user identities
   */
  public fetchUsersIdentities() {
    this.portfolioProvider.fetchUniversalUserPortfolioUniqueItems(this.userId).then(userIdentities => {
      this.userIdentities = userIdentities.filter(user => user.id !== this.userId);
    });
  }

  /**
   * @function resendEmail
   * This method is used to resend the email
   */
  public resendEmail(user) {
    const params = {
      user_id: user.id
    };
    this.profileProvider.resendEmail(params).then(() => {
      user.status = null;
    });
  }

  /**
   * @function cancelUniversalRequest
   * This method is used to cancel the universal request
   */
  public cancelUniversalRequest(user) {
    const params = {
      user_id: user.id,
      mode: 'profile'
    };
    this.profileProvider.cancelUniversalRequest(params).then(() => {
      this.fetchUsersIdentities();
    });
  }
}
