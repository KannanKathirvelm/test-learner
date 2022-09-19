import { Component, ComponentFactoryResolver, ComponentRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ClassService } from '@app/shared/providers/service/class/class.service';
import { environment } from '@environment/environment';
import { QUESTION_TYPES } from '@shared/components/player/questions/questions.import';
import { UpcomingQuestionComponent } from '@shared/components/player/questions/serp/upcoming-question/upcoming-question.component';
import { RESOURCE_TYPES } from '@shared/components/player/resources/resources.import';
import {
  ASSESSMENT, COLLECTION,
  COLLECTION_SUB_FORMAT_TYPES,
  OPEN_ENDED_QUESTION,
  SUPPORTED_SERP_QUESTION_TYPES
} from '@shared/constants/helper-constants';
import { CollectionsModel, ContentModel } from '@shared/models/collection/collection';
import { PortfolioPerformanceSummaryModel, SubContentModel } from '@shared/models/portfolio/portfolio';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';

@Component({
  selector: 'content-report',
  templateUrl: './content-report.component.html',
  styleUrls: ['./content-report.component.scss'],
})
export class ContentReportComponent implements OnInit, OnChanges {
  @Input() public collection: CollectionsModel;
  @Input() public performance: PortfolioPerformanceSummaryModel;
  @Input() public collectionType: string;
  @Input() public isPreview: boolean;
  public isLearner: boolean;
  public isAndroid: boolean;
  @ViewChild('report_view', { read: ViewContainerRef, static: true })
  private contentViewRef: ViewContainerRef;
  @Input() public isAnswerKeyHidden: boolean;
  public isShowAnswerToggle: number;
  public componentRefList: Array<ComponentRef<any>>;
  @Input() public tenantSettings: TenantSettingsModel;
  public isHideAnswerDetails: boolean;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private playerService: PlayerService,
    private classService: ClassService,
    private utilsService: UtilsService
  ) {
    this.componentRefList = [];
  }

  public ngOnInit() {
    this.isLearner = environment.APP_LEARNER;
    if (this.collectionType === COLLECTION || this.collectionType === ASSESSMENT) {
      const questionContent = this.collection.content.filter((item) => item.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION);
      this.isShowAnswerToggle = questionContent.length;
    }
    if (this.collectionType === COLLECTION) {
      const checkQuestionTypes = this.collection.content.filter((item) => item.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION && item.contentSubformat !== OPEN_ENDED_QUESTION);
      this.isAnswerKeyHidden = !checkQuestionTypes.length;
    }
    this.renderContents();
    this.isAndroid = this.utilsService.isAndroid();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.performance.previousValue) {
      this.clearComponentRef();
      this.componentRefList = [];
      this.renderContents();
    }
  }

  /**
   * @function renderContents
   * This method is used to create dyanamic component
   */
  public renderContents() {
    this.collection.content.forEach((content, index) => {
      const contentFormatTypes = content.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION ? QUESTION_TYPES : RESOURCE_TYPES;
      let componentType = contentFormatTypes[content.contentSubformat];
      if (componentType) {
        const subformat = content.contentSubformat;
        const regex = new RegExp('serp');
        if (regex.test(subformat)) {
          const isSupportedQuestion = SUPPORTED_SERP_QUESTION_TYPES.includes(subformat);
          if (!isSupportedQuestion) {
            componentType = UpcomingQuestionComponent;
          }
        }
      } else {
        componentType = UpcomingQuestionComponent;
      }
      this.renderCollection(componentType, content, index);
    });
  }

  /**
   * @function renderCollection
   * This method is used to render the collections
   */
  public renderCollection(componentType, content, index) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const componentRef = this.contentViewRef.createComponent(factory);
    this.onContentInstance(componentRef, content, index);
    this.componentRefList.push(componentRef);
  }

  /**
   * @function onContentInstance
   * This method is used to pass instance to dynamic components
   */
  public onContentInstance(componentRef, content, index) {
    const isBidirectionalPlay = true;
    const instance = componentRef.instance as {
      content: ContentModel;
      isBidirectionalPlay: boolean;
      reportViewMode: boolean;
      performance: SubContentModel;
      showCorrectAnswer: boolean;
      componentSequence: number;
      showResourcePreview: boolean;
      isPreview: boolean;
      isShowEvidence: boolean;
      isHideAnswerDetails: boolean;
      studentScore: number;
    };
    const classDetails = this.classService.class;
    instance.componentSequence = (index + 1);
    instance.isBidirectionalPlay = isBidirectionalPlay;
    instance.reportViewMode = true;
    instance.showResourcePreview = true;
    instance.isPreview = this.isPreview;
    instance.isHideAnswerDetails = !environment.APP_LEARNER && this.tenantSettings && this.tenantSettings.hideGuardianAnswerDetails;
    const contentKey = this.collectionType === ASSESSMENT ? 'questions' : 'resources';
    if (this.performance) {
      const summaryPerformance = this.performance[contentKey].find((item) => item.id === content.id);
      instance.performance = summaryPerformance;
      if (summaryPerformance) {
        instance.studentScore = content.maxScore && summaryPerformance.averageScore ? Math.floor((summaryPerformance.averageScore * content.maxScore) / 100) : summaryPerformance.score;
      }
    }
    instance.showCorrectAnswer = false;
    instance.content = content;
    instance.isShowEvidence =  this.playerService.checkEvidenceIsEnabled(classDetails, this.tenantSettings, content);
  }


  /**
   * @function toggleShowCorrectAnswer
   * This method is used to start question play event
   */
  public toggleShowCorrectAnswer(event) {
    this.componentRefList.forEach((component) => {
      component.instance.isShowCorrectAnswer = event.target.checked;
    });
  }

  public clearComponentRef() {
    this.componentRefList.forEach((component) => {
      component.destroy();
    });
  }

  public ngOnDestory() {
    this.clearComponentRef();
  }
}
