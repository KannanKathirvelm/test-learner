import { NgModule } from '@angular/core';
import { BoldWordPipe } from '@shared/pipes/boldWord.pipe';
import { CompetencyGutToFwTransform } from '@shared/pipes/competency-gut-to-fw-transform.pipe';
import { FormatDate } from '@shared/pipes/formatDate.pipe';
import { GradeRangePipe } from '@shared/pipes/gradeRange.pipe';
import { ListFilterPipe } from '@shared/pipes/list-filter.pipe';
import { ShowAnswerStatusPipe } from '@shared/pipes/showAnswerStatus.pipe';
import { TransformCompentencyStats } from '@shared/pipes/transformCompentencyStats.pipe';
import { TransformCurrentLocationPipe } from '@shared/pipes/transformCurrentLocation.pipe';
import { TransformPerformanceScore } from '@shared/pipes/transformPerformanceScore.pipe';
import { TransformPerformanceTimeSpent } from '@shared/pipes/transformPerformanceTimeSpent.pipe';

const PIPES = [
  ListFilterPipe,
  TransformCompentencyStats,
  TransformCurrentLocationPipe,
  GradeRangePipe,
  ShowAnswerStatusPipe,
  TransformPerformanceScore,
  BoldWordPipe,
  FormatDate,
  TransformPerformanceTimeSpent,
  CompetencyGutToFwTransform
];

@NgModule({
  declarations: [PIPES],
  exports: [PIPES]
})

export class SharedApplicationPipesModule { }
