import { Component } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { NavParams } from '@ionic/angular';
import { ModalService } from '@shared/providers/service/modal.service';
import * as moment from 'moment';

@Component({
  selector: 'nav-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss'],
})
export class CalenderComponent {
  // -------------------------------------------------------------------------
  // Properties
  public firstCaMinDate: Date;
  public firstCaMaxDate: Date;
  public secondCaMinDate: Date;
  public secondCaMaxDate: Date;
  public dateValue: Array<Date>;
  public startDay: string;
  public startMonth: string;
  public startYear: string;
  public startDayInText: string;
  public endDay: string;
  public endMonth: string;
  public endYear: string;
  public endDayInText: string;
  public isFirstCalenderSelected: boolean;
  public selectedStartDate: Date;
  public selectedEndDate: Date;
  public yearRange: string;


  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private navParams: NavParams,
    public modalService: ModalService,
    private parseService: ParseService
  ) {
    this.initialize();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function initialize
   * This method is used to set min, max and default date
   */
  public initialize() {
    this.isFirstCalenderSelected = true;
    const minDate = this.navParams.get('minDate');
    const maxDate = this.navParams.get('maxDate');
    this.firstCaMinDate = this.secondCaMinDate = minDate ? new Date(minDate) : new Date();
    this.firstCaMaxDate = this.secondCaMaxDate = maxDate ? new Date(maxDate) : null;
    this.setDateDetails(this.firstCaMinDate, this.secondCaMaxDate);
    this.yearRange = `${this.startYear}:${Number(this.startYear) + 30}`;
  }

  /**
   * @function setDateDetails
   * This method is used to set the selected date details
   */
  private setDateDetails(startDate, endDate) {
    // set start date month date year and day
    this.startDay = moment(startDate).format('DD');
    this.startMonth = moment(startDate).format('MMM');
    this.startYear = moment(startDate).format('YYYY');
    this.startDayInText = moment(startDate).format('dddd');
    this.secondCaMinDate = startDate;
    this.selectedStartDate = startDate;

    // set end date month date year and day
    endDate = startDate > endDate ? startDate : endDate;
    this.endDay = moment(endDate).format('DD');
    this.endMonth = moment(endDate).format('MMM');
    this.endYear = moment(endDate).format('YYYY');
    this.endDayInText = moment(endDate).format('dddd');
    this.selectedEndDate = endDate;
  }

  /**
   * @function selectStartDate
   * This method is used to set the start date
   */
  public selectStartDate() {
    this.isFirstCalenderSelected = true;
  }

  /**
   * @function selectStartDate
   * This method is used to set the end date
   */
  public selectEndDate() {
    this.isFirstCalenderSelected = false;
  }

  // -------------------------------------------------------------------------
  // Events

  /**
   * @function onSelectDate
   * This method is used to set the selected date
   */
  public onSelectDate() {
    this.setDateDetails(this.selectedStartDate, this.selectedEndDate);
  }

  /**
   * @function onTodayClick
   * This method is used to set today date
   */
  public onTodayClick() {
    this.selectedStartDate = new Date();
    this.setDateDetails(this.selectedStartDate, this.selectedEndDate);
  }

  /**
   * @function onClearClick
   * This method is used to reset
   */
  public onClearClick() {
    this.initialize();
  }

  /**
   * @function onCloseModel
   * This method triggered when the user close the model
   */
  public onCloseModel(params?) {
    this.modalService.dismissModal(params);
  }

  /**
   * @function onClickDone
   * This method triggered when the user click the done.
   */
  public onClickDone() {
    const params = {
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate
    };
    this.onCloseModel(params);
    this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_DATERANGE_SUBMIT);
  }
}
