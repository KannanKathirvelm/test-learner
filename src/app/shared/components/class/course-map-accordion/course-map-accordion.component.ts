import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { pullDownAnimation } from '@app/shared/animations/pull-down';
import { pullUpAnimation } from '@app/shared/animations/pull-up';
import { EVENTS } from '@app/shared/constants/events-constants';
import { SkippedContents } from '@app/shared/models/milestone/milestone';
import { ClassService } from '@app/shared/providers/service/class/class.service';
import { CourseService } from '@app/shared/providers/service/course/course.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { ModalController } from '@ionic/angular';
import { CourseMapLessonReportComponent } from '@shared/components/course-map-lesson-report/course-map-lesson-report.component';
import { PATH_TYPES, PLAYER_EVENT_SOURCE, SETTINGS } from '@shared/constants/helper-constants';
import { routerPath } from '@shared/constants/router-constants';
import { UnitSummaryModel } from '@shared/models/course-map/course-map';
import { CourseContentVisibility } from '@shared/models/course/course';
import { UnitLessonSummaryModel } from '@shared/models/lesson/lesson';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { CollectionService } from '@shared/providers/service/collection/collection.service';
import { LessonService } from '@shared/providers/service/lesson/lesson.service';
import { ReportService } from '@shared/providers/service/report/report.service';
@Component({
  selector: 'nav-course-map-accordion',
  templateUrl: './course-map-accordion.component.html',
  styleUrls: ['./course-map-accordion.component.scss'],
})
export class CourseMapAccordionComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public classId: string;
  @Input() public courseId: string;
  @Input() public unitList: Array<UnitSummaryModel>;
  @Input() public currentLocation: MilestoneLocationModel;
  @Input() public reportViewMode: boolean;
  @Input() public contentVisibility: CourseContentVisibility;
  @Input() public tenantSettings: TenantSettingsModel;
  @Output() public scrollToView: EventEmitter<number> = new EventEmitter();
  public isUnitLoaded: boolean;
  public isLessonLoaded: boolean;
  public isCollectionLoaded: boolean;
  public isCurrentUnitLoaded: boolean;
  public isCurrentLessonLoaded: boolean;
  public isCurrentCollectionLoaded: boolean;
  public showDefaultExpanded: boolean;
  public lastPlayedCollectionId: string;
  public isLearner: boolean;
  public hasUnit0: boolean;
  public lessonLabelValue: boolean;
  public isAllContentsAreRescoped: boolean;
  public skippedContents: SkippedContents;
  public isHideSeqNumber: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router,
    private reportService: ReportService,
    private lessonService: LessonService,
    private collectionService: CollectionService,
    private elementRef: ElementRef,
    private modalCtrl: ModalController,
    private classService: ClassService,
    private courseService: CourseService,
    private parseService: ParseService
  ) {
    this.isCurrentUnitLoaded = false;
    this.isCurrentLessonLoaded = false;
    this.isCurrentCollectionLoaded = false;
    this.lessonLabelValue = false;
  }

  // -------------------------------------------------------------------------
  // lifecycle methods

  public ngOnChanges(changes: SimpleChanges) {
    if (this.unitList) {
      const skippedContents = this.unitList.filter((item) => item.isRescoped).length;
      this.isAllContentsAreRescoped = skippedContents === this.unitList.length ? true : false;
    }

    const units = (changes.units && changes.units.currentValue) || [];
    if (
      changes.currentLocation &&
      changes.currentLocation.currentValue &&
      units &&
      !this.isCurrentUnitLoaded && this.unitList
    ) {
      const currentUnitId = changes.currentLocation.currentValue.unitId;
      const currentUnit = this.unitList.find(
        (unit) => unit.unitId === currentUnitId
      );
      if (currentUnit) {
        this.showDefaultExpanded = false;
        this.isCurrentUnitLoaded = true;
        currentUnit.isCurrentUnit = true;
        this.lastPlayedCollectionId = changes.currentLocation.currentValue.collectionId;
      }
    } else {
      this.showDefaultExpanded = true;
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.fetchSkippedContents();
    this.isLearner = environment.APP_LEARNER;
    if (this.unitList) {
      this.hasUnit0 = !!this.unitList.filter((item) => item.isUnit0).length;
    }
    this.lessonLabelValue = this.tenantSettings && this.tenantSettings.uiElementVisibilitySettings && this.tenantSettings.uiElementVisibilitySettings.lessonLabelCourseMap ? true : false;
    this.parseService.trackEvent(EVENTS.VIEW_COURSE_MAP);
    this.isHideSeqNumber = this.tenantSettings && this.tenantSettings.uiElementVisibilitySettings && this.tenantSettings.uiElementVisibilitySettings.hideCourseMapViewContentLabelSeq;
  }

  /**
   * @function showPreview
   * This method used to call report function based on type
   */
  public showPreview(isPreview, unit, lesson, collection) {
    const context = {
      collectionType: collection.format,
      collectionId: collection.id,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: this.classId,
      courseId: this.courseId,
      unitId: unit.unitId,
      lessonId: lesson.lessonId,
      performance: collection.performance,
      isPreview
    };
    this.reportService.showReport(context);
  }

  /**
   * @function onOpenUnitPanel
   * This method is used to open unit panel
   */
  public onOpenUnitPanel(unitIndex, unitId) {
    this.fetchUnitLessons(unitIndex, unitId);
  }

  /**
   * @function onOpenLessonPanel
   * This method is used to open lesson panel
   */
  public onOpenLessonPanel(unitIndex, unitId, lessonIndex, lessonId) {
    this.fetchCollections(unitIndex, unitId, lessonIndex, lessonId);
  }

  /**
   * @function onPlay
   * This method is trigger when user clicks on play
   */
  public onPlay(event, unit, lesson, collection?) {
    const tenantSettings = this.tenantSettings;
    if (this.isLearner) {
      if (!this.reportViewMode) {
        const collectionId = collection ? collection.id : null;
        const courseId = this.courseId;
        const lessonId = lesson.lessonId;
        const unitId = unit.unitId;
        const classId = this.classId;
        const collectionType = collection ? collection.format : null;
        const source = PLAYER_EVENT_SOURCE.COURSE_MAP;
        const pathId = collection.pathId || collection.ctxPathId || 0;
        const pathType = collection.pathType || collection.ctxPathType || null;
        const scoreInPercentage = collection && collection.performance
          ? collection.performance.scoreInPercentage
          : null;
        const ctxPathId = collection.ctxPathId || 0;
        const ctxPathType = collection.ctxPathType || null;
        const playerUrl = routerPath('studyPlayer');
        this.router.navigate([playerUrl], {
          queryParams: {
            classId,
            collectionType,
            source,
            courseId,
            unitId,
            lessonId,
            collectionId,
            pathId,
            pathType,
            scoreInPercentage,
            ctxPathId,
            ctxPathType
          },
        });
      } else {
        this.showCollectionReport(event, unit, lesson, collection);
      }
    } else {
       if (tenantSettings && tenantSettings.enableGuardianCollectionPreview) {
         this.showPreview(true, unit, lesson, collection);
      } else {
        if (collection.performance && collection.performance.scoreInPercentage !== null
          && collection.performance.timeSpent) {
            this.showCollectionReport(event, unit, lesson, collection);
        }
      }
    }
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_PLAY);
  }

  /**
   * @function showCollectionReport
   * This method is used to show collection report
   */
  public showCollectionReport(event, unit, lesson, collection) {
    event.stopPropagation();
    const context = {
      collectionType: collection.format,
      collectionId: collection.id,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: this.classId,
      courseId: this.courseId,
      unitId: unit.unitId,
      lessonId: lesson.lessonId,
      performance: collection.performance,
    };
    this.reportService.showReport(context);
  }

  /**
   * @function onExpandUnit
   * This method is trigger when unit expands
   */
  public onExpandUnit(unitIndex) {
    const containerElement = this.elementRef.nativeElement.querySelector(
      `.coursemap-container`
    );
    const unitElement = this.elementRef.nativeElement.querySelector(
      `.unit-${unitIndex}`
    );
    const unitElementPostions = unitElement.getBoundingClientRect();
    const offsetTop =
      unitElementPostions.top -
      containerElement.getBoundingClientRect().top -
      unitElement.clientHeight;
    this.scrollToView.emit(offsetTop);
    this.parseService.trackEvent(EVENTS.CLICK_LJ_UNIT);
  }

  /**
   * @function onExpandLesson
   * This method is trigger when lesson expands
   */
  public onExpandLesson(unitIndex, lessonIndex) {
    const containerElement = this.elementRef.nativeElement.querySelector(
      `.coursemap-container`
    );
    const unitElement = this.elementRef.nativeElement.querySelector(
      `.unit-${unitIndex}`
    );
    const lessonElement = unitElement.querySelector(
      `.lesson-${lessonIndex}`
    );
    const lessonElementPositions = lessonElement.getBoundingClientRect();
    const offsetTop = (lessonElementPositions.top - lessonElement.clientHeight
      - containerElement.getBoundingClientRect().top);
    this.scrollToView.emit(offsetTop);
    this.parseService.trackEvent(EVENTS.CLICK_LJ_LESSON);
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchUnitLessons
   * This method used to fetch lessons
   */
  public fetchUnitLessons(unitIndex, unitId) {
    const unit = this.unitList[unitIndex];
    const unit0Lessons = unit.isUnit0 ? unit.lessons : [];
    if (!unit.lessons || unit.isUnit0) {
      this.isLessonLoaded = false;
      this.lessonService.fetchUnitLessonList(this.classId, this.courseId, unitId, unit0Lessons).then((response: Array<UnitLessonSummaryModel>) => {
        const lessons = response;
        unit.lessons = lessons;
        if (lessons && lessons.length) {
          if (!this.isCurrentLessonLoaded && this.currentLocation) {
            const currentLessonId = this.currentLocation.lessonId;
            const currentLesson = lessons.find(
              (lesson) => lesson.lessonId === currentLessonId
            );
            if (currentLesson) {
              currentLesson.isCurrentLesson = true;
              this.isCurrentLessonLoaded = true;
            }
          }
        }
        this.isLessonLoaded = true;
      });
    } else {
      this.isLessonLoaded = true;
    }
  }

  /**
   * @function fetchCollections
   * This method used to fetch collections
   */
  public fetchCollections(unitIndex, unitId, lessonIndex, lessonId) {
    const unit = this.unitList[unitIndex];
    const lesson = unit.lessons[lessonIndex];
    if (!lesson.collections || (unit).isUnit0) {
      this.isCollectionLoaded = false;
      this.collectionService.fetchUnitCollection(
        this.classId,
        this.courseId,
        lessonId,
        unitId,
        lesson.collections || []
      ).then((response) => {
        lesson.collections = response;
        if (this.skippedContents) {
          const collectionIds = [...this.skippedContents.collections , ...this.skippedContents.assessments , ...this.skippedContents.assessmentsExternal , ...this.skippedContents.collectionsExternal];
          if (lesson.collections && lesson.collections.length) {
            lesson.collections.forEach((collection) => {
              collection.isRescoped = collectionIds.includes(collection.id);
            });
          }
        }
        if (lesson.collections && lesson.collections.length) {
          this.checkCollectionContent(lesson.collections);
          const hiddenContent = lesson.collections.filter(collection => !collection.isVisible);
          lesson.isVisible = hiddenContent.length !== lesson.collections.length;
          this.findNextCollectionIsSuggestion(lesson.collections);
          if (!this.isCurrentCollectionLoaded && this.currentLocation) {
            const currentCollectionId = this.currentLocation.collectionId;
            const currentCollection = lesson.collections.find(
              (collection) => collection.id === currentCollectionId
            );
            if (currentCollection) {
              currentCollection.isCurrentCollection = true;
              this.isCurrentCollectionLoaded = true;
              this.onExpandLesson(unitIndex, lessonIndex);
            }
          }
        }
        this.isCollectionLoaded = true;
      });
    } else {
      this.isCollectionLoaded = true;
    }
  }

  /**
   * @function checkCollectionContent
   * This method is used to check collections visible or not
   */
  public checkCollectionContent(collections) {
    collections.map((collection) => {
      const collectionContent = this.contentVisibility ? this.contentVisibility.collections : null;
      const assessmentContent = this.contentVisibility ? this.contentVisibility.assessments : null;
      if (collectionContent && collectionContent.length) {
        const content = collectionContent.find((item) => item.id === collection.id);
        if (content) {
          collection.isVisible = content.visible === SETTINGS.ON;
        }
      }
      if (assessmentContent && assessmentContent.length) {
        const content = assessmentContent.find((item) => item.id === collection.id);
        if (content) {
          collection.isVisible = content.visible === SETTINGS.ON;
        }
      }
      return collection;
    });
  }

  /**
   * @function findNextCollectionIsSuggestion
   * This method is used to find next collection is suggested item
   */
  public findNextCollectionIsSuggestion(collections) {
    collections.map((collection, index) => {
      if (collection.isSuggestedContent) {
        collection.iSystemSuggested =
          collection.pathType === PATH_TYPES.SYSTEM;
        collection.isTeacherSuggested =
          collection.pathType === PATH_TYPES.TEACHER;
      }
      return collection;
    });
  }

  /**
   * @function showLessonReport
   * This method is used to show lesson level report
   */
  public showLessonReport(unit, lesson) {
    this.modalCtrl.create({
      component: CourseMapLessonReportComponent,
      cssClass: 'lesson-report-modal',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: {
        lessonInfo: lesson,
        classId: this.classId,
        courseId: this.courseId,
        unitId: unit.unitId,
        lessonId: lesson.lessonId
      }
    }).then((modal) => {
      modal.present();
    });
    this.parseService.trackEvent(EVENTS.CLICK_LJ_LESSON_REPORT);
  }

  /**
   * @function fetchSkippedContents
   * This method is used to skip the contents
   */
  public fetchSkippedContents() {
    if (this.classService.class.setting && this.classService.class.setting['course.premium']) {
      this.courseService.getSkippedContents(this.classId, this.courseId).then((skippedContents: SkippedContents) => {
        this.skippedContents = skippedContents;
      });
    }
  }
}
