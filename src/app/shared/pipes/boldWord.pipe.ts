import { Pipe, PipeTransform, Sanitizer, SecurityContext } from '@angular/core';
@Pipe({
  name: 'boldWord'
})
export class BoldWordPipe implements PipeTransform {
  constructor(
    private sanitizer: Sanitizer
  ) {}
  public transform(value: string, regex): any {
    return this.sanitize(this.replace(value, regex));
  }
  public replace(str, regex) {
    return str.replace(new RegExp(`(${regex})`, 'gi'), '<b>$1</b>');
  }
  public sanitize(str) {
    return this.sanitizer.sanitize(SecurityContext.HTML, str);
  }
}
