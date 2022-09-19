import { Component, HostListener, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PATH_TYPES, PLAYER_EVENT_SOURCE, SUGGESTION_SCOPE } from '@shared/constants/helper-constants';
import { SuggestionModel } from '@shared/models/suggestion/suggestion';
import { SuggestionProvider } from '@shared/providers/apis/suggestion/suggestion';
import { ClassService } from '@shared/providers/service/class/class.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { PlayerService } from '@shared/providers/service/player/player.service';

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.scss'],
})
export class SuggestionComponent implements OnChanges, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public classId: string;
  @Input() public toggleSuggestion: boolean;
  public suggestionTypes: Array<{
    label: string;
    type: string;
    isActive: boolean;
  }>;
  public contentSourceFilters: Array<{
    label: string;
    type: string;
    isActive: boolean;
  }>;
  public suggestions: Array<SuggestionModel>;
  public noSuggestion: boolean;
  private limit: number;
  private noMoreData: boolean;
  private offset: number;
  public isPublic: boolean;
  public isLoading: boolean;
  public suggestionMessage: string;

  @HostListener('scroll', ['$event'])
  public onScroll(event) {
    const element = event.target;
    if (
      element.offsetHeight + Math.round(element.scrollTop) >=
      element.scrollHeight
    ) {
      if (!this.noMoreData && !this.isLoading) {
        this.offset = this.offset + 10;
        this.isLoading = true;
        this.fetchSuggestions();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private events: Events,
    private collectionPlayerService: CollectionPlayerService,
    private classService: ClassService,
    private suggestionProvider: SuggestionProvider,
    private performanceService: PerformanceService,
    private playerService: PlayerService,
    private translate: TranslateService,
    private parseService: ParseService
  ) {
    const classDetails = this.classService.class;
    this.isPublic = classDetails.isPublic ? classDetails.isPublic : false;
    this.limit = 15;
    this.offset = 0;
    this.noMoreData = false;
    this.suggestions = [];
    this.suggestionMessage = environment.APP_LEARNER ? this.translate.instant('SUGGESTION_MESSAGE') : this.translate.instant('GUARDIAN_SUUGESTION_MSG');
    this.suggestionTypes = [
      {
        label: 'TEACHER',
        type: PATH_TYPES.TEACHER,
        isActive: !this.isPublic,
      },
      {
        label: 'SYSTEM',
        type: PATH_TYPES.SYSTEM,
        isActive: this.isPublic,
      },
    ];

    this.contentSourceFilters = [
      {
        label: 'CLASS_ACTIVITY',
        type: SUGGESTION_SCOPE.CLASS_ACTIVITY,
        isActive: true,
      },
      {
        label: 'COURSE_MAP',
        type: SUGGESTION_SCOPE.COURSE_MAP,
        isActive: false,
      },
      {
        label: 'PROFICIENCY',
        type: SUGGESTION_SCOPE.PROFICIENCY,
        isActive: false,
      },
    ];
    this.subscribeToUpdateCollectionPerformance();
  }

  public ngOnDestroy() {
    this.events.unsubscribe(this.collectionPlayerService.PLAYED_COLLECTION);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.classId && changes.classId.currentValue) {
      this.fetchSuggestions();
    }
    if (changes.toggleSuggestion && changes.toggleSuggestion.currentValue) {
      this.fetchSuggestions(true);
    }
  }

  /**
   * @function subscribeToUpdateCollectionPerformance
   * This method is used to subscribe to update collection performance
   */
  public subscribeToUpdateCollectionPerformance() {
    this.events.subscribe(this.collectionPlayerService.PLAYED_COLLECTION, () => {
      this.suggestions = [];
      this.fetchSuggestions();
    });
  }


  /**
   * @function fetchSuggestions
   * This method is used to fetch the suggestions
   */
  public fetchSuggestions(isReload= false) {
    const selectedType = this.suggestionTypes.find((item) => {
      return item.isActive;
    });
    const selectedFilter = this.contentSourceFilters.find((item) => {
      return item.isActive;
    });
    let source;
    if (selectedFilter.type === SUGGESTION_SCOPE.COURSE_MAP) {
      source = PLAYER_EVENT_SOURCE.COURSE_MAP;
    } else if (selectedFilter.type === SUGGESTION_SCOPE.CLASS_ACTIVITY) {
      source = SUGGESTION_SCOPE.DAILY_CLASS_ACTIVITY;
    } else {
      source = selectedFilter.type;
    }
    const params = {
      scope: selectedFilter.type,
      suggestionOrigin: selectedType.type,
      offset: this.offset,
      max: this.limit,
    };
    if (isReload) {
      this.fetchSuggestionPerformance(this.classId, source, this.suggestions, params);
    } else {
      this.suggestionProvider
        .fetchSuggestions(this.classId, params)
        .then((data) => {
          this.suggestions = this.suggestions.concat(data.suggestions);
          this.fetchSuggestionPerformance(
            this.classId,
            source,
            this.suggestions,
            params
          );
          this.noSuggestion = !this.suggestions.length;
          this.noMoreData = data.suggestions.length === 0;
          this.isLoading = false;
        });
    }
  }

  /**
   * @function onTabSelect
   * This method is used to check the active button
   */
  public onTabSelect(selectedItem) {
    this.suggestions = [];
    this.suggestionTypes.forEach((tab) => {
      tab.isActive = false;
    });
    selectedItem.isActive = true;
    this.offset = 0;
    this.fetchSuggestions();
    if (selectedItem.type === 'system') {
      this.parseService.trackEvent(EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_SYSTEM);
    } else {
      this.parseService.trackEvent(EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_TEACHER);
    }
  }

  /**
   * @function onFilterSelect
   * This method is used to check the active button
   */
  public onFilterSelect(selectedItem) {
    this.suggestions = [];
    this.contentSourceFilters.forEach((filter) => {
      filter.isActive = false;
    });
    selectedItem.isActive = true;
    this.offset = 0;
    this.fetchSuggestions();
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_FILTER_SELECTED);
  }

  /**
   * @function fetchSuggestionPerformance
   * This method is used to fetch performance for suggestion
   */
  public fetchSuggestionPerformance(classId, source, suggestions, params) {
    this.performanceService
      .getSuggestionPerformance(classId, source, suggestions, params)
      .then((response: Array<SuggestionModel>) => {
        this.suggestions = response;
      });
  }

  /**
   * This method is used to get performance
   */
  public onUpdatePerformance(lastPlayedSession) {
    const suggestions = this.suggestions;
    const suggestion = suggestions.find((suggestionItem) => {
      return suggestionItem.suggestionArea ===
        SUGGESTION_SCOPE.CLASS_ACTIVITY ||
        suggestionItem.suggestionArea === SUGGESTION_SCOPE.PROFICIENCY
        ? suggestionItem.id === lastPlayedSession.context.pathId
        : suggestionItem.pathId === lastPlayedSession.context.pathId;
    });
    if (suggestion) {
      suggestion.performance = suggestion.performance || {};
      const performance = suggestion.performance;
      this.playerService.updateLatestPerformance(
        performance,
        lastPlayedSession,
        suggestion.suggestedContentType
      );
    }
  }
}
