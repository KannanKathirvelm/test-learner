import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { formShareUrl } from '@shared/constants/deeplink-constants';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE, SUGGESTION_TYPE } from '@shared/constants/helper-constants';
import { ClassActivity } from '@shared/models/class-activity/class-activity';
import { PlayerPerformanceModel } from '@shared/models/performance/performance';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { ReportService } from '@shared/providers/service/report/report.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { collapseAnimation } from 'angular-animations';
import * as moment from 'moment';

@Component({
  selector: 'nav-class-activity-panel',
  templateUrl: './class-activity-panel.component.html',
  styleUrls: ['./class-activity-panel.component.scss'],
  animations: [collapseAnimation({ duration: 300, delay: 0 })]
})
export class ClassActivityPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public selectedDate: string;
  @Input() public activity: ClassActivity;
  @Output() public updatePerformance: EventEmitter<PlayerPerformanceModel> = new EventEmitter();
  @Output() public addSuggestions: EventEmitter<{ activityDate: string; activityId: number; }> = new EventEmitter();
  @Output() public updateSuggestionPerformance: EventEmitter<{ activityDate: string; performance: PlayerPerformanceModel; suggestionIndex: number }> = new EventEmitter();
  public shareSupport: boolean;
  public isPlayable: boolean;
  public toggleSuggestion: boolean;
  @Input() public tenantSettings: TenantSettingsModel;
  public isLearner: boolean;

  public get isOfflineActivity() {
    return this.activity.collection.collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY;
  }

  public get isCollection() {
    return this.activity.collection.collectionType === CONTENT_TYPES.COLLECTION
      || this.activity.collection.collectionType === CONTENT_TYPES.EXTERNAL_COLLECTION;
  }

  public get isAssessment() {
    return this.activity.collection.collectionType === CONTENT_TYPES.ASSESSMENT
      || this.activity.collection.collectionType === CONTENT_TYPES.EXTERNAL_ASSESSMENT;
  }

  public get shareUrl() {
    const context = this.getContext();
    return formShareUrl('player', context);
  }

  constructor(
    private playerService: PlayerService,
    private reportService: ReportService,
    private utilsService: UtilsService,
    private parseService: ParseService
  ) { }

  public ngOnInit() {
    this.toggleSuggestion = true;
    this.shareSupport = environment.SHARE_SUPPORT;
    this.checkActivityIsPlayable();
    this.isLearner = environment.APP_LEARNER;
  }

  /**
   * @function checkActivityIsPlayable
   * This method used in case were any activity should not be playable for future dates
   */
  private checkActivityIsPlayable() {
    const selectedDate = this.selectedDate;
    const endDate = this.activity.endDate;
    const today = moment().format('YYYY-MM-DD');
    const isSelectedDateSameOrAfterToday = moment(today).isSameOrAfter(selectedDate, 'day');
    const isSelectedDateSameOrAfterEndDate = moment(endDate).isSameOrAfter(selectedDate, 'day');
    const isCurrentDateSameOrAfterEndDate = moment(endDate).isSameOrAfter(today, 'day');
    if (this.isCollection) {
      if (isSelectedDateSameOrAfterToday) {
        this.isPlayable = true;
      }
    } else {
      if (isSelectedDateSameOrAfterEndDate && isSelectedDateSameOrAfterToday && isCurrentDateSameOrAfterEndDate) {
        this.isPlayable = true;
      }
    }
  }

  /**
   * @function onPlay
   * This method used to render player
   */
  public onPlay() {
    const context = this.getContext();
    context['caContentId'] = this.activity.id;
    this.playerService.openPlayer({ context }).then((response: PlayerPerformanceModel) => {
      this.updatePerformance.emit(response);
    });
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_PLAY);
  }

  /**
   * @function getContext
   * This method used to get the context
   */
  public getContext() {
    const collectionType = this.activity.contentType;
    return {
      collectionId: this.activity.contentId,
      classId: this.activity.classId,
      collectionType,
      source: PLAYER_EVENT_SOURCE.DAILY_CLASS
    };
  }

  /**
   * @function onPreview
   * This method used to preview the student report by guardian
   */
  public onPreview() {
    if (!environment.APP_LEARNER) {
      const isPreview = this.tenantSettings && this.tenantSettings.enableGuardianCollectionPreview;
      this.showReport(isPreview);
    }
  }


  /**
   * @function showReport
   * This method used to call report function based on type
   */
  public showReport(isPreview?) {
    const context = {
      collectionId: this.activity.contentId,
      sessionId: !isPreview ? this.activity.collection.performance.sessionId : null,
      classId: this.activity.classId,
      collectionType: this.activity.contentType,
      activityDate: this.activity.activationDate,
      performance: !isPreview ? this.activity.collection.performance : null,
      contentSource: !isPreview ? PLAYER_EVENT_SOURCE.DAILY_CLASS : null,
      contentId: this.activity.id,
      endDate: this.activity.endDate,
      isPreview
    };
    this.reportService.showReport(context);
    if (!isPreview) {
      if (this.activity.contentType === CONTENT_TYPES.ASSESSMENT || this.activity.contentType === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
        this.parseService.trackEvent(EVENTS.CLICK_STUDENT_CA_ASSESSMENT_REPORT);
      } else {
        this.parseService.trackEvent(EVENTS.CLICK_STUDENT_CA_COLLECTION_REPORT);
      }
    }
  }

  /**
   * @function openMeetingLink
   * This method is used to open meeting link
   */
  public openMeetingLink() {
    const params = {
      title: this.activity.title,
      startDate: this.activity.meeting_starttime,
      endDate: this.activity.meeting_endtime,
      meetingLink: this.activity.meeting_url
    };
    this.playerService.openVideoConference(params, 'video-conference-modal').then((callback: { join: boolean }) => {
      if (callback.join) {
        this.utilsService.openMeetingLink(this.activity.meeting_url);
      }
    });
  }

  /**
   * @function showSuggestion
   * This method is used to toggle suggestion
   */
  public showSuggestion() {
    this.toggleSuggestion = !this.toggleSuggestion;
    if (this.activity.suggestion && !this.activity.suggestion.suggestedContents) {
      this.addSuggestions.emit({
        activityDate: this.activity.activationDate,
        activityId: this.activity.id
      });
    }
  }

  /**
   * @function onSuggestionPlay
   * This method is used to show suggestion play
   */
  public onSuggestionPlay(suggestionContent, suggestionIndex) {
    const context = {
      collectionId: suggestionContent.suggestedContentId,
      classId: suggestionContent.classId,
      collectionType: suggestionContent.suggestedContentType,
      source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      caContentId: this.activity.suggestion.caId,
      pathType: SUGGESTION_TYPE.CA_TEACHER,
      pathId: suggestionContent.suggestedToContext[0].id
    };
    this.playerService.openPlayer({ context }).then((response: PlayerPerformanceModel) => {
      this.updateSuggestionPerformance.emit({
        activityDate: this.activity.activationDate,
        performance: response,
        suggestionIndex
      });
    });
  }

  /**
   * @function showSuggestionReport
   * This method used to show suggestion report function based on type
   */
  public showSuggestionReport(suggestedContent) {
    const context = {
      collectionId: suggestedContent.suggestedContentId,
      sessionId: suggestedContent.performance.lastSessionId,
      classId: suggestedContent.classId,
      collectionType: suggestedContent.suggestedContentType,
      performance: suggestedContent.performance,
      contentSource: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      contentId: suggestedContent.suggestedContentId
    };
    this.reportService.showReport(context);
  }
}
