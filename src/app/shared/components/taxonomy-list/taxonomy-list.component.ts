import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TaxonomyPopoverComponent } from '@shared/components/UI/popover/taxonomy-popover/taxonomy-popover.component';

@Component({
  selector: 'nav-taxonomy-list',
  templateUrl: './taxonomy-list.component.html',
  styleUrls: ['./taxonomy-list.component.scss'],
})
export class TaxonomyListComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public taxonomy: any;
  @Input() public showCount: number;
  public taxonomyCount: number;
  public moreItems: Array<any>;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private popoverController: PopoverController) {
    this.moreItems = [];
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.taxonomyCount = this.showCount || 1;
    if (this.taxonomy && this.taxonomyCount) {
      Object.keys(this.taxonomy).forEach((key, index) => {
        if (index >= Number(this.taxonomyCount)) {
          const item = this.taxonomy[key];
          this.moreItems.push(item);
        }
      });
    }
  }

  /**
   * @function showTaxonomyPopover
   * This method trigger when user clicks on more icon
   */
  public async showTaxonomyPopover(event) {
    const popover = await this.popoverController.create({
      component: TaxonomyPopoverComponent,
      event,
      componentProps: { taxonomyList: this.moreItems },
      translucent: true,
      cssClass: 'taxonomy-popover'
    });
    return await popover.present();
  }
}
