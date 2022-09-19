import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { PortfolioUniversalActivitiesModal } from '@app/shared/models/portfolio/portfolio';
import { PortfolioProvider } from '@app/shared/providers/apis/portfolio/portfolio';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { SessionService } from '@app/shared/providers/service/session/session.service';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { COMPETENCY_STATUS, COMPETENCY_STATUS_VALUE, CONTENT_TYPES, DEFAULT_FRAMEWORK, MICRO_COMPETENCY_CODE_TYPES, PLAYER_EVENT_SOURCE, PROFICIENCY } from '@shared/constants/helper-constants';
import {
  CompetencyModel, DomainModel,
  FwCompetencyModel, MicroCompetenciesModel, PrerequisitesModel,
  SelectedCompetencyModel
} from '@shared/models/competency/competency';
import { TabsModel } from '@shared/models/offline-activity/offline-activity';
import { SignatureContentModel } from '@shared/models/signature-content/signature-content';
import { SuggestionModel } from '@shared/models/suggestion/suggestion';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { SearchProvider } from '@shared/providers/apis/search/search';
import { SuggestionProvider } from '@shared/providers/apis/suggestion/suggestion';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { getCourseId, getDomainId, getTaxonomySubjectId } from '@shared/utils/taxonomyUtils';

@Component({
  selector: 'competency-info-pull-up',
  templateUrl: './competency-info-pull-up.component.html',
  styleUrls: ['./competency-info-pull-up.component.scss'],
})
export class CompetencyInfoComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public fwCompetencies: Array<FwCompetencyModel>;
  @Input() public fwDomains: Array<DomainModel>;
  @Input() public frameworkId: string;
  @Input() public selectedCompetency: SelectedCompetencyModel;
  @Output() public clickCompetencyHeader = new EventEmitter();
  public competencyStatus: string;
  public showSignatureAssessment: boolean;
  public competency: CompetencyModel;
  public domainCompetencyList: DomainModel;
  public signatureContent: SignatureContentModel;
  public prerequisites: Array<PrerequisitesModel>;
  public standardCode: string;
  public domainId: string;
  public collectionType: string;
  public source: string;
  public subjectId: string;
  public courseId: string;
  public tabs: Array<TabsModel>;
  public showPortFolio: boolean;
  public showLearningMap: boolean;
  public isMappedWithGutCode: boolean;
  public microCompetencies: Array<MicroCompetenciesModel>;
  public suggestions: Array<SuggestionModel>;
  public loading: boolean;
  public isMasteredDemonstrated: boolean;
  public sourceText: string;
  public sourceData: string;
  public showDiagnostic: boolean;
  public showMetaData: boolean;
  public portfolioDataList: Array<PortfolioUniversalActivitiesModal>;
  public classId: string;


  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalController: ModalController,
    private collectionProvider: CollectionProvider,
    private suggestionProvider: SuggestionProvider,
    private searchProvider: SearchProvider,
    private taxonomyProvider: TaxonomyProvider,
    private translate: TranslateService,
    private portfolioProvider: PortfolioProvider,
    private sessionService: SessionService,
    private parseService: ParseService
  ) {
    this.source = PLAYER_EVENT_SOURCE.MASTER_COMPETENCY;
    this.tabs = [{
      title: 'PROFICIENCY_PORTFOLIO',
      isActive: true
    },
    {
      title: 'METADATA',
      isActive: false
    },
    {
      title: 'LEARNING_MAP',
      isActive: false
    }];
    this.showPortFolio = true;
    this.loading = true;
    this.portfolioDataList = [];
  }

  public ngOnInit() {
    this.loadData();
    this.loadUniversalUserPortfolioActivities();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedCompetency && !changes.selectedCompetency.firstChange) {
      this.suggestions = null;
      this.signatureContent = null;
      this.loading = true;
      this.setDefaultTab(0);
      this.loadData();
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function loadData
   * This method is used to load the data
   */
  private loadData() {
    if (this.selectedCompetency && this.selectedCompetency.competency) {
      this.competency = this.selectedCompetency.competency;
      this.domainCompetencyList = this.selectedCompetency.domainCompetencyList;
      this.competencyStatus = COMPETENCY_STATUS[this.competency.competencyStatus];
      const competencySource = this.competency.source;
      const isActivityStream = competencySource ? competencySource.indexOf('ActivityStream') === 0 : false;
      if (this.competencyStatus === COMPETENCY_STATUS[4] && isActivityStream) {
        this.competencyStatus = COMPETENCY_STATUS[5];
      }
      this.checkCompetencySource(competencySource, isActivityStream);
      this.isMasteredDemonstrated = this.competency.competencyStatus === COMPETENCY_STATUS_VALUE.DEMONSTRATED;
      this.showSignatureAssessment = this.competency.showSignatureAssessment;
      this.getSignatureContent();
    }
  }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose() {
    this.modalController.dismiss({ isCloseCompetencyReport: true });
  }

  /**
   * @function openCompetencyReport
   * This method is open the competency in full screen
   */
  public openCompetencyReport() {
    this.clickCompetencyHeader.emit();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function setDefaultTab
   * This method is used to set the default tab
   */
  private setDefaultTab(index) {
    this.showPortFolio = true;
    this.showLearningMap = false;
    this.tabs.map((tab, tabIndex) => {
      tab.isActive = tabIndex === index;
      return tab;
    });
  }

  /**
   * @function getSignatureContent
   * This method is used to get the signature content
   */
  public getSignatureContent() {
    this.isMappedWithGutCode = !!this.competency.isMappedWithFramework;
    this.standardCode = this.isMappedWithGutCode ? this.competency.framework.frameworkCompetencyCode : this.competency.competencyCode;
    this.frameworkId = this.competency.isMappedWithFramework ? this.frameworkId : DEFAULT_FRAMEWORK;
    this.domainId = getDomainId(this.standardCode);
    this.subjectId = getTaxonomySubjectId(this.standardCode);
    this.courseId = getCourseId(this.standardCode);
    this.fetchTeacherSuggestions();
    this.fetchLearningMapsContent();
    this.fetchMicroCompetency();
  }

  /**
   * @function fetchTeacherSuggestions
   * This Method IS used to fetch the teacher suggestions
   */
  public fetchTeacherSuggestions() {
    const params = {
      scope: PROFICIENCY
    };
    this.suggestionProvider.fetchTeacherSuggestions(this.competency.competencyCode, params)
      .then((contents) => {
        this.suggestions = contents;
      });
    this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_SUGGESTION_PLAY);
  }

  /**
   * @function setCollectionType
   * Method to set the collection type
   */
  private setCollectionType() {
    this.collectionType = this.showSignatureAssessment ? CONTENT_TYPES.ASSESSMENT : CONTENT_TYPES.COLLECTION;
  }

  /**
   * @function fetchMicroCompetency
   * Method to fetch micro competency
   */
  private fetchMicroCompetency() {
    this.taxonomyProvider.fetchCodes(this.frameworkId, this.subjectId, this.courseId, this.domainId).then((microCompetencies) => {
      const codes = this.filterMicroCompetency(microCompetencies);
      this.microCompetencies = codes;
    });
  }

  /**
   * @function showTab
   * This method is used to active tab
   */
  public showTab(tab, selectedTabIndex) {
    this.tabs.map((rubricTab, tabIndex) => {
      rubricTab.isActive = tabIndex === selectedTabIndex;
    });
    this.showPortFolio = tab.title === 'PROFICIENCY_PORTFOLIO';
    this.showMetaData = tab.title === 'METADATA';
    this.showLearningMap = tab.title === 'LEARNING_MAP';
  }


  /**
   * @function filterMicroCompetency
   * Method to filter micro competency
   */
  private filterMicroCompetency(codes) {
    const standardCode = this.standardCode;
    const regex = new RegExp(standardCode);
    const microCompetencies = codes.filter((code) => {
      return (
        regex.test(code.id) &&
        MICRO_COMPETENCY_CODE_TYPES.includes(code.codeType)
      );
    });
    return microCompetencies;
  }

  /**
   * @function fetchLearningMapsContent
   * Method to fetch learning maps content
   */
  private fetchLearningMapsContent() {
    const filters = {
      isDisplayCode: true
    };
    this.searchProvider.fetchLearningMapsContent(this.competency.competencyCode, filters).then((learningMapData) => {
      const signatureContentList = learningMapData.signatureContents;
      this.showSignatureAssessment = this.showSignatureAssessment && signatureContentList.assessments.length > 0;
      const signatureContent = this.showSignatureAssessment
        ? signatureContentList.assessments
        : signatureContentList.collections;
      this.setCollectionType();
      const content = signatureContent[0];
      this.checkPrerequisiteCompetencyStatus(
        learningMapData.prerequisites
      );

      if (this.collectionType === CONTENT_TYPES.ASSESSMENT) {
        this.signatureContent = content;
        if (content) {
          this.collectionProvider.fetchCollectionById(content.id, CONTENT_TYPES.ASSESSMENT).then((collection) => {
            this.signatureContent.collection = collection;
            this.signatureContent.collectionType = CONTENT_TYPES.ASSESSMENT;
          });
        }
      } else {
        this.signatureContent = content;
        if (content) {
          this.collectionProvider.fetchCollectionById(content.id, CONTENT_TYPES.COLLECTION).then((collection) => {
            this.signatureContent.collection = collection;
            this.signatureContent.collectionType = CONTENT_TYPES.COLLECTION;
          });
        }
      }
    });
    this.loading = false;
  }

  /**
   * @function checkPrerequisiteCompetencyStatus
   * Method to check prerequisite competency status
   */
  public checkPrerequisiteCompetencyStatus(prerequisites) {
    const domainCompetencyList = this.domainCompetencyList.competencies;
    if (prerequisites && domainCompetencyList) {
      prerequisites.forEach(competency => {
        const filteredCompetency = domainCompetencyList.find((list) => {
          return list.competencyCode === competency.id;
        });
        const status = filteredCompetency ? filteredCompetency.status : 0;
        competency.status = status;
      });
      this.prerequisites = prerequisites;
    }
  }

  /**
   * @function checkCompetencySource
   * Method to check check Competency Source Text
   */
  public checkCompetencySource(competencySource, isActivityStream) {
    if (isActivityStream ) {
      let sourceText = this.translate.instant('ACTIVITYSTREAM_MASTERY_EXTERNAL_MSG');
      const sourceSplitContents = competencySource.split(':');
      if ([...sourceSplitContents].splice(-1)[0] === PLAYER_EVENT_SOURCE.DIAGNOSTIC) {
        sourceText =  this.translate.instant('ACTIVITYSTREAM_DIAGNOSTIC_MSG');
        this.showDiagnostic = true;
      } else if (sourceSplitContents[2]) {
        sourceText = this.translate.instant('ACTIVITYSTREAM_MASTERY_EXTERNAL_SOURCE_MSG', {sourceName: `${sourceSplitContents[2]}`});
      }
      this.sourceText = sourceText;
    }
  }

  /*
   * @function showMetaDataTab
   * This method is used to close the portfolio and open metadata
   */
  public showMetaDataTab() {
    this.tabs[0].isActive = false;
    this.tabs[1].isActive = true;
    // when there is no content available in portfolio it shows metadata tab as default
    this.showPortFolio = false;
    this.showMetaData = true;
  }

  /**
   * @function loadUniversalUserPortfolioActivities
   * Method to fetch the universal user portfolio Data
   */
  public loadUniversalUserPortfolioActivities() {
    const userId = this.sessionService.userSession.user_id;
    this.portfolioProvider.fetchUniversalUserPortfolioUniqueItems(userId).then((portfolioData) => {
      this.portfolioDataList = portfolioData;
    });
  }
}
