import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'nav-taxonomy-popover',
  templateUrl: './taxonomy-popover.component.html',
  styleUrls: ['./taxonomy-popover.component.scss'],
})
export class TaxonomyPopoverComponent implements OnInit {

  public taxonomyList: any;

  constructor(private navParams: NavParams) { }

  public ngOnInit() {
    this.taxonomyList = this.navParams.get('taxonomyList');
  }

}
