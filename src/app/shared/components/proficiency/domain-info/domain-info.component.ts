import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomainTopicsModel, FwCompetenciesModel, SelectedCompetencyModel } from '@shared/models/competency/competency';
import { collapseAnimation } from 'angular-animations';
import * as d3 from 'd3';

export interface DomainChartModel {
  key?: string;
  value?: number;
  competencyType?: string;
  competencyCount?: number;
}

@Component({
  selector: 'domain-info',
  templateUrl: './domain-info.component.html',
  styleUrls: ['./domain-info.component.scss'],
  animations: [
    collapseAnimation()
  ]
})
export class DomainInfoComponent implements AfterViewInit, OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public domain: DomainTopicsModel;
  @Input() public listView: boolean;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Output() public selectCompetency: EventEmitter<SelectedCompetencyModel> = new EventEmitter();
  @Output() public clickDomainHeader = new EventEmitter();
  public notStartedCompetenciesCount: number;
  public masteredCompetenciesCount: number;
  public inProgressCompetenciesCount: number;
  private readonly WIDTH = 180;
  private readonly HEIGHT = 180;
  private readonly MARGIN = 20;

  constructor(private modalController: ModalController) { }

  public ngOnInit() {
    this.notStartedCompetenciesCount = this.domain.notstartedCompetencies;
    this.masteredCompetenciesCount = this.domain.masteredCompetencies;
    this.inProgressCompetenciesCount = this.domain.inprogressCompetencies;
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
    this.modalController.dismiss({ isCloseDomainReport: true });
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
    d3.select('svg#competency-progressbar').remove();
    const svg = d3.select('#competency-progressbar-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'competency-progressbar')
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
   * @function openDomainReport
   * This method is open the domain in full screen
   */
  public openDomainReport() {
    this.clickDomainHeader.emit();
  }

  /**
   * @function onSelectCompetency
   * This method is used to open the competency report
   */
  public onSelectCompetency(competency, domain) {
    const showFullReport = true;
    this.selectCompetency.emit({
      competency,
      domainCompetencyList: domain,
      showFullReport
    });
  }
}
