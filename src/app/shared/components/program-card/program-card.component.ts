import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigatorProgram } from '@app/shared/models/course/course';

@Component({
  selector: 'app-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss'],
})
export class ProgramCardComponent {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public programContent: NavigatorProgram;
  @Output() public selectedProgram = new EventEmitter();

  // ------------------------------------------------------------------
  // Methods

  /**
   * @function onSelectProgram
   * This method is used to emit the selected program
   */
  public onSelectProgram()  {
    this.selectedProgram.emit(this.programContent);
  }
}
