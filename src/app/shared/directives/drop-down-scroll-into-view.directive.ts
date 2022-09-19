import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[dropdownScrollIntoView]'
})
export class DropdownScrollIntoViewDirective {
  @HostListener('click') public scrollIntoView() {
    setTimeout(() => {
      document.getElementsByClassName('alert-radio-group')[0]
        .querySelector('[aria-checked="true"]')
        .scrollIntoView({ block: 'end', behavior: 'smooth' });
    }, 500);
  }
}
