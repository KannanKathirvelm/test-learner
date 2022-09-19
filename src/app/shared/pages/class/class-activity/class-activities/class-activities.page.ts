import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EVENTS } from '@app/shared/constants/events-constants';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { LookupService } from '@app/shared/providers/service/lookup/lookup.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { CALENDAR_VIEW } from '@shared/constants/helper-constants';
import { ClassActivity } from '@shared/models/class-activity/class-activity';
import { ClassModel } from '@shared/models/class/class';
import { ClassActivityService } from '@shared/providers/service/class-activity/class-activity.service';
import { ClassService } from '@shared/providers/service/class/class.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { getAllDatesInMonth, groupBy } from '@shared/utils/global';
import * as moment from 'moment';

@Component({
  selector: 'class-activities',
  templateUrl: './class-activities.page.html',
  styleUrls: ['./class-activities.page.scss'],
})
export class ClassActivityListPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public isWeeklyView: boolean;
  public isDailyView: boolean;
  public isMonthlyView: boolean;
  public class: ClassModel;
  public classActivities: Array<ClassActivity>;
  public noActivities: boolean;
  public highlightDates: Array<string>;
  public disabledDates: Array<Date>;
  public calendarViewMode: string;
  public dailyViewDate: string;
  public monthlyViewStartDate: string;
  public monthlyViewEndDate: string;
  public weeklyViewStartDate: string;
  public weeklyViewEndDate: string;
  public showCalendar: boolean;
  public isLoading: boolean;
  public weeklyViewCurrentMonthDate: string;
  public dailyViewCurrentMonthDate: string;
  public currentMonthDate: string;
  public selectedDate: string;
  public currentDateToView: string;
  public tenantSettings: TenantSettingsModel;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private loader: LoadingService,
    private classService: ClassService,
    private classActivityService: ClassActivityService,
    private playerService: PlayerService,
    private activatedRoute: ActivatedRoute,
    private parseService: ParseService,
    private lookupService: LookupService
    ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.currentDateToView = params.date;
      this.initialize();
    });
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.loadData();
    this.fetchTenantSettings();
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_REPORT);
  }

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public async onRefresh(event) {
    await this.loadData(true);
    event.target.complete();
  }

  /**
   * @function loadData
   * This method is used to load data
   */
  public loadData(isReload?) {
    return Promise.all([this.onSelectView(CALENDAR_VIEW.DAILY, isReload), this.fetchMonthActiviyList(this.dailyViewDate)]);
  }

  /**
   * Initialize the property
   */
  public initialize() {
    const todayDate = this.currentDateToView ? moment(this.currentDateToView, CALENDAR_VIEW.DATE_FORMAT) : moment();
    this.class = this.classService.class;
    this.dailyViewDate = todayDate.format(CALENDAR_VIEW.DATE_FORMAT);
    this.selectedDate = this.dailyViewDate;
    this.weeklyViewStartDate = todayDate.weekday(0).format(CALENDAR_VIEW.DATE_FORMAT);
    this.weeklyViewEndDate = todayDate.weekday(6).format(CALENDAR_VIEW.DATE_FORMAT);
    this.monthlyViewStartDate = todayDate.startOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    this.monthlyViewEndDate = todayDate.endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
  }

  /**
   * This method is used to fetch activities for given month
   */
  private fetchMonthActiviyList(date) {
    const currentYear = moment(date).format('YYYY');
    const currentMonth = moment(date).format('MM');
    const startDate = moment(date).startOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    const endDate = moment(date).endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    return this.classActivityService.fetchMonthActivityList(this.class.id, startDate, endDate).then((activities) => {
      const allDatesInMonth = getAllDatesInMonth(Number(currentYear), Number(currentMonth));
      const activityDateRange = [];
      activities.forEach((activity) => {
        let startRange = activity.activationDate;
        const endRange = activity.endDate;
        while (moment(startRange) <= moment(endRange)) {
          activityDateRange.push(startRange);
          startRange = moment(startRange).add(1, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
        }
      });
      const disabledDates = allDatesInMonth.filter((dateItem) => {
        const formatedDate = dateItem.format(CALENDAR_VIEW.DATE_FORMAT);
        return !activityDateRange.includes(formatedDate);
      });
      this.disabledDates = disabledDates.map((monthActivity) => {
        return new Date(monthActivity);
      });
      if (this.disabledDates.length) {
        const disableStartDate = this.disabledDates[this.disabledDates.length - 1];
        this.currentMonthDate = moment(disableStartDate).format(CALENDAR_VIEW.DATE_FORMAT);
      }
      this.highlightDates = activityDateRange;
      return activities;
    });
  }

  /**
   * This method is used to fetch activities for given date
   */
  private fetchClassActivityList(startDate, endDate?, isReload?) {
    this.isLoading = true;
    if (!isReload) {
      this.loader.displayLoader();
    }
    this.classActivityService.fetchActivityList(this.class.id, startDate, endDate)
      .then((activities) => {
        this.isLoading = false;
        this.classActivities = groupBy(activities, 'activationDate');
        this.noActivities = false;
        if (!activities.length) {
          this.noActivities = true;
        }
      }).finally(() => {
        if (!isReload) {
          this.loader.dismissLoader();
        }
        return;
      });

  }

  /**
   * This method is triggered when user click on the icon
   */
  public onToggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  /**
   * This method is triggered when user choose calendar views
   */
  public onSelectView(view, isReload?) {
    const context = this.getCaEventContext();
    if (view === CALENDAR_VIEW.DAILY) {
      this.isDailyView = true;
      this.isWeeklyView = false;
      this.isMonthlyView = false;
      this.fetchClassActivityList(this.dailyViewDate, null, isReload);
      this.selectedDate = this.dailyViewDate;
      if (this.currentMonthDate !== this.dailyViewCurrentMonthDate) {
        this.fetchMonthActiviyList(this.dailyViewCurrentMonthDate);
      }
      this.parseService.trackEvent(EVENTS.CLICK_DAILY_VIEW, context);
    } else if (view === CALENDAR_VIEW.WEEKLY) {
      this.isWeeklyView = true;
      this.isMonthlyView = false;
      this.isDailyView = false;
      this.fetchClassActivityList(this.weeklyViewStartDate,
        this.weeklyViewEndDate, isReload);
      this.selectedDate = this.weeklyViewStartDate;
      if (this.currentMonthDate !== this.weeklyViewCurrentMonthDate) {
        this.fetchMonthActiviyList(this.weeklyViewCurrentMonthDate);
      }
      this.parseService.trackEvent(EVENTS.CLICK_WEEKLY_VIEW, context);
    } else {
      this.isMonthlyView = true;
      this.isWeeklyView = false;
      this.isDailyView = false;
      this.fetchClassActivityList(this.monthlyViewStartDate,
        this.monthlyViewEndDate, isReload);
      this.selectedDate = this.monthlyViewStartDate;
      this.parseService.trackEvent(EVENTS.CLICK_MONTHLY_VIEW, context);
    }
    return;
  }

  /**
   * This method is triggered when user clicks on previous icon
   */
  public onPreviousDate() {
    if (this.isDailyView) {
      this.dailyViewDate = moment(this.dailyViewDate).add(-1, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.dailyViewDate;
      this.fetchClassActivityList(this.dailyViewDate);
    } else if (this.isWeeklyView) {
      const previousWeek = moment(this.weeklyViewStartDate).add(-1, 'weeks');
      this.weeklyViewStartDate = previousWeek.format(CALENDAR_VIEW.DATE_FORMAT);
      this.weeklyViewEndDate = previousWeek.add(6, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.weeklyViewStartDate;
      this.fetchClassActivityList(this.weeklyViewStartDate, this.weeklyViewEndDate);
    } else {
      const previousMonth = moment(this.monthlyViewStartDate).add(-1, 'months');
      this.monthlyViewStartDate = previousMonth.format(CALENDAR_VIEW.DATE_FORMAT);
      this.monthlyViewEndDate = moment(previousMonth).endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.monthlyViewStartDate;
      this.fetchClassActivityList(this.monthlyViewStartDate, this.monthlyViewEndDate);
    }
  }

  /**
   * This method is triggered when user clicks on next icon
   */
  public onNextDate() {
    if (this.isDailyView) {
      this.dailyViewDate = moment(this.dailyViewDate).add(1, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.dailyViewDate;
      this.fetchClassActivityList(this.dailyViewDate);
    } else if (this.isWeeklyView) {
      const nextWeek = moment(this.weeklyViewStartDate).add(1, 'weeks');
      this.weeklyViewStartDate = nextWeek.format(CALENDAR_VIEW.DATE_FORMAT);
      this.weeklyViewEndDate = nextWeek.add(6, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.weeklyViewStartDate;
      this.fetchClassActivityList(this.weeklyViewStartDate, this.weeklyViewEndDate);
    } else {
      const nextMonth = moment(this.monthlyViewStartDate).add(1, 'months');
      this.monthlyViewStartDate = nextMonth.format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.monthlyViewStartDate;
      this.monthlyViewEndDate = nextMonth.endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
      this.fetchClassActivityList(this.monthlyViewStartDate, this.monthlyViewEndDate);
    }
  }

  /**
   * This method is triggered when user select date on daily view
   */
  public dailyViewDateChanged(date) {
    this.dailyViewDate = date.startDate;
    this.selectedDate = this.dailyViewDate;
    this.fetchClassActivityList(date.startDate);
    this.showCalendar = true;
    this.isDailyView = true;
    this.isWeeklyView = false;
    this.isMonthlyView = false;
  }

  /**
   * This method is triggered when user select date on weekly view
   */
  public weeklyViewDateChanged(date) {
    this.weeklyViewStartDate = date.startDate;
    this.selectedDate = this.weeklyViewStartDate;
    this.weeklyViewEndDate = date.endDate;
    this.fetchClassActivityList(date.startDate, date.endDate);
  }

  /**
   * This method is triggered when user change month on daily view
   */
  public dailyViewMonthChanged(date) {
    this.dailyViewCurrentMonthDate = date;
    this.selectedDate = this.dailyViewCurrentMonthDate;
    this.fetchMonthActiviyList(date);
  }

  /**
   * This method is triggered when user change month on weekly view
   */
  public weeklyViewMonthChanged(date) {
    this.weeklyViewCurrentMonthDate = date;
    this.selectedDate = this.weeklyViewCurrentMonthDate;
    this.fetchMonthActiviyList(date);
  }

  /**
   * This method is triggered when user select month on monthly view
   */
  public monthlyViewMonthChanged(date) {
    this.monthlyViewStartDate = date.startDate;
    this.monthlyViewEndDate = date.endDate;
    this.selectedDate = this.monthlyViewStartDate;
    this.fetchClassActivityList(date.startDate, date.endDate);
    this.showCalendar = true;
  }

  /**
   * This method is used to get performance from child(class-activity-panel)
   */
  public onUpdatePerformance(lastPlayedSession) {
    const todayDate = moment().format(CALENDAR_VIEW.DATE_FORMAT);
    const todayActivities = this.classActivities[todayDate];
    if (todayActivities && todayActivities.length) {
      const activityIndex = todayActivities.findIndex((activity) => {
        return activity.contentId === lastPlayedSession.context.collectionId;
      });
      if (activityIndex > -1) {
        const activity = todayActivities[activityIndex];
        activity.collection.performance = activity.collection.performance || {};
        const performance = activity.collection.performance;
        this.playerService.updateLatestPerformance(performance, lastPlayedSession, activity.contentType, true);
      }
    }
  }

  /**
   * @function onAddCASuggestions
   * This method is used to add suggestion to ca
   */
  public onAddCASuggestions(event) {
    const selectedDate = moment(event.activityDate).format(CALENDAR_VIEW.DATE_FORMAT);
    const activities = this.classActivities[selectedDate];
    const activityIndex = activities.findIndex((activity) => {
      return activity.id === event.activityId;
    });
    if (activityIndex > -1) {
      const activity = activities[activityIndex];
      this.classActivityService.setSuggestionToCA(activity.classId, [activity], true);
    }
  }

  /**
   * @function onUpdateSuggestionPerformance
   * This method is used to update suggestion performance
   */
  public onUpdateSuggestionPerformance(event) {
    const selectedDate = moment(event.activityDate).format(CALENDAR_VIEW.DATE_FORMAT);
    const activities = this.classActivities[selectedDate];
    const activityIndex = activities.findIndex((activity) => {
      return activity.id === event.performance.context.caContentId;
    });
    if (activityIndex > -1) {
      const activity = activities[activityIndex];
      const suggestions = activity.suggestion.suggestedContents;
      const playedSuggestion = suggestions[event.suggestionIndex];
      playedSuggestion.performance = playedSuggestion.performance || {};
      const performance = playedSuggestion.performance;
      this.playerService.updateLatestPerformance(
        performance,
        event.performance,
        playedSuggestion.suggestedContentType
      );
    }
  }

  /**
   * @function getCaEventContext
   * This method is used to get the context for ca event
   */
  public getCaEventContext() {
      const classDetails = this.class;
      return {
        classId: classDetails.id,
        className: classDetails.title,
        courseId: classDetails.course_id,
        premiumClass: classDetails.isPremiumClass,
        publicClass: classDetails.isPublic
      };
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  private fetchTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      this.tenantSettings = tenantSettings;
    });
  }
}
