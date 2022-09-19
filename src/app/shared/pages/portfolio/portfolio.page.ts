import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { ModalController } from '@ionic/angular';
import { PortfolioCalendarComponent } from '@shared/components/portfolio/portfolio-calendar/portfolio-calendar.component';
import { ASSESSMENT, COLLECTION, OFFLINE_ACTIVITY } from '@shared/constants/helper-constants';
import { TabsModel } from '@shared/models/offline-activity/offline-activity';
import { PortfolioActivities, ProfileModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { ProfilePortfolioProvider } from '@shared/providers/apis/profile-portfolio/profile-portfolio';
import { ProfileProvider } from '@shared/providers/apis/profile/profile';
import { LoadingService } from '@shared/providers/service/loader.service';
import { SessionService } from '@shared/providers/service/session/session.service';

@Component({
  selector: 'portfolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
  animations: []
})
export class PortfolioPage {

  // -------------------------------------------------------------------------
  // Properties
  public portfolioActivities: Array<PortfolioActivities>;
  public userId: string;
  public offset: number;
  public limit: number;
  public isLoading: boolean;
  public tabs: Array<TabsModel>;
  public contentType: string;
  public isFetchedAll: boolean;
  public startDate: Date;
  public showApplyFilter: boolean;
  public filterStartDate: string;
  public filterEndDate: string;
  public showFilter: boolean;
  public selectedDates: Array<Date>;
  public profileDetails: ProfileModel;
  public contentTypeName: string;


  get hasActivity() {
    const portfolioActivities = this.portfolioActivities;
    return portfolioActivities.length && portfolioActivities[0].content.length;
  }
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileProvider: ProfileProvider,
    private modalController: ModalController,
    private profilePortfolioProvider: ProfilePortfolioProvider,
    private loader: LoadingService,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private parseService: ParseService
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = this.sessionService.userSession.user_id;
      this.portfolioActivities = [];
      this.offset = 0;
      this.limit = 10;
      this.isLoading = false;
      this.isFetchedAll = false;
      this.tabs = [{
        title: 'COLLECTION',
        isActive: true,
        contentType: COLLECTION
      }, {
        title: 'ASSESSMENT',
        isActive: false,
        contentType: ASSESSMENT
      },
      {
        title: 'OFFLINE_ACTIVITY',
        isActive: false,
        contentType: OFFLINE_ACTIVITY
      }];
      this.contentType = this.tabs[0].contentType;
      this.contentTypeName = this.tabs[0].title;
      this.showFilter = false;
      this.initalize();
    });
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function initalize
   * This method is used to initialize
   */
  public initalize() {
    this.loader.displayLoader();
    this.loadData(this.contentType);
    this.profileProvider.fetchProfileDetails().then((profile) => {
      this.profileDetails = profile;
      const startDate = this.profileDetails.createdAt;
      this.startDate = new Date(startDate);
    });
  }

  /**
   * @function onScroll
   * This method is used to fetch more suggestions
   */
  public async onScroll(event) {
    const scrollElement = await event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = event.detail.scrollTop;
    const targetPercent = 80;
    const triggerDepth = ((scrollHeight / 100) * targetPercent);
    if (currentScrollDepth > triggerDepth) {
      if (!this.isLoading && !this.isFetchedAll && !this.showFilter) {
        this.isLoading = true;
        this.offset = this.offset + 10;
        this.loadData(this.contentType);
      }
    }
  }

  /**
   * @function onClickFilter
   * This method is used to show the filter
   */
  public onClickFilter() {
    this.showFilter = !this.showFilter;
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_PORTFOLIO_FILTER);
  }

  /**
   * @function filterActivities
   * This method is used to filter activites
   */
  public filterActivities() {
    this.showFilter = false;
    this.portfolioActivities = [];
    this.limit = 10;
    this.offset = 0;
    this.loader.displayLoader();
    this.loadData(this.contentType);
  }

  /**
   * @function removeSelectedDates
   * This method is used to remove selected date.
   */
  public removeSelectedDates(newTab?) {
    this.filterStartDate = null;
    this.filterEndDate = null;
    this.selectedDates = null;
    this.showApplyFilter = false;
    if (!newTab) {
      this.filterActivities();
    }
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData(contentType) {
    this.fetchPortfolioActivities(contentType).then((activities: PortfolioActivities) => {
      this.portfolioActivities = this.portfolioActivities.concat(activities);
      this.isLoading = false;
      this.isFetchedAll = activities.content.length === 0;
      this.loader.dismissLoader();
    }).catch((error) => {
      this.loader.dismissLoader();
    });
  }

  /**
   * @function showTab
   * This method is used to active tab
   */
  public showTab(tab, selectedTabIndex) {
    if (this.contentType !== tab.contentType) {
      this.showFilter = false;
      this.contentType = tab.contentType;
      this.contentTypeName = tab.title;
      this.portfolioActivities = [];
      this.offset = 0;
      this.limit = 10;
      this.isFetchedAll = false;
      this.loader.displayLoader();
      this.loadData(this.contentType);
      this.tabs.map((rubricTab, tabIndex) => {
        rubricTab.isActive = tabIndex === selectedTabIndex;
      });
    }
  }

  /**
   * @function onClickCalendar
   * This method is used to open the calendar
   */
  public async onClickCalendar() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: PortfolioCalendarComponent,
      componentProps: {
        startDate: this.startDate,
        selectedDates: this.selectedDates || null
      }
    });
    modal.onDidDismiss().then((dismissContent) => {
      const content = dismissContent.data;
      if (content && content.filterStartDate && content.filterEndDate) {
        this.filterStartDate = content.filterStartDate;
        this.filterEndDate = content.filterEndDate;
        this.selectedDates = content.selectedDates;
        this.showApplyFilter = true;
      }
    });
    await modal.present();
  }

  /**
   * @function fetchPortfolioActivities
   * This method is used to fetch Portfolio Activities
   */
  public fetchPortfolioActivities(type) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        startDate: this.filterStartDate || null,
        endDate: this.filterEndDate || null,
        userId: this.userId,
        activityType: type,
        offset: this.offset,
        limit: this.limit
      };
      return this.profilePortfolioProvider.fetchPortfolioActivities(requestParam).then((portfolioContents) => {
        resolve(portfolioContents);
      }, reject);
    });
  }
}
