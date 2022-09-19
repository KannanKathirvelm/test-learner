import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'nav-input-password',
  templateUrl: './nav-input-password.component.html',
  styleUrls: ['./nav-input-password.component.scss'],
})
export class NavInputPasswordComponent {
  @Input() public parentForm: FormGroup;
  @Input() public label: string;
  @Input() public formName: string;
  @Input() public isRequired: boolean;
}
