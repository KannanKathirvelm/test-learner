import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-route-content-popover',
  templateUrl: './route-content-popover.component.html',
  styleUrls: ['./route-content-popover.component.scss'],
})
export class RouteContentPopoverComponent {

  @Input() public description: string;

}
