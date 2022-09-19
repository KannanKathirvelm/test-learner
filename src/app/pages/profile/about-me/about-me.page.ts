
import { Component, OnInit } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { AuthProvider } from '@providers/apis/auth/auth';
import { ProfileProvider } from '@shared/providers/apis/profile/profile';
import { LoadingService } from '@shared/providers/service/loader.service';

@Component({
  selector: 'about-me',
  templateUrl: './about-me.page.html',
  styleUrls: ['./about-me.page.scss'],
})
export class AboutMePage implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  public maxChars: number;
  public about: string;
  public isUpdate: boolean;
  public isEdit: boolean;
  public isContentAvailable: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileProvider: ProfileProvider,
    private authProvider: AuthProvider,
    private loader: LoadingService,
    private parseService: ParseService
  ) {
    this.maxChars = 500;
    this.isUpdate = false;
   }

  // -------------------------------------------------------------------------
  // Actions
  public ngOnInit() {
    this.loader.displayLoader();
    this.profileProvider.fetchProfileDetails().then((profile) => {
      this.about = profile.about;
      this.isEdit = profile.about && profile.about.length ? true : false;
      this.isContentAvailable = !this.isEdit;
      this.loader.dismissLoader();
    });
  }

  /**
   * @function onClickUpdate
   * This method is used to change the condition based on data
   */
  public onClickUpdate() {
    this.isUpdate = true;
    this.isEdit = false;
    this.isContentAvailable = false;
    this.parseService.trackEvent(EVENTS.IDENTIFY_MY_ACCOUNT);
  }

  /**
   * @function onSubmit
   * This method is used to submit the about details
   */
  public onSubmit() {
    const postData = {
      about: this.about
    };
    this.authProvider.updateUserProfile(postData)
      .then(() => {
        this.isUpdate = false;
        this.isEdit = this.about && this.about.length ? true : false;
        this.isContentAvailable = !this.isEdit;
      });
  }
}
