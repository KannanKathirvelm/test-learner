import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'nav-input-number',
  templateUrl: './nav-input-number.component.html',
  styleUrls: ['./nav-input-number.component.scss'],
})
export class NavInputNumberComponent {
  @Input() public label: string;
  @Input() public formName: string;
  @Input() public parentForm: FormGroup;
}
