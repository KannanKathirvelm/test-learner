import { Component, Input } from '@angular/core';
import { GradeItemsModel } from '@shared/models/grade-items/grade-items';

@Component({
  selector: 'nav-items-to-grade-panel',
  templateUrl: './items-to-grade-panel.component.html',
  styleUrls: ['./items-to-grade-panel.component.scss'],
})
export class ItemsToGradePanelComponent {
  @Input() public grade: GradeItemsModel;
}
