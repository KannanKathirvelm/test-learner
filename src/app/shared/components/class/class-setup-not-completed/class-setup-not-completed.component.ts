import { Component } from '@angular/core';
import { environment } from '@environment/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'class-setup-not-completed',
  templateUrl: './class-setup-not-completed.component.html',
  styleUrls: ['./class-setup-not-completed.component.scss'],
})

export class ClassSetupNotCompletedComponent {
  // -------------------------------------------------------------------------
  // Properties

  public setupInCompleteHeading: string;
  public setupInCompleteDescription: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private translate: TranslateService) {
    this.initialize();
  }

  /**
   * @function initialize
   * This Method is used to initialize
   */
  public initialize() {
    if (environment.APP_LEARNER) {
      this.setupInCompleteHeading = this.translate.instant('SETUP_INCOMPLETE_HEADING');
      this.setupInCompleteDescription = this.translate.instant('SETUP_INCOMPLETE_MSG');
    } else {
      this.setupInCompleteHeading = this.translate.instant('SETUP_INCOMPLETE_WARD_HEADING');
    }
  }
}
