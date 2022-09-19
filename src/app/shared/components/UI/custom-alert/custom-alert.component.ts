import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { alertFadeAnimation, fadeSlowAnimation, fadeUpAnimation } from '@shared/animations';

@Component({
  selector: 'nav-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss'],
  animations: [alertFadeAnimation, fadeSlowAnimation, fadeUpAnimation]
})
export class CustomAlertComponent implements OnInit {
  public displayAlert: boolean;
  @Input() public successMessage1: string;
  @Input() public successMessage2: string;
  @Output() public dismissAlert = new EventEmitter();

  public ngOnInit() {
    this.displayAlert = true;
    setTimeout(() => {
      this.dismissAlert.emit(true);
      this.displayAlert = false;
    }, 3000);
  }
}
