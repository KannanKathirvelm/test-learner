import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'transformCompentencyStats' })
export class TransformCompentencyStats implements PipeTransform {
  public transform(completedCompetencies, totalCompetencies) {
    return `${completedCompetencies}/${totalCompetencies}`;
  }
}
