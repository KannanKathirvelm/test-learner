import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

export interface SearchSelectModel {
  id: string;
  name: string;
}

@Component({
  selector: 'select-with-search-bar',
  templateUrl: './select-with-search-bar.component.html',
  styleUrls: ['./select-with-search-bar.component.scss'],
  animations: []
})
export class SelectWithSearchBarComponent implements OnInit {
  @Input() public dataList: Array<SearchSelectModel>;
  @Input() public selectedValue: SearchSelectModel;
  public searchText: string;


  public ngOnInit() {
    if (this.selectedValue) {
      this.searchText = this.selectedValue.name;
    }
  }

  constructor(private modalCtrl: ModalController) { }

  /**
   * @function handleInputEvent
   * Method to handle input event when search functionality
   */
  public handleInputEvent(event) {
    this.searchText = event.target.value.toLowerCase();
  }

  /**
   * @function togglePullUp
   * Method to handle toogle pull up
   */
  public togglePullUp() {
    this.modalCtrl.dismiss({
      selectedValue: this.selectedValue
    });
  }

  /**
   * @function onClick
   * Method to handle the selected value
   */
  public onClick(value) {
    this.selectedValue = value;
  }

  /**
   * @function onClickCancel
   * Method to handle cancel the selected value
   */
  public onClickCancel() {
    this.selectedValue = null;
    this.modalCtrl.dismiss();
    this.searchText = '';
  }

  /**
   * @function onClickDone
   * Method to handle done the selected value
   */
  public onClickDone() {
    this.togglePullUp();
    this.searchText = '';
  }
}
