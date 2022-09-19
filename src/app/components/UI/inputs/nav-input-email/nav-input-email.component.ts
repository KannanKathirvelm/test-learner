import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'nav-input-email',
  templateUrl: './nav-input-email.component.html',
  styleUrls: ['./nav-input-email.component.scss'],
})
export class NavInputEmailComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public parentForm: FormGroup;
  @Input() public label: string;
  @Input() public isRequired: boolean;
  @Output() public enterEmail = new EventEmitter();
  @Input() public emailId: string;
  @Input() public autofocus: string;
  @ViewChild('input', { static: true }) public ionInput: IonInput;

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.autofocus && changes.autofocus.currentValue && !changes.autofocus.firstChange) {
      this.ionInput.setFocus();
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function onEnterEmail
   * This method is triggered when email entered
   */
  public onEnterEmail() {
    this.enterEmail.emit();
  }
}
