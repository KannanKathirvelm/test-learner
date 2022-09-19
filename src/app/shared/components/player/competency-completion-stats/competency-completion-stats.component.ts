import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'competency-completion-stats',
  templateUrl: './competency-completion-stats.component.html',
  styleUrls: ['./competency-completion-stats.component.scss'],
})
export class CompetencyCompletionStatsComponent implements OnInit, OnChanges {
  // -------------------------------------------------------------------------
  // Properties
  @Input() private completionPercentage: number;
  @Output() private progressClick = new EventEmitter();
  private WIDTH = 980;
  private HEIGHT = 50;
  private OFFSET = 58;
  private progress: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  private navigateBar: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.drawProgressBar();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!changes.completionPercentage.firstChange) {
      this.updateTheProgressBar();
    }
  }

  /**
   * @function drawProgressBar
   * This method is used to draw the progress bar
   */
  public drawProgressBar() {
    const offset = this.OFFSET;
    const width = this.WIDTH + offset * 2;
    const height = this.HEIGHT + offset * 2;
    const dimensions = `0 0 ${width} ${height}`;
    const rectWidth = (width - offset * 2);
    const svg = d3.select('#competency-progress-bar').append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', dimensions)
      .classed('competency-progress-bar', true);
    const progressBar = svg.append('g')
      .attr('transform', 'translate(' + (offset / 2) + ',' + offset + ')')
      .style('pointer-events', 'none');
    progressBar.append('foreignObject')
      .attr('class', 'start-point')
      .attr('x', -24)
      .attr('y', -15)
      .attr('width', 75)
      .attr('height', 75)
      .append('xhtml:i');
    progressBar.append('rect')
      .attr('class', 'progress-background')
      .attr('height', 16)
      .attr('width', rectWidth)
      .attr('x', 46)
      .attr('y', 16);
    progressBar.append('foreignObject')
      .attr('class', 'end-point')
      .attr('x', rectWidth)
      .attr('y', -15)
      .attr('width', 75)
      .attr('height', 75)
      .append('xhtml:i');
    this.progress = progressBar.append('rect')
      .attr('class', 'progress-bar')
      .attr('height', 16)
      .attr('width', 0)
      .attr('x', 46)
      .attr('y', 16);
    this.navigateBar = progressBar.append('foreignObject')
      .attr('class', 'current-point')
      .attr('y', -15)
      .attr('width', 75)
      .attr('height', 75);
    this.navigateBar.append('xhtml:i');
    svg.on('click', () => {
      this.progressClick.emit();
      d3.event.stopPropagation();
    });
  }

  /**
   * @function updateTheProgressBar
   * This method is used to update the progress bar
   */
  public updateTheProgressBar() {
    setTimeout(() => {
      const value = (this.WIDTH * this.completionPercentage) / 100;
      this.progress.transition()
        .duration(1000)
        .attr('width', function() {
          return value;
        });
      this.navigateBar.transition()
        .duration(1000)
        .attr('x', function() {
          return value;
        });
    }, 600);
  }
}
