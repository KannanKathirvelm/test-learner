import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'nav-input-text',
  templateUrl: './nav-input-text.component.html',
  styleUrls: ['./nav-input-text.component.scss'],
})
export class NavInputTextComponent {
  @Input() public label: string;
  @Input() public formName: string;
  @Input() public parentForm: FormGroup;
  @Input() public isRequired: boolean;
  @Input() public usernameVal: string;
}
