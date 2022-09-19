import { Component, Input } from '@angular/core';
import { PLAYER_EVENT_SOURCE, SUGGESTION_TYPE } from '@shared/constants/helper-constants';
import { SuggestionModel } from '@shared/models/suggestion/suggestion';
import { PlayerService } from '@shared/providers/service/player/player.service';

@Component({
  selector: 'suggestion-panel',
  templateUrl: './suggestion-panel.component.html',
  styleUrls: ['./suggestion-panel.component.scss'],
})
export class SuggestionPanelComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public content: SuggestionModel;
  @Input() public isTeacherSuggestion: boolean;

  constructor(
    private playerService: PlayerService
  ) { }

  /**
   * @function onPlay
   * This method used to play the player
   */
  public onPlay() {
    const context = this.isTeacherSuggestion ?
      this.getTeacherSuggestionContext() : this.getSystemSuggestionContext();
    this.playerService.openPlayer({ context });
  }

  /**
   * @function getSystemSuggestionContext
   * This method used to get system suggestion context
   */
  private getSystemSuggestionContext() {
    const collectionId = this.content.id;
    return {
      collectionId,
      collectionType: this.content.collectionType,
      source: PLAYER_EVENT_SOURCE.MASTER_COMPETENCY
    };
  }

  /**
   * @function getTeacherSuggestionContext
   * This method used to get teacher suggestion context
   */
  private getTeacherSuggestionContext() {
    const collectionId = this.content.suggestedContentId;
    const pathId = this.content.id;
    return {
      collectionId,
      collectionType: this.content.suggestedContentType,
      source: PLAYER_EVENT_SOURCE.MASTER_COMPETENCY,
      pathId,
      pathType: SUGGESTION_TYPE.PROFICIENY_TEACHER
    };
  }
}
