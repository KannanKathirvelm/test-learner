import { Component, Input } from '@angular/core';
import { NextContextModel } from '@app/shared/models/navigate/navigate';
import { CollectionsModel } from '@shared/models/collection/collection';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'collection-info-panel',
  templateUrl: './collection-info-panel.component.html',
  styleUrls: ['./collection-info-panel.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})

export class CollectionInfoPanelComponent {
  // -------------------------------------------------------------------------
  // Properties
  public showAdditionalInfo: boolean;
  @Input() public collection: CollectionsModel;
  @Input() public isSuggested: boolean;
  @Input() public nextContext: NextContextModel;
  @Input() public isDiagnosticActive: boolean;

  constructor() {
    this.showAdditionalInfo = false;
  }
  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function toggleInfo
   * This method is used to toggle info
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }
}
