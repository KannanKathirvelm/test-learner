import { Directive, HostListener, Input } from '@angular/core';
import { ScorePointComponent } from '@shared/components/score-point/score-point.component';
import { PopoverService } from '@shared/providers/service/popover.service';

@Directive({
  selector: '[scoreTooltip]'
})
export class ScorePointsTooltipDirective {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public name: string;
  @Input() public score: number;
  @Input() public scoreInPercentage: number;
  @Input() public totalPoints: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(public popoverService: PopoverService) {}

  // -------------------------------------------------------------------------
  // Actions

  @HostListener('mouseenter', ['$event'])
  public onHover(event): void {
    event.stopPropagation();
    const scorePercentage = Math.floor((this.score / this.totalPoints) * 100);
    this.popoverService.presentPopover(ScorePointComponent, event, { levelName: this.name, levelScore: this.score, scoreInPercentage: scorePercentage }, 'score-point-popover');
  }

  @HostListener('mouseout', ['$event'])
  public onMouseout(event): void {
    event.stopPropagation();
    this.popoverService.dismissPopover();
  }
}
