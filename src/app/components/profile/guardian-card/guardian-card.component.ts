import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { GuardianProfileModel } from '@shared/models/profile-portfolio/profile-portfolio';

@Component({
  selector: 'nav-guardian-card',
  templateUrl: './guardian-card.component.html',
  styleUrls: ['./guardian-card.component.scss'],
})
export class GuardianCardComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public guardian: GuardianProfileModel;
  @Output() public guardianAcceptEvent = new EventEmitter();
  public showNgxAvatar: boolean;
  public readonly INVITED_BY_GUARDIAN = 'guardian';
  public readonly INVITED_STATUS_PENDING = 'pending';
  public readonly INVITED_STATUS_ACCEPTED = 'accepted';
  public readonly INVITED_BY_STUDENT = 'student';

  constructor(private parseService: ParseService) { }

  // -------------------------------------------------------------------------
  // life cycle methods

  public ngOnInit() {
    this.handleAvatarImage();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function handleAvatarImage
   * This Method is used to handle avatar image.
   */
  public handleAvatarImage() {
    this.showNgxAvatar = this.guardian && !this.guardian.thumbnail;
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }

  /**
   * @function acceptGuardianRequest
   * This Method is used to accept guardian request
   */
  public acceptGuardianRequest(guardianId) {
    this.guardianAcceptEvent.emit(guardianId);
    this.parseService.trackEvent(EVENTS.ACCESS_LEARNING_DATA);
  }
}
