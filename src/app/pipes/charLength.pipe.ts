import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'charLength' })
export class CharLength implements PipeTransform {
  public transform(char) {
    const charLength = char ? char.length : 0;
    return charLength;
  }
}
