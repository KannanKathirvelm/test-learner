import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'nav-confetti',
  templateUrl: './confetti.component.html',
  styleUrls: ['./confetti.component.scss'],
})
export class ConfettiComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  public confettiCount: number;
  @Output() public hideConfetti = new EventEmitter();

  constructor() {
    this.confettiCount = 150;
  }

  public ngOnInit() {
    // setimeout is used to hide after 15sec
    setTimeout(() => {
      this.hideConfetti.emit();
    }, 15000);
  }
}
