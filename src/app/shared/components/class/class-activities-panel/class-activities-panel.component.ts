import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@shared/constants/router-constants';
import { CAPerformanceModel } from '@shared/models/performance/performance';

@Component({
  selector: 'class-activities-panel',
  templateUrl: './class-activities-panel.component.html',
  styleUrls: ['./class-activities-panel.component.scss'],
})
export class ClassActivitiesPanelComponent {
  @Input() public caPerformance: CAPerformanceModel;
  @Input() public isCAPerformanceLoaded: boolean;
  @Input() public classId: string;

  constructor(
    private router: Router,
  ) { }

  public getCAPerformance(performance) {
    return performance ? performance.scoreInPercentage : null;
  }

  public navigateToCA() {
    const classActivityUrl = routerPathIdReplace('classActivityFullPath', this.classId);
    this.router.navigate([classActivityUrl]);
  }
}
