import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environment/environment';
import { Events, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '@providers/service/translation.service';
import { LANGUAGE } from '@shared/constants/translate-constants';
import { SessionModel } from '@shared/models/auth/session';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { SessionService } from '@shared/providers/service/session/session.service';

@Component({
  selector: 'nav-side-bar',
  templateUrl: './nav-side-bar.component.html',
  styleUrls: ['./nav-side-bar.component.scss'],
})
export class NavSideBarComponent implements OnInit, OnChanges, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public userSession: SessionModel;
  @Output() public logout = new EventEmitter();
  public showNgxAvatar: boolean;
  public languageList: Array<{ label: string, value: string }>;
  public defaultLanguage: string;
  public enableTour: boolean;

  get appVersion() {
    return environment.APP_VERSION;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private router: Router,
    private sessionService: SessionService,
    private lookupService: LookupService,
    private profileService: ProfileService,
    private events: Events,
    private translationService: TranslationService,
    private menuCtrl: MenuController,
    private translate: TranslateService
  ) {
    this.languageList = [];
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.subscribeToHandleTour();
    this.translationService.getLanguage().then((languageItem) => {
      this.defaultLanguage = languageItem;
    });
    this.languageList = LANGUAGE;
    this.handleAvatarImage();
    this.subscribeToUpdateProfileImage();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.handleAvatarImage();
  }

  public ngOnDestroy() {
    this.lookupService.appConfigSubject.unsubscribe();
    this.events.unsubscribe(this.profileService.USER_PROFILE_UPDATE);
  }

  /**
   * @function subscribeToHandleTour
   * This Method is used to handle tour.
   */
  public subscribeToHandleTour() {
    this.lookupService.appConfigSubject.subscribe((appConfig) => {
      this.handleTour(appConfig);
    });
  }

  /**
   * @function handleAvatarImage
   * This Method is used to handle avatar image.
   */
  public handleAvatarImage() {
    this.showNgxAvatar = this.userSession && !this.userSession.thumbnail;
  }

  /**
   * @function navigateToHome
   * Method is used to navigate to home page
   */
  public navigateToHome() {
    this.router.navigate(['/student-home']);
  }

  /**
   * @function handleTour
   * This Method is used to handle tour overlay.
   */
  public handleTour(appConfig) {
    this.enableTour = appConfig && appConfig.enable_tour_overlay ? appConfig.enable_tour_overlay.value.option : false;
  }

  /**
   * @function subscribeToUpdateProfileImage
   * This method is used to subscribe to update profile image
   */
  public subscribeToUpdateProfileImage() {
    this.events.subscribe(this.profileService.USER_PROFILE_UPDATE, () => {
      this.showNgxAvatar = false;
    });
  }

  /**
   * @function takeTour
   * This Method is used to take tour
   */
  public takeTour() {
    this.menuCtrl.close().then(async () => {
      await this.sessionService.clearTourFromSession();
      this.events.publish(this.lookupService.TAKE_TOUR);
      this.navigateToHome();
    });
  }

  /**
   * @function onLogout
   * This Method is used to logout.
   */
  public onLogout() {
    this.menuCtrl.close().then((isClosed) => {
      if (isClosed) {
        this.logout.emit();
      }
    });
  }

  /**
   * @function closeMenu
   * This Method is used to close the side menu
   */
  public closeMenu() {
    this.menuCtrl.close();
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }

  /**
   * @function changeLanguage
   * This Method is used to change the language of app
   */
  public changeLanguage(event) {
    const selectedLanguage = event.detail.value;
    this.translate.use(selectedLanguage);
    this.translationService.setLanguage(selectedLanguage);
  }
}
