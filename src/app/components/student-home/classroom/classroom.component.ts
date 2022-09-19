import { Component, Input } from '@angular/core';
import { ClassModel } from '@shared/models/class/class';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'nav-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss'],
  animations: [
    collapseAnimation({ duration: 500, delay: 0 })
  ],
})
export class ClassroomComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public classList: Array<ClassModel>;
  @Input() public indepententClassList: Array<ClassModel>;
  @Input() public isShowJoinClass: boolean;
  @Input() public isEnableNavigatorProgram: boolean;
  public showClass = true;
  public showIndepententClass = true;

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function toggleClasses
   * This method is used to toggle the answers
   */
  public toggleClasses() {
    this.showClass = !this.showClass;
  }

  /**
   * @function toggleIndepententClass
   * This method is used to toggle the answers
   */
  public toggleIndepententClass() {
    this.showIndepententClass = !this.showIndepententClass;
  }

}
