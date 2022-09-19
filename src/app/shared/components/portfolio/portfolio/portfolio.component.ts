import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ASSESSMENT, COLLECTION , COMPETENCY, COMPETENCY_MASTERY_SOURCE, OFFLINE_ACTIVITY} from '@shared/constants/helper-constants';
import { CompetencyModel } from '@shared/models/competency/competency';
import { PortfolioActivitiesModel, PortfolioModel } from '@shared/models/portfolio/portfolio';
import { PortfolioProvider } from '@shared/providers/apis/portfolio/portfolio';
import { SessionService } from '@shared/providers/service/session/session.service';
import axios from 'axios';

@Component({
  selector: 'portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public competency: CompetencyModel;
  @Input() public sourceText: string;
  @Input() public showDiagnostic: boolean;
  @Input() public userId: string;
  public showMore: boolean;
  public portfolioActivities: Array<PortfolioActivitiesModel>;
  public offset: number;
  public limit: number;
  public masterySourceLabel: string;
  public hasPortfolioActivities: boolean;
  public showMoreItems: boolean [] = [];
  public isDiagnostic: boolean;
  public isDiagnosticCount: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private portfolioProvider: PortfolioProvider, private sessionService: SessionService) {
    this.showMore = true;
    this.portfolioActivities = [];
    this.offset = 0;
    this.limit = 5;
    this.isDiagnosticCount = 0;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.competency && !changes.competency.firstChange) {
      this.portfolioActivities = [];
      this.loadData();
    }
  }

  public ngOnInit() {
    this.loadData();
    this.getMasterySourceLabel();
  }

  /**
   * @function getMasterySourceLabel
   * This method is used to get the mastery status
   */
  public getMasterySourceLabel() {
    const competency = this.competency;
    const sourceKey = competency.source;
    const masterySources = COMPETENCY_MASTERY_SOURCE;
    if (sourceKey) {
      const masterySource = masterySources.find(item => sourceKey.includes(item.source));
      if (masterySource) {
        this.masterySourceLabel = masterySource.label;
      }
    }
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData() {
    return axios.all([
      this.loadPortfolioActivities(this.competency.competencyCode, ASSESSMENT),
      this.loadPortfolioActivities(this.competency.competencyCode, COLLECTION),
      this.loadPortfolioActivities(this.competency.competencyCode, OFFLINE_ACTIVITY)
      ]).then(axios.spread((assessmentActivities: Array<PortfolioModel>, collectionActivities: Array<PortfolioModel>, offlineActivities: Array<PortfolioModel>) => {
        if (assessmentActivities.length || collectionActivities.length || offlineActivities.length) {
          this.hasPortfolioActivities = true;
        }
        this.portfolioActivities = [{
          type: ASSESSMENT,
          label: 'ASSESSMENT',
          portfolioContents: assessmentActivities
        }, {
          type: COLLECTION,
          label: 'COLLECTION',
          portfolioContents: collectionActivities
        }, {
          type: OFFLINE_ACTIVITY,
          label: 'OFFLINE-ACTIVITY',
          portfolioContents: offlineActivities
        }];
        let diagnosticCount = 0;
        this.portfolioActivities.forEach((portfolio) => {
          portfolio.portfolioContents.forEach((activity) => {
            const sourceText = activity.contentSource && activity.contentSource.split(':');
            const isDiagnostic = sourceText.includes('ca-diagnostic');
            activity.isDiagnostic = isDiagnostic;
            if (isDiagnostic) {
              diagnosticCount++;
            }
          });
        });
        if (diagnosticCount) {
          this.isDiagnosticCount = diagnosticCount;
        }
      }), (error) => {
      this.portfolioActivities = [];
    });
  }

  /**
   * @function loadPortfolioActivities
   * This method is used to load the portfolio activities
   */
  private loadPortfolioActivities(gutCode, contentType) {
    return new Promise((resolve, reject) => {
      const userId = this.userId ? this.userId : this.sessionService.userSession.user_id;
      const requestParam = {
        userId,
        activityType: contentType,
        offset: this.offset,
        limit: this.limit,
        gutCode
      };
      const contentBase = COMPETENCY;
      return this.portfolioProvider.fetchUserPortfolioUniqueItems(requestParam, contentBase).then((portfolioContents) => {
        resolve(portfolioContents);
      }, (error) => {
        resolve([]);
      });
    });
  }
}
