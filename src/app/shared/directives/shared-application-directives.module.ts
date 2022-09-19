import { NgModule } from '@angular/core';
import { DropdownScrollIntoViewDirective } from '@shared/directives/drop-down-scroll-into-view.directive';
import { HandleEllipsisDirective } from '@shared/directives/handle-ellipsis.directive';
import { InAppBrowserDirective } from '@shared/directives/in-app-browser.directive';
import { RoutePathCardDirective } from './route-path-card.directive';
import { ScorePointsTooltipDirective } from './score-points-tooltip.directive';

const DIRECTIVES = [
  HandleEllipsisDirective,
  InAppBrowserDirective,
  DropdownScrollIntoViewDirective,
  ScorePointsTooltipDirective,
  RoutePathCardDirective
];

@NgModule({
  declarations: [DIRECTIVES],
  exports: [DIRECTIVES]
})
export class SharedApplicationDirectivesModule { }
