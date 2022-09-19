import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CountryModel } from '@models/auth/signup';

@Component({
  selector: 'app-nav-input-select',
  templateUrl: './nav-input-select.component.html',
  styleUrls: ['./nav-input-select.component.scss'],
})
export class NavInputSelectComponent {
  @Input() public parentForm: FormGroup;
  @Input() public label: string;
  @Input() public countries: Array<CountryModel>;
  @Input() public isRequired: boolean;
}
