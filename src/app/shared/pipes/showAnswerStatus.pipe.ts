import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'showAnswerStatus' })
export class ShowAnswerStatusPipe implements PipeTransform {

  public transform(partialScore) {
    if (partialScore === 100) {
      return 'correct';
    } else if (partialScore === 0) {
      return 'incorrect';
    } else {
      return 'partial-correct';
    }
  }
}
