import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { ModalController } from '@ionic/angular';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';
import { CompetencyInfoComponent } from '@shared/components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { DomainModel, FwCompetenciesModel, SelectedCompetencyModel, SelectedTopicsModel } from '@shared/models/competency/competency';
import { collapseAnimation } from 'angular-animations';
import * as d3 from 'd3';

export interface DomainChartModel {
  key?: string;
  value?: number;
  competencyType?: string;
  competencyCount?: number;
}

@Component({
  selector: 'topic-info',
  templateUrl: './topic-info.component.html',
  styleUrls: ['./topic-info.component.scss'],
  animations: [
    collapseAnimation()
  ]
})
export class TopicInfoComponent implements AfterViewInit, OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public content: SelectedTopicsModel;
  @Input() public listView: boolean;
  @Input() public isEmitCloseEvent: boolean;
  @Input() public isDiagnostic: boolean;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Input() public fwDomains: Array<DomainModel>;
  @Input() public frameworkId: string;
  @Input() public competencyPullUpClassName: string;
  @Output() public closePullUp = new EventEmitter();
  @Output() public selectCompetency: EventEmitter<SelectedCompetencyModel> = new EventEmitter();
  public notStartedCompetenciesCount: number;
  public masteredCompetenciesCount: number;
  public inProgressCompetenciesCount: number;
  private readonly WIDTH = 180;
  private readonly HEIGHT = 180;
  private readonly MARGIN = 20;

  constructor(private modalController: ModalController, private parseService: ParseService) { }

  public ngOnInit() {
    if (this.content && this.content.topic) {
      this.notStartedCompetenciesCount = this.content.topic.notstartedCompetencies;
      this.masteredCompetenciesCount = this.content.topic.masteredCompetencies;
      this.inProgressCompetenciesCount = this.content.topic.inprogressCompetencies;
    }
  }

  public ngAfterViewInit() {
    this.drawCompetencyProgressBar();
  }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose(event) {
    event.stopPropagation();
    if (this.isEmitCloseEvent) {
      this.closePullUp.emit();
    } else {
      this.modalController.dismiss();
    }
  }

  /**
   * @function drawCompetencyProgressBar
   * This method is used to draw the compentency progress bar
   */
  private drawCompetencyProgressBar() {
    const width = this.WIDTH;
    const height = this.HEIGHT;
    const margin = this.MARGIN;
    const radius = Math.min(width, height) / 2 - margin;
    d3.select('svg#domain-competency-progressbar').remove();
    const svg = d3.select('#domain-competency-progressbar-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'domain-competency-progressbar')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    const data: Array<DomainChartModel> = [{
      competencyType: 'mastered',
      competencyCount: this.masteredCompetenciesCount
    }, {
      competencyType: 'in-progress',
      competencyCount: this.inProgressCompetenciesCount
    }, {
      competencyType: 'not-started',
      competencyCount: this.notStartedCompetenciesCount
    }];
    const pie = d3.pie<DomainChartModel>()
      .value((d) => {
        return d['competencyCount'];
      })(data);
    const arc = d3.arc<d3.PieArcDatum<DomainChartModel>>().innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);
    svg
      .selectAll('allSlices')
      .data(pie)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('class', (d) => {
        return `competencies-line ${d['data']['competencyType']}`;
      });
  }

  /**
   * @function onSelectCompetency
   * This method is used to open the competency report
   */
  public async onSelectCompetency(event, competency) {
    event.stopPropagation();
    const selectedCompetency = {
      competency,
      domainCompetencyList: this.content.domain
    };
    const componentProps = {
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      selectedCompetency
    };
    const cssClass = this.competencyPullUpClassName ? this.competencyPullUpClassName : 'competency-info-component';
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: CompetencyInfoComponent,
      componentProps,
      cssClass,
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation
    });
    await modal.present();
    this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_COMPETENCIES);
  }
}
