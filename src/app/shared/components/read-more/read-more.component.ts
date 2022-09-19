import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss']
})

export class ReadMoreComponent implements OnInit {

  // --------------------------------------------------------------------------
  // Properties

  @Input() public length: number;
  @Input() public lineCount: number;
  @Input() public maxLength: number;
  public isCollapsed: boolean;
  public showMore: boolean;

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.showMore = this.length > this.maxLength;
    this.isCollapsed = this.showMore;
  }

  /**
   * @function onClickReadMore
   * Method triggers when click the read more
   */
  public onClickReadMore(event) {
    event.stopPropagation();
    this.isCollapsed = !this.isCollapsed;
  }
}
