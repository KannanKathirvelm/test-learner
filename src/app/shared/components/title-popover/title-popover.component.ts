import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'title-popover',
  templateUrl: './title-popover.component.html',
  styleUrls: ['./title-popover.component.scss'],
})
export class TitlePopoverComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public text: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private navParams: NavParams,
  ) { }

  public ngOnInit() {
    this.text = this.navParams.get('text');
  }

}
