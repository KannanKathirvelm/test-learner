import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { REACTIONS } from '@shared/constants/helper-constants';
import { ReactionModel } from '@shared/models/reaction/reaction';
import { cloneObject } from '@shared/utils/global';

@Component({
  selector: 'reaction',
  templateUrl: './reaction.component.html',
  styleUrls: ['./reaction.component.scss'],
})
export class ReactionComponent implements OnInit {

  @Output() public selectedValue: EventEmitter<number> = new EventEmitter();

  public reactions: Array<ReactionModel>;

  public ngOnInit() {
    this.reactions = cloneObject(REACTIONS);
  }

  /**
   * @function isReactionSelected
   * This method is used to change the selected icon
   */
  public isReactionSelected(selectedValue) {
    this.reactions.map(activeClass => {
      return activeClass.status = activeClass.value === selectedValue;
    });
    this.selectedValue.emit(selectedValue);
  }

}
