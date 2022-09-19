import { Component, Input } from '@angular/core';

@Component({
  selector: 'nav-score-point',
  templateUrl: './score-point.component.html',
  styleUrls: ['./score-point.component.scss'],
})
export class ScorePointComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public levelScore: number;
  @Input() public levelName: string;
  @Input() public scoreInPercentage: number;

}
