import { Component, Input } from '@angular/core';

@Component({
  selector: 'pullup-with-dynamic-height',
  templateUrl: './pullup-with-dynamic-height.component.html',
  styleUrls: ['./pullup-with-dynamic-height.component.scss'],
})
export class PullUpWithDynamicHeightComponent {
  @Input() public isShowPullUp: boolean;
}
