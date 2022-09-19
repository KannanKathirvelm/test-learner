import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CONTENT_TYPES } from '@app/shared/constants/helper-constants';

@Component({
  selector: 'app-route-path-view-card',
  templateUrl: './route-path-view-card.component.html',
  styleUrls: ['./route-path-view-card.component.scss'],
})
export class RoutePathViewCardComponent implements OnInit {

  @Input() public suggestion;
  @Output() public showReport = new EventEmitter();
  @Output() public playContent = new EventEmitter();
  public hasScore: boolean;
  public get performanceScore() {
    const performance = this.suggestion.contextContext.performance;
    return performance ? performance.scoreInPercentage : null;
  }
  public get timespent() {
    const performance = this.suggestion.contextContext.performance;
    return performance ? performance.timeSpent : null;
  }

  public ngOnInit() {
    this.hasScore = ![CONTENT_TYPES.COLLECTION, CONTENT_TYPES.EXTERNAL_COLLECTION].includes(this.suggestion.format);
  }

  // -------------------------------

  /**
   * @function onShowReport
   * Help to show report from the expand view
   */
  public onShowReport() {
    this.showReport.emit(this.suggestion);
  }

  /**
   * @function onPlay
   * Help to play the content from the expand view
   */
  public onPlay() {
    this.playContent.emit(this.suggestion);
  }
}
