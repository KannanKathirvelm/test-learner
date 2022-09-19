import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'classSumPerformance'
})
export class ClassSumPerformancePipe implements PipeTransform {

  public transform(performanceSummary, performanceSummaryForDCA): any {
    let score = null;
    if (performanceSummary) {
      score = performanceSummary.score;
      if (performanceSummaryForDCA) {
        const caScore = performanceSummaryForDCA
          ? performanceSummaryForDCA.scoreInPercentage
          : null;
        if (caScore !== null) {
          score = (caScore + score) / 2;
        }
      }
    }
    return score;
  }

}
