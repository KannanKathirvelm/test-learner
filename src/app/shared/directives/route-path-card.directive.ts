import { Directive, HostListener, Input } from '@angular/core';
import { RouteContentPopoverComponent } from '@shared/components/route-content-popover/route-content-popover.component';
import { PopoverService } from '@shared/providers/service/popover.service';

@Directive({
  selector: '[routeViewTooltip]'
})
export class RoutePathCardDirective {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public description;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private popoverService: PopoverService) {}

  // -------------------------------------------------------------------------
  // Actions

  @HostListener('mouseenter', ['$event'])
  public onHover(event): void {
    event.stopPropagation();
    const context = {
        description: this.description
    };
    this.popoverService.presentPopover(RouteContentPopoverComponent, event, context , 'route-path-view-popover');
}

  @HostListener('mouseout', ['$event'])
  public onMouseout(event): void {
    event.stopPropagation();
    this.popoverService.dismissPopover();
  }
}
