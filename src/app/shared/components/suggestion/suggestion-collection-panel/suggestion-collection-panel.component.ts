import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environment/environment';
import { PLAYER_EVENT_SOURCE, SUGGESTION_SCOPE, SUGGESTION_TYPE } from '@shared/constants/helper-constants';
import { routerPath } from '@shared/constants/router-constants';
import { PlayerPerformanceModel } from '@shared/models/performance/performance';
import { SuggestionModel } from '@shared/models/suggestion/suggestion';
import { NavigateProvider } from '@shared/providers/apis/navigate/navigate';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { ReportService } from '@shared/providers/service/report/report.service';
import { SessionService } from '@shared/providers/service/session/session.service';

@Component({
  selector: 'suggestion-collection-panel',
  templateUrl: './suggestion-collection-panel.component.html',
  styleUrls: ['./suggestion-collection-panel.component.scss'],
})
export class SuggestionCollectionPanelComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public suggestion: SuggestionModel;
  @Output() public updatePerformance: EventEmitter<PlayerPerformanceModel> = new EventEmitter();
  public isLearner: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private reportService: ReportService,
    private navigateProvider: NavigateProvider,
    private playerService: PlayerService
  ) {
  }


  public ngOnInit() {
    this.isLearner = environment.APP_LEARNER;
  }
  /**
   * @function onPlay
   * This method used to play the player
   */
  public onPlay() {
    if (this.isLearner) {
      if (this.suggestion.isClassActivity) {
        this.onPlayClassActivity();
      } else if (this.suggestion.isCourseMap) {
        const pathType = this.suggestion.suggestionOrigin;
        if (pathType === 'system' && !this.suggestion.accepted) {
          this.addSuggestedPath().then((pathId) => {
            this.onPlayCourseMap(pathId);
          });
        } else {
          this.onPlayCourseMap(this.suggestion.pathId);
        }
      } else {
        this.onPlayProficiency();
      }
    }
  }

  /**
   * @function onPlayClassActivity
   * This method used to play the player of class activity
   */
  public onPlayClassActivity() {
    const context = {
      collectionId: this.suggestion.suggestedContentId,
      classId: this.suggestion.classId,
      collectionType: this.suggestion.suggestedContentType,
      source: this.getEventSource(),
      caContentId: this.suggestion.caId,
      pathId: this.suggestion.id,
      courseId: this.suggestion.courseId,
      unitId: this.suggestion.unitId,
      lessonId: this.suggestion.lessonId,
      pathType: SUGGESTION_TYPE.CA_TEACHER
    };
    this.playerService.openPlayer({ context }).then((response: PlayerPerformanceModel) => {
      this.updatePerformance.emit(response);
    });
  }

  /**
   * @function onPlayCourseMap
   * This method used to play the player of course map
   */
  public onPlayCourseMap(pathId?) {
    const ctxPathId = this.suggestion.ctxPathId || 0;
    const ctxPathType = this.suggestion.ctxPathType || null;
    const context = {
      collectionId: this.suggestion.suggestedContentId,
      classId: this.suggestion.classId,
      collectionType: this.suggestion.suggestedContentType,
      source: this.getEventSource(),
      courseId: this.suggestion.courseId,
      unitId: this.suggestion.unitId,
      lessonId: this.suggestion.lessonId,
      pathId: pathId || this.suggestion.ctxPathId || 0,
      pathType: this.suggestion.suggestionOrigin || this.suggestion.ctxPathType || null,
      ctxPathId,
      ctxPathType
    };
    const playerUrl = routerPath('studyPlayer');
    this.router.navigate([playerUrl], {
      queryParams: {
        ...context
      }
    });
  }

  /**
   * @function onPlayProficiency
   * This method used to play the player of play proficiency
   */
  public onPlayProficiency() {
    const collectionId = this.suggestion.suggestedContentId;
    const classId = this.suggestion.classId;
    const collectionType = this.suggestion.suggestedContentType;
    const source = this.getEventSource();
    const pathId = this.suggestion.id;
    const courseId = this.suggestion.courseId;
    const unitId = this.suggestion.unitId;
    const lessonId = this.suggestion.lessonId;
    const pathType = SUGGESTION_TYPE.PROFICIENY_TEACHER;
    const context = {
      collectionId,
      classId,
      collectionType,
      source,
      courseId,
      unitId,
      lessonId,
      pathId,
      pathType
    };
    this.playerService.openPlayer({ context }).then((response: PlayerPerformanceModel) => {
      this.updatePerformance.emit(response);
    });
  }

  /**
   * @function showReport
   * This method used to call report function based on type
   */
  public showReport() {
    const context = {
      collectionType: this.suggestion.suggestedContentType,
      collectionId: this.suggestion.suggestedContentId,
      contentSource: this.getEventSource(),
      classId: this.suggestion.classId,
      courseId: this.suggestion.courseId,
      unitId: this.suggestion.unitId,
      lessonId: this.suggestion.lessonId,
      pathId: this.suggestion.pathId || this.suggestion.id,
      sessionId: this.suggestion.performance.lastSessionId,
      isSuggestion: true,
      performance: this.suggestion.performance
    };
    this.reportService.showReport(context);
  }

  /**
   * @function getEventSource
   * Method to get event source based on suggestion area
   */
  public getEventSource() {
    let source;
    if (this.suggestion.suggestionArea === SUGGESTION_SCOPE.CLASS_ACTIVITY) {
      source = PLAYER_EVENT_SOURCE.DAILY_CLASS;
    } else if (this.suggestion.suggestionArea === SUGGESTION_SCOPE.COURSE_MAP) {
      source = PLAYER_EVENT_SOURCE.COURSE_MAP;
    } else if (this.suggestion.suggestionArea === SUGGESTION_SCOPE.PROFICIENCY) {
      source = PLAYER_EVENT_SOURCE.MASTER_COMPETENCY;
    }
    return source;
  }

  /**
   * @function addSuggestedPath
   * Method to add Suggested Path
   */
  public addSuggestedPath() {
    const userId = this.sessionService.userSession.user_id;
    const mapContext = {
      ctx_user_id: userId,
      ctx_class_id: this.suggestion.classId,
      ctx_course_id: this.suggestion.courseId,
      ctx_lesson_id: this.suggestion.lessonId,
      ctx_path_id: this.suggestion.ctxPathId,
      ctx_path_type: this.suggestion.ctxPathType,
      ctx_collection_id: this.suggestion.collectionId,
      ctx_unit_id: this.suggestion.unitId,
      suggested_content_type: this.suggestion.suggestedContentType,
      suggested_content_id: this.suggestion.suggestedContentId,
      suggested_content_subtype: this.suggestion.isCollection ? 'signature-collection' : 'signature-assessment'
    };
    return this.navigateProvider.fetchSystemSuggestionPathId(mapContext);
  }
}
