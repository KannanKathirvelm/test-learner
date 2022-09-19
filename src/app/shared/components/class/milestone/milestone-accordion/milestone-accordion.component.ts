import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { pullDownAnimation } from '@app/shared/animations/pull-down';
import { pullUpAnimation } from '@app/shared/animations/pull-up';
import { MilestoneLessonReportComponent } from '@app/shared/components/milestone-lesson-report/milestone-lesson-report.component';
import { EVENTS } from '@app/shared/constants/events-constants';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ASSESSMENT, COLLECTION, DEPENDENT_LESSON_SUGGESTION_EVENTS, PATH_TYPES, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { routerPath } from '@shared/constants/router-constants';
import { LessonModel } from '@shared/models/lesson/lesson';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { MilestoneAlternatePathModel, MilestoneModel } from '@shared/models/milestone/milestone';
import { PortfolioProvider } from '@shared/providers/apis/portfolio/portfolio';
import { CollectionService } from '@shared/providers/service/collection/collection.service';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { ModalService } from '@shared/providers/service/modal.service';
import { ReportService } from '@shared/providers/service/report/report.service';
import { Route0Service } from '@shared/providers/service/route0/route0.service';
import { getObjectCopy } from '@shared/utils/global';
import { collapseAnimation } from 'angular-animations';
import axios from 'axios';

@Component({
  selector: 'milestone-accordion',
  templateUrl: './milestone-accordion.component.html',
  styleUrls: ['./milestone-accordion.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class MilestoneAccordionComponent implements OnInit, OnChanges {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public classId: string;
  @Input() public courseId: string;
  @Input() public milestones: Array<MilestoneModel>;
  @Input() public currentLocation: MilestoneLocationModel;
  @Input() public frameworkCode: string;
  @Input() public isHideInfo: boolean;
  @Input() public disablePlay: boolean;
  @Input() public disableDefaultLessonToggle: boolean;
  @Input() public isToggleRescopedInfo: boolean;
  @Input() public isReportView: boolean;
  @Input() public subjectCode: string;
  @Output() public playCollection = new EventEmitter();
  @Output() public openMilestoneReport: EventEmitter<MilestoneModel> = new EventEmitter();
  @Output() public scrollToCollection: EventEmitter<number> = new EventEmitter();
  @Input() public diagnosticDetails: any;
  @Input() public isDiagnosticEnd: boolean;
  public isLessonLoading: boolean;
  public isCollectionLoading: boolean;
  public showAttempt: boolean;
  public milestoneList: Array<MilestoneModel>;
  public isCurrentMilestoneLoaded: boolean;
  public isCurrentCollectionLoaded: boolean;
  public lastPlayedCollectionId: string;
  public showFullCourse: boolean;
  public currentLessonExpandedIndex: number;
  public isAllContentsAreRescoped: boolean;
  public initialPerformance: number;
  public showDefaultExpanded: boolean;
  public isLearner: boolean;
  public milestoneRescopedMsg: string;
  private readonly STATUS_OPEN = 'open';
  private readonly STATUS_CLOSE = 'close';
  public isLessonSuggestionSkipped: boolean;
  public noSuggestedLesson: boolean;
  public isRoutePathView = false;
  @Input() public tenantSettings: TenantSettingsModel;

  constructor(
    private route0Service: Route0Service,
    private modalService: ModalService,
    private milestoneService: MilestoneService,
    private collectionService: CollectionService,
    private router: Router,
    private reportService: ReportService,
    private elementRef: ElementRef,
    private translate: TranslateService,
    private competencyService: CompetencyService,
    private portfolioProvider: PortfolioProvider,
    private modalCtrl: ModalController,
    private parseService: ParseService
  ) {
    this.showFullCourse = false;
    this.showAttempt = false;
    this.isCurrentCollectionLoaded = false;
    this.initialPerformance = 0;
    this.milestoneRescopedMsg = environment.APP_LEARNER ? this.translate.instant('MILESTONE_RESCOPED_CONTENT_MSG') : this.translate.instant('MILESTONE_RESCOPED_WARD_CONTENT_MSG');
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.isLearner = environment.APP_LEARNER;
    this.milestoneList = [...this.milestones];
    const nonRescopedMilestoneList = this.milestoneList.filter((milestone) => {
      return !milestone.isRescoped;
    });
    nonRescopedMilestoneList.forEach((milestone, index) => {
      milestone.sequenceId = index + 1;
      return milestone;
    });
    const uiElementVisibilitySettings  = this.tenantSettings.uiElementVisibilitySettings;
    this.isRoutePathView = uiElementVisibilitySettings ? uiElementVisibilitySettings.isLearningJourneyPathView : true;
    this.isToggleRescopedInfo = true;
    this.handleRescopedMilestone();
    this.checkCourseState();
    this.parseService.trackEvent(EVENTS.VIEW_MILESTONE);
  }

  public ngOnChanges(changes: SimpleChanges) {
    const milestones = this.milestones || [];
    if (changes.currentLocation && changes.currentLocation.currentValue && milestones) {
      const currentMilestoneId = changes.currentLocation.currentValue.milestoneId;
      const currentLessonId = changes.currentLocation.currentValue.lessonId;
      const currentUnitId = changes.currentLocation.currentValue.unitId;
      const currentItemIsRoute0 = changes.currentLocation.currentValue.pathType === PATH_TYPES.ROUTE;
      const currentMilestone = currentItemIsRoute0 ? this.findRoute0CurrentMilestone(currentUnitId, currentLessonId)
        : this.milestones.find((milestone) => {
          return milestone.milestoneId === currentMilestoneId;
        });
      if (currentMilestone) {
        this.showDefaultExpanded = false;
        currentMilestone.isCurrentMilestone = true;
        this.lastPlayedCollectionId =
          changes.currentLocation.currentValue.collectionId;
        // Expand the selected lesson from the GPS MAP
        this.milestoneList = [...this.milestones];
        const milestoneIndex = this.milestoneList.findIndex((milestone) => milestone.milestoneId === currentMilestoneId);
        const selectedMilestone = this.milestoneList[milestoneIndex];
        if (selectedMilestone && selectedMilestone.lessons) {
          selectedMilestone.lessons.forEach((lesson, lessonIndex) => {
            if (lesson.lessonId === currentLessonId) {
              lesson.isCurrentLesson = true;
              setTimeout(() => {
                this.onExpandLesson(milestoneIndex, lessonIndex);
              }, 1000);
            } else {
              lesson.isCurrentLesson = false;
            }
          });
        }
      }
    } else if (changes.milestones && changes.milestones.currentValue && !changes.milestones.firstChange) {
      this.milestoneList = [...this.milestones];
    } else {
      this.showDefaultExpanded = true;
    }
  }

  /**
   * @function checkCourseState
   * This method is used to check the full course state for the milestone
   */
  private async checkCourseState() {
    const showFullCourse = await this.milestoneService.getFullCourseState(this.classId);
    this.showFullCourse = showFullCourse || this.isReportView;
    if (this.showFullCourse) {
      this.handleFullCourse();
    }
  }

  /**
   * @function onOpenMilestoneReport
   * This method is used to open milestone report
   */
  public onOpenMilestoneReport(event, milestone) {
    event.stopPropagation();
    this.openMilestoneReport.emit(milestone);
  }

  /**
   * @function onShowAttemptInfo
   * This method is used to show no. of attempts made by the student
   */
  public onShowAttemptInfo(event, collection, lesson, milestone) {
    event.stopPropagation();
    collection.isInfoOpen = !collection.isInfoOpen;
    if (!collection.activityAttempts) {
      this.portfolioProvider.fetchAllAttemptsByItem(collection.id).then((attemptsListResponse) => {
        collection.activityAttempts = attemptsListResponse.usageData;
      });
    }
  }

  /**
   * @function toggleRescopedInfo
   * This method is used to toggle the rescoped info
   */
  public toggleRescopedInfo() {
    this.isToggleRescopedInfo = !this.isToggleRescopedInfo;
  }

  /**
   * @function handleRescopedMilestone
   * This method is used to handle the rescoped milestone
   */
  private handleRescopedMilestone() {
    const rescopedContent = this.milestoneList.filter((milestone) => {
      return milestone.isRescoped;
    });
    this.isAllContentsAreRescoped = rescopedContent.length === this.milestoneList.length && !this.isReportView;
  }

  /**
   * @function onToggleToShowFullCourse
   * This method is used to toggle the full course
   */
  public async onToggleToShowFullCourse(event) {
    this.showFullCourse = event.detail.checked;
    if (!this.isReportView) {
      this.milestoneService.setFullCourseState(this.classId, this.showFullCourse);
    }
    if (this.showFullCourse) {
      this.handleFullCourse();
    }
  }

  /**
   * @function handleFullCourse
   * This method is used to handle the full course
   */
  private handleFullCourse() {
    this.milestones.forEach((milestone, milestoneIndex) => {
      const lessons = milestone.lessons || [];
      lessons.forEach((lesson, lessonIndex) => {
        if (lesson.collections) {
          this.handleCollectionPath(milestoneIndex, lessons, lessonIndex, lesson.collections);
        }
      });
      this.handleLessonsPath(lessons, milestoneIndex);
    });
  }

  /**
   * @function findRoute0CurrentMilestone
   * This method is used to find out milestone based on unit and lesson ids
   */
  private findRoute0CurrentMilestone(unitId, lessonId) {
    return this.milestones.find((milestone) => {
      const lesson = milestone.lessons.find((lessonItem) => {
        return lessonItem.unitId === unitId && lessonItem.lessonId === lessonId;
      });
      return lesson !== null;
    });
  }

  /**
   * @function onOpenMilestonePanel
   * This method is trigger when user clicks on milestone
   */
  public onOpenMilestonePanel(milestoneIndex, isRoute0) {
    const milestone = this.milestoneList[milestoneIndex];
    if (isRoute0 && !milestone.isLessonLoaded || milestone.isUnit0) {
      this.isLessonLoading = true;
      this.milestoneService.fetchLessonsPerformance(this.classId,
        milestone.milestoneId,
        this.courseId,
        this.frameworkCode,
        milestone.lessons).then(() => {
          milestone.isLessonLoaded = true;
          this.handleLessonsPath(milestone.lessons, milestoneIndex);
          this.isLessonLoading = false;
        });
    } else {
      if (!milestone.lessons) {
        this.isLessonLoading = true;
        axios.all([
          this.fetchLessons(milestone, milestoneIndex),
          this.fetchMilestoneAlternatePath(milestone.milestoneId),
          this.fetchMilestoneDependentLesson(milestone.milestoneId)
        ]).then(axios.spread((lessons: Array<LessonModel> = [], diagnosticLessons: Array<MilestoneAlternatePathModel> = [], depdendentLessons: Array<MilestoneAlternatePathModel> = []) => {
          this.parseDiagnosticLessons(diagnosticLessons, lessons);
          this.parseDependentLessons(depdendentLessons, lessons);
          milestone.lessons = lessons;
          this.handleLessonsPath(lessons, milestoneIndex);
          this.isLessonLoading = false;
        }));
      }
    }
  }

  /**
   * @function parseDependentLessons
   * Help to merge the dependent lessons to the milestone lessons
   */
  public parseDependentLessons(dependentLessons, lessons) {
    const dependentPaths = dependentLessons || [];
    const isPathRouteView = this.isRoutePathView;
    dependentPaths.forEach(depLesson => {
      const activeLesson = lessons.find(lesson => lesson.lessonId === depLesson.cxtLessonId);
      if (activeLesson) {
        const newLessonItem = getObjectCopy(activeLesson);
        Object.assign(newLessonItem, {
          lessonId: depLesson.lessonId,
          collections: depLesson.collections,
          lessonTitle: depLesson.lessonTitle,
          txDomainName: activeLesson.tx_domain_name,
          performance: depLesson.performance,
          isDiagnosticLesson: true,
          unitId: activeLesson.unitId,
          isDepdentLesson: true
        });
        if (isPathRouteView) {
          const routeContents = activeLesson.rerouteContent || [];
          activeLesson.rerouteContent = [
            ...routeContents,
            { ...newLessonItem }
          ];
        } else {
          lessons.splice(lessons.indexOf(activeLesson), 0, newLessonItem);
          activeLesson.prevLeCollHasSuggsType = 'system';
          activeLesson.diagnosticEnd = true;
        }
      }
    });
  }

  /**
   * @function parseDiagnosticLessons
   * This method is used to parse diagnostic lessons
   */
  public parseDiagnosticLessons(diagnosticLessons, lessons) {
    const diagnosticDetails = this.diagnosticDetails;
    const isDiagnosticEnd = this.isDiagnosticEnd;
    if (diagnosticLessons.length) {
      if (isDiagnosticEnd && diagnosticDetails) {
        diagnosticLessons = diagnosticLessons.filter((diagnosticLesson) => {
          return diagnosticLesson.diagnosticStats.session_id === diagnosticDetails.session_id;
        });
      }
      diagnosticLessons.forEach((domainItem) => {
        let lessonSuggestions = domainItem.lessonSuggestions || [];
        const activeDomains = lessons.filter((lesson) => {
          const context = domainItem.context;
          return lesson.txDomainCode === context.domainCode;
        });
        if (activeDomains.length) {
          const activeLesson = activeDomains[0];
          let diagnosticLessonSugg = [];
          if (activeLesson) {
            const diagnosticStats = domainItem.diagnosticStats;
            if (diagnosticStats && !this.isRoutePathView) {
              const sugesstionStatusItem = {
                lessonId: null,
                lessonTitle: 'Diagnostic',
                txDomainName: activeLesson.txDomainName,
                isDiagnostic: true,
                diagnosticStatus: diagnosticStats.status,
                firstCollHasSuggsType: 'system'
              };
              diagnosticLessonSugg.push(sugesstionStatusItem);
            }
            if (lessonSuggestions.length) {
              lessonSuggestions = lessonSuggestions.filter((item) => {
                return !lessons.find((lesson) => lesson.lessonId === item.lessonId);
              });
              const noRescopeList = lessonSuggestions.filter((item) => !item.rescope);
              if (diagnosticDetails && !noRescopeList.length) {
                this.isLessonSuggestionSkipped = true;
              }
              lessonSuggestions = lessonSuggestions.map((lessonSuggetion) => {
                const newLessonItem = getObjectCopy(activeLesson);
                lessonSuggetion.collections.forEach((collection) => {
                  Object.assign(collection, {
                    lessonContext: domainItem.context,
                    lessonStats: diagnosticStats
                  });
                });
                Object.assign(newLessonItem, {
                  lessonId: lessonSuggetion.lessonId,
                  collections: lessonSuggetion.collections,
                  lessonTitle: lessonSuggetion.title,
                  txDomainName: activeLesson.tx_domain_name,
                  performance: lessonSuggetion.performance,
                  isDiagnosticLesson: true,
                  unitId: domainItem.context.ctxUnitId
                });
                return newLessonItem;
              });
              diagnosticLessonSugg = diagnosticLessonSugg.concat(lessonSuggestions);
            } else {
              if (diagnosticDetails) {
                this.noSuggestedLesson = true;
              }
            }
            if (!this.isRoutePathView) {
              activeLesson.prevLeCollHasSuggsType = 'system';
              activeLesson.diagnosticEnd = true;
            }
            if (activeLesson.rescope) {
              const activeLessonIndex = lessons.indexOf(activeLesson);
              const nextLessonItem = lessons.find(
                (item, index) => index > activeLessonIndex && !item.rescope
              );
              if (nextLessonItem && !this.isRoutePathView) {
                nextLessonItem.prevDiagnosticEnd = true;
              }
            }
            if (this.isRoutePathView) {
              activeLesson.rerouteContent = [...(activeLesson.rerouteContent || []), ...diagnosticLessonSugg];
            } else {
              lessons.splice(lessons.indexOf(activeLesson), 0, ...diagnosticLessonSugg);
            }
          }
        }
      });
    }
  }

  /**
   * @function fetchMilestoneAlternatePath
   * This method is used to fetch milestone alternate path
   */
  public fetchMilestoneAlternatePath(milestoneId) {
    return this.milestoneService.fetchMilestoneAlternatePath(milestoneId, this.classId, this.courseId, this.frameworkCode);
  }

  /**
   * @function fetchMilestoneDependentLesson
   * This method is used to fetch milestone dependent lesson
   */
   public fetchMilestoneDependentLesson(milestoneId) {
    return this.milestoneService.fetchMilestoneDependentLesson(milestoneId, this.classId, this.courseId, this.frameworkCode);
  }

  /**
   * @function onOpenLessonPanel
   * This method is trigger when user clicks on lesson
   */
  public onOpenLessonPanel(milestoneIndex, lessonIndex, lesson, isRoute0) {
    const firstCollection = lesson.collections ? lesson.collections[0] : null;
    lesson.isFirstSuggestedCollection =
      firstCollection && firstCollection.isSuggestedContent;
    this.currentLessonExpandedIndex = lessonIndex;
    const lessons = this.milestoneList[milestoneIndex].lessons;
    this.updateLessonPath(milestoneIndex, lessonIndex, this.STATUS_OPEN);
    if (isRoute0 && !lesson.isCollectionLoaded) {
      this.isCollectionLoading = true;
      axios.all([
        this.collectionService.fetchCollectionPerformance(
          this.classId,
          this.courseId,
          lesson.lessonId,
          lesson.unitId,
          ASSESSMENT,
          lesson.collections
        ),
        this.collectionService.fetchCollectionPerformance(
          this.classId,
          this.courseId,
          lesson.lessonId,
          lesson.unitId,
          COLLECTION,
          lesson.collections
        ),
        this.route0Service.fetchRoute0Suggestions(
          this.classId,
          this.courseId,
          lesson.unitId,
          lesson.lessonId,
          lesson.collections
        )
      ]).then(axios.spread(() => {
        lesson.isCollectionLoaded = true;
        this.handleCollectionPath(milestoneIndex, lessons, lessonIndex, lesson.collections);
        this.isCollectionLoading = false;
      }));
    } else {
      if (!lesson.collections && lesson.unitId) {
        this.isCollectionLoading = true;
        this.fetchCollections(lesson, lesson.unitId).then((collections) => {
          lesson.collections = collections;
          this.handleCollectionPath(milestoneIndex, lessons, lessonIndex, lesson.collections);
          this.isCollectionLoading = false;
          if (this.isRoutePathView) {
            this.splitSignatureContent(lesson);
          }
          lesson.isCollectionPerformanceLoaded = true;
        });
      } else {
        if (!lesson.isCollectionPerformanceLoaded && lesson.unitId) {
          this.collectionService.fetchCollectionPerformance(this.classId, this.courseId, lesson.lessonId, lesson.unitId, ASSESSMENT, lesson.collections);
          this.collectionService.fetchCollectionPerformance(this.classId, this.courseId, lesson.lessonId, lesson.unitId, COLLECTION, lesson.collections);
          lesson.isCollectionPerformanceLoaded = true;
        }
      }
    }
  }
  /**
   * @function splitSignatureContent
   * This method is used to split the signature content
   */
  private splitSignatureContent(lesson) {
    const collections = lesson.collections;
    const signatureContent = collections.filter(content => content.pathType === 'system');
    const lessonContent = collections.filter(content => content.pathType !== 'system');
    lesson.collections = lessonContent;
    lesson.rerouteContent = [...signatureContent, ...(lesson.rerouteContent || [])];
  }

  /**
   * @function onCloseMilestonePanel
   * This method is trigger when panel closed
   */
  public onCloseMilestonePanel() {
    this.showMilestonePath();
  }

  /**
   * @function showMilestonePath
   * This method is used to show milestone path line
   */
  public showMilestonePath() {
    const milestoneElements = this.elementRef.nativeElement.querySelectorAll(
      '.milestone-panel'
    );
    milestoneElements.forEach((milestoneElement) => {
      const svgElement = milestoneElement.querySelector(
        '.milestone-icon-downward-line svg'
      );
      svgElement.style.display = 'block';
    });
  }

  /**
   * @function onExpandLesson
   * This method is trigger when lesson expands
   */
  public onExpandLesson(milestoneIndex, lessonIndex) {
    const milestoneElement = this.elementRef.nativeElement.querySelector(
      `.milestone-${milestoneIndex}`
    );
    const lessonElement = milestoneElement.querySelector(
      `.lesson-${lessonIndex}`
    );
    if (lessonElement) {
      const lessonElementPositions = lessonElement.getBoundingClientRect();
      const offsetTop =
        lessonElementPositions.top -
        milestoneElement.getBoundingClientRect().top -
        lessonElement.clientHeight;
      this.scrollToCollection.emit(offsetTop);
    }
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM);
  }

  /**
   * @function onCloseLessonPanel
   * This method will trigger when user close lesson panel
   */
  public onCloseLessonPanel(milestoneIndex, lessonIndex, lesson) {
    lesson.isFirstSuggestedCollection = false;
    this.updateLessonPath(milestoneIndex, lessonIndex, this.STATUS_CLOSE);
    if (lessonIndex === this.currentLessonExpandedIndex) {
      this.currentLessonExpandedIndex = null;
    }
  }

  /**
   * @function onPlaySuggestions
   * This method is used to play suggestions
   */
  public onPlaySuggestions(playerContext) {
    const {collection, lesson, milestone} = playerContext;
    if (collection) {
      this.onPlay(collection, lesson, milestone);
    } else {
      this.onClickPlay(lesson, milestone);
    }
  }

  /**
   * @function onPlay
   * This method is trigger when user clicks on play
   */
  public onPlay(collection, lesson, milestone) {
    if (!this.disablePlay) {
      this.modalService.dismiss();
      const collectionId = collection.id;
      const courseId = this.courseId;
      const lessonId = lesson.lessonId;
      const unitId = lesson.unitId;
      const classId = this.classId;
      const collectionType = collection.format;
      const source = PLAYER_EVENT_SOURCE.COURSE_MAP;
      const pathId = collection.pathId || collection.ctxPathId || 0;
      const pathType = collection.pathType || collection.ctxPathType || null;
      const milestoneId = milestone.milestoneId;
      const scoreInPercentage = collection.performance
        ? collection.performance.scoreInPercentage
        : null;
      const ctxPathId = collection.ctxPathId || 0;
      const ctxPathType = collection.ctxPathType || null;
      const playerUrl = routerPath('studyPlayer');
      const isDomainDiagnostic = collection && collection.lessonStats ? true : false;
      const sessionId = collection && collection.lessonStats && collection.lessonStats.session_id || null;
      const startingGrade = collection && collection.lessonContext && collection.lessonContext.gradeId || null;
      const startingDomain = collection && collection.lessonContext && collection.lessonContext.domainCode || null;
      this.playCollection.emit();
      const queryParams = {
        classId,
        collectionType,
        source,
        courseId,
        unitId,
        lessonId,
        collectionId,
        pathId,
        pathType,
        milestoneId,
        scoreInPercentage,
        ctxPathId,
        ctxPathType,
        isDomainDiagnostic,
        sessionId,
        startingDomain,
        startingGrade
      };
      if (lesson.isDepdentLesson) {
        queryParams['state'] = DEPENDENT_LESSON_SUGGESTION_EVENTS.start;
      }
      this.router.navigate([playerUrl], {
        queryParams
      });
    }
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_PLAY);
  }

  /**
   * @function onShowReport
   * This method is used to show report
   */
  public onShowReport(reportContext) {
    const {collection, lesson} = reportContext;
    if (collection) {
      const context = {
        collectionType: collection.format,
        collectionId: collection.id,
        contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
        classId: this.classId,
        courseId: this.courseId,
        unitId: lesson.unitId,
        lessonId: collection.lessonId || lesson.lessonId,
        performance: collection.performance,
        pathId: collection.pathId
      };
      this.reportService.showReport(context);
    } else {
      this.onShowLessonLevelReport(lesson);
    }
  }

  /**
   * @function showReport
   * This method is used to show report based on type
   */
  public showReport(event, collection, lesson) {
    event.stopPropagation();
    const context = {
      collectionType: collection.format,
      collectionId: collection.performance.collectionId,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: this.classId,
      courseId: this.courseId,
      unitId: lesson.unitId,
      lessonId: lesson.lessonId,
      performance: collection.performance,
      pathId: collection.pathId
    };
    this.reportService.showReport(context);
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_REPORT);
  }

  /**
   * @function onPreview
   * This method used to preview the student report by guardian
   */
  public onPreview(event, collection, lesson, milestone) {
    event.stopPropagation();
    const tenantSettings  = this.tenantSettings;
    if (!environment.APP_LEARNER) {
      if (tenantSettings && tenantSettings.enableGuardianCollectionPreview) {
        this.showPreview(true, collection, lesson);
      } else {
        if (collection.performance && collection.performance.scoreInPercentage !== null
          && collection.performance.timeSpent) {
          this.showReport(event, collection, lesson);
        }
      }
    } else {
      this.onPlay(collection, lesson, milestone);
    }
  }

  /**
   * @function showPreview
   * This method used to call report function based on type
   */
  public showPreview(isPreview, collection, lesson) {
    const context = {
      collectionType: collection.format,
      collectionId: collection.id,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: this.classId,
      courseId: this.courseId,
      unitId: lesson.unitId,
      lessonId: lesson.lessonId,
      performance: collection.performance,
      isPreview
    };
    this.reportService.showReport(context);
  }

  /**
   * @function fetchLessons
   * This method is used to get lessons of milestone
   */
  public fetchLessons(milestone, milestoneIndex) {
    return this.milestoneService.fetchLessonList(
      this.classId,
      milestone.milestoneId,
      this.courseId,
      this.frameworkCode
    );
  }

  /**
   * @function handleLessonsPath
   * This method is used to handle the lesson path
   */
  private handleLessonsPath(lessons, milestoneIndex) {
    const allLessons = lessons;
    lessons = this.showFullCourse ? lessons : lessons.filter(lesson => !lesson.isRescoped);
    const milestoneList = this.showFullCourse ? this.milestoneList : this.milestoneList.filter(milestone => !milestone.isRescoped);
    if (lessons && lessons.length) {
      this.findNextLessonIsDiagnostic(lessons);
      this.findFirstLessonIsDiagnostic(lessons, milestoneIndex);
      if (milestoneIndex === milestoneList.length - 1) {
        const lastIndex = lessons.length - 1;
        const lastLesson = lessons[lastIndex];
        lastLesson.isLastLesson = true;
      }
      if (this.currentLocation) {
        const currentLessonId = this.currentLocation.lessonId;
        const currentLesson = lessons.find(
          (lesson) => lesson.lessonId === currentLessonId
        );
        if (currentLesson) {
          currentLesson.isCurrentLesson = true;
        }
      }
      this.findLessonCompetencyStats(allLessons);
    }
  }

  public findFirstLessonIsDiagnostic(lessons, milestoneIndex) {
    const milestone = this.milestones[milestoneIndex];
    if (milestone) {
      if (lessons && lessons.length) {
        const firstLesson = lessons[0];
        milestone.isFirstLessonIsDiagnostic = !!firstLesson.isDiagnostic;
      }
    }
  }

  /**
   * @function findLessonCompetencyStats
   * This method is used to find lesson competency status
   */
  public findLessonCompetencyStats(lessons) {
    const lessonCompCodes = lessons.map((lesson) => {
      return lesson.txCompCode;
    }).filter((item) => item);
    if (lessonCompCodes.length) {
      this.competencyService.fetchCompletionStatus({
        classId: this.classId,
        competencyCodes: lessonCompCodes,
        subject: this.subjectCode
      }).then((statusResponse) => {
        lessons.forEach((lessonItem) => {
          const statusCode = statusResponse.find((item) => (item.competencyCode === lessonItem.txCompCode));
          if (statusCode) {
            lessonItem.status = statusCode.status;
          }
        });
      });
    }
  }

  /**
   * @function findCollectionCompetencyStats
   * This method is used to find collection competency status
   */
  public findCollectionCompetencyStats(collections) {
    let gutCodes = [];
    const collectionIds = collections.map((collection) => {
      return collection.id;
    });
    collections.forEach((collection) => {
      gutCodes = gutCodes.concat(collection.gutCodes || []);
    });
    if (gutCodes && gutCodes.length) {
      axios.all([
        this.competencyService.fetchCompletionStatus({
          classId: this.classId,
          competencyCodes: gutCodes,
          subject: this.subjectCode
        }),
        this.portfolioProvider.fetchItemsExits(collectionIds)
      ]).then(axios.spread((competencyStatus, itemExists) => {
        collections.find((collection) => {
          const competencyItem = competencyStatus.find((statusItem) => {
            return collection.gutCodes && collection.gutCodes.includes(statusItem.competencyCode);
          });
          if (competencyItem && itemExists[collection.id]) {
            collection.status = competencyItem.status;
            collection.isShowAttempts = itemExists[collection.id];
          }
        });
      }));
    }
  }

  /**
   * @function handleCollectionPath
   * This method is used to handle the collection path
   */
  private handleCollectionPath(milestoneIndex, lessons, lessonIndex, collections) {
    const lesson = lessons[lessonIndex];
    lessons = this.showFullCourse ? lessons : lessons.filter(lessonList => !lessonList.isRescoped);
    collections = this.showFullCourse ? collections : collections.filter(collection => !collection.isRescoped);
    lessonIndex = lessons.indexOf(lesson);
    if (collections && collections.length) {
      this.findLastCollectionInMilestone(
        milestoneIndex,
        lessons,
        lessonIndex,
        collections
      );
      this.findLastCollectionInLesson(collections);
      if (!this.isRoutePathView) {
        this.findNextCollectionIsSuggestion(collections);
        this.findFirstCollectionInLessonIsSuggestion(collections, lesson);
      }
      this.findCollectionCompetencyStats(collections);
      if (!this.isCurrentCollectionLoaded && this.currentLocation) {
        const currentCollectionId = this.currentLocation.collectionId;
        const currentCollection = collections.find(
          (collection) => collection.id === currentCollectionId
        );
        if (currentCollection) {
          currentCollection.isCurrentCollection = true;
          this.isCurrentCollectionLoaded = true;
          this.onExpandLesson(milestoneIndex, lessonIndex);
        }
      }
    }
  }

  /**
   * @function fetchCollections
   * This method is used to get collection list
   */
  public fetchCollections(lesson, unitId) {
    return this.collectionService
      .fetchCollectionList(
        this.classId,
        this.courseId,
        lesson.lessonId,
        unitId,
        [],
        lesson
      );
  }

  /**
   * @function updateLessonPath
   * This method is used to update the svg position based on accordion toggle
   */
  public updateLessonPath(milestoneIndex, lessonIndex, accordionStatus) {
    if (lessonIndex) {
      const prevLessonElement = this.elementRef.nativeElement.querySelector(
        `.milestone-${milestoneIndex} .lesson-${lessonIndex - 1}`
      );
      const prevSvgElement = prevLessonElement.querySelector(
        '.lesson-icon .lesson-icon-downward-line svg'
      );
      if (accordionStatus === this.STATUS_OPEN) {
        prevSvgElement.classList.add('next-lesson-expanded');
      } else {
        prevSvgElement.classList.remove('next-lesson-expanded');
      }
    } else {
      const currentMilestoneElement = this.elementRef.nativeElement.querySelector(
        `.milestone-${milestoneIndex}`
      );
      const currentSvgElement = currentMilestoneElement.querySelector(
        '.milestone-icon .milestone-icon-downward-line svg'
      );
      if (accordionStatus === this.STATUS_OPEN) {
        currentSvgElement.classList.add('lesson-expanded');
      } else {
        currentSvgElement.classList.remove('lesson-expanded');
      }
    }
  }

  /**
   * @function findLastCollectionInMilestone
   * This method is used to find last collection in the milestone
   */
  public findLastCollectionInMilestone(
    milestoneIndex,
    lessons,
    lessonIndex,
    collections
  ) {
    const milestoneList = this.showFullCourse ? this.milestoneList : this.milestoneList.filter(milestone => !milestone.isRescoped);
    if (milestoneIndex === milestoneList.length - 1) {
      const lastLessonIndex = lessons.length - 1;
      if (lastLessonIndex === lessonIndex) {
        const lastCollectionIndex = collections.length - 1;
        const lastCollection = collections[lastCollectionIndex];
        lastCollection.isLastCollectionInMilestone = true;
      }
    }
  }

  /**
   * @function findLastCollectionInLesson
   * This method is used to find last collection in the lesson
   */
  public findLastCollectionInLesson(collections) {
    const lastCollectionIndex = collections.length - 1;
    const lastCollection = collections[lastCollectionIndex];
    lastCollection.isLastCollectionInLesson = true;
  }

  public findNextLessonIsDiagnostic(lessons) {
    lessons.map((lesson, index) => {
      const nextIndex = index + 1;
      const nextLesson = lessons[nextIndex];
      if (nextIndex <= lessons.length - 1) {
        if (nextLesson.isDiagnostic) {
          lesson.isNextDiagnosticLesson = true;
        }
      }
    });
  }

  /**
   * @function findNextCollectionIsSuggestion
   * This method is used to find next collection is suggested item
   */
  public findNextCollectionIsSuggestion(collections) {
    collections.map((collection, index) => {
      const nextIndex = index + 1;
      const nextCollection = collections[nextIndex];
      if (nextIndex <= collections.length - 1) {
        if (nextCollection.isSuggestedContent) {
          collection.isNextSuggestedCollection = true;
          collection.isNextSystemSuggested =
            nextCollection.pathType === PATH_TYPES.SYSTEM;
          collection.isNextTeacherSuggested =
            nextCollection.pathType === PATH_TYPES.TEACHER;
        }
        collection.nextCollectionPathType = nextCollection.pathType;
      } else {
        collection.nextCollectionPathType = collection.isSuggestedContent ? null : collection.pathType;
      }
      if (collection.isSuggestedContent) {
        collection.isSystemSuggested = collection.pathType === PATH_TYPES.SYSTEM;
        collection.isTeacherSuggested =
          collection.pathType === PATH_TYPES.TEACHER;
      }
      return collection;
    });
  }

  /**
   * @function findFirstCollectionInLessonIsSuggestion
   * This method is used to find first collection in lesson is suggested item
   */
  public findFirstCollectionInLessonIsSuggestion(collections, lesson) {
    const firstCollection = collections[0];
    if (firstCollection.isSuggestedContent && !this.isRoutePathView) {
      lesson.isFirstSuggestedCollection =
        firstCollection.isSuggestedContent || true;
      lesson.isFirstSystemSuggested =
        firstCollection.pathType === PATH_TYPES.SYSTEM;
      lesson.isFirstTeacherSuggested =
        firstCollection.pathType === PATH_TYPES.TEACHER;
      lesson.firstSuggestedPathType = firstCollection.pathType;
    }
  }

  /**
   * @function onClickPlay
   * This method is trigger when user clicks on play
   */
  public onClickPlay(lesson, milestone) {
    if (this.isLearner) {
      let collection = lesson.collections.find((collectionItem) => {
        return collectionItem.id === this.lastPlayedCollectionId;
      });
      collection = collection || lesson.collections[0];
      if (collection) {
        this.onPlay(collection, lesson, milestone);
      }
    }
  }

  /**
   * @function onShowLessonLevelReport
   * This method is used to show lesson report
   */
  public onShowLessonLevelReport(lesson) {
    this.modalCtrl.create({
      component: MilestoneLessonReportComponent,
      cssClass: 'lesson-report-modal',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: {
        lessonInfo: lesson,
        classId: this.classId,
        courseId: this.courseId,
        unitId: lesson.unitId,
        lessonId: lesson.lessonId
      }
    }).then((modal) => {
      modal.present();
    });

  }
}
