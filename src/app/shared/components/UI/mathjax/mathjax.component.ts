import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
@Component({
  selector: 'mathjax',
  templateUrl: './mathjax.component.html',
  styleUrls: ['./mathjax.component.scss']
})
export class MathjaxComponent implements OnInit {
  @Input() public content: string;
  @Output() public mathjaxRendered = new EventEmitter();

  public renderMath() {
    const mathjax = window['MathJax'];
    mathjax.Hub.Queue(['Typeset', mathjax.Hub]);
    mathjax.Hub.Queue(() => {
      this.mathjaxRendered.emit();
    });
  }

  public ngOnInit() {
    this.renderMath();
  }
}
