import { NgModule } from '@angular/core';
import { CharLength } from '@pipes/charLength.pipe';
import { ClassSumPerformancePipe } from '@pipes/class-sum-performance.pipe';
import { SortPipe } from '@pipes/sort.pipe';
const PIPES = [
  CharLength,
  SortPipe,
  ClassSumPerformancePipe
];

@NgModule({
  declarations: [PIPES],
  exports: [PIPES]
})
export class ApplicationPipesModule { }
