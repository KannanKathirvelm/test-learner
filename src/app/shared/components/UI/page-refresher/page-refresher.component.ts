import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'page-refresher',
  templateUrl: './page-refresher.component.html',
  styleUrls: ['./page-refresher.component.scss'],
})
export class PageRefresherComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Output() public pageRefresh = new EventEmitter();

  // --------------------------------------------------------------------------
  // Methods

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public onRefresh(event) {
    this.pageRefresh.emit(event);
  }
}
