import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CollectionsModel } from '@shared/models/collection/collection';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'reroute-suggestion',
  templateUrl: './reroute-suggestion.component.html',
  styleUrls: ['./reroute-suggestion.component.scss'],
  animations: [
    collapseAnimation({ duration: 300, delay: 0 })
  ],
})
export class RerouteSuggestionComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public collection: CollectionsModel;
  @Output() public scrollToSuggestion = new EventEmitter();

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function toggleSuggestionPanel
   * This method is used to toggle the suggestion panel
   */
  public toggleSuggestionPanel() {
    this.scrollToSuggestion.emit();
  }
}
