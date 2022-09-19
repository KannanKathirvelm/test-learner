import { Component } from '@angular/core';
import { APP_CONFIG } from '@config/app.config';

@Component({
  selector: 'app-program-navigate-card',
  templateUrl: './program-navigate-card.component.html',
  styleUrls: ['./program-navigate-card.component.scss'],
})
export class ProgramNavigateCardComponent {

  // -------------------------------------------------------------------------
  // Properties
  public appLogo: string;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor() {
    this.appLogo = APP_CONFIG.appLogo;
  }
}
