import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'portfolio-calendar',
  templateUrl: './portfolio-calendar.component.html',
  styleUrls: ['./portfolio-calendar.component.scss'],
})
export class PortfolioCalendarComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public startDate: Date;
  public endDate: Date;
  public dateValue: Array<Date>;
  public showApplyFilter: boolean;
  public filterStartDate: string;
  public filterEndDate: string;
  public startDay: string;
  public startMonth: string;
  public startYear: string;
  public startDayInText: string;
  public endDay: string;
  public endMonth: string;
  public endYear: string;
  public endDayInText: string;
  public selectedDates: Array<Date>;
  public selectionType: boolean;
  public selectedStartDate: Date;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private navParams: NavParams, public modalController: ModalController) {
    const startDate = this.navParams.get('startDate');
    this.selectedDates = this.navParams.get('selectedDates');
    this.startDate = new Date(startDate);
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.endDate = new Date();
    if (this.selectedDates) {
      this.dateValue = this.selectedDates;
      this.selectionType = true;
      this.setDateDetails(this.dateValue[0], this.dateValue[1]);
      this.showApplyFilter = true;
    } else {
      this.selectedStartDate = this.startDate;
      this.selectionType = false;
      this.setDateDetails(this.startDate);
    }
  }

  /**
   * @function setDateDetails
   * This method is used to set the selected date details
   */
  private setDateDetails(startDate, endDate?) {
    startDate = new Date(startDate);
    this.startDay = moment(startDate).format('DD');
    this.startMonth = moment(startDate).format('MMM');
    this.startYear = moment(startDate).format('YYYY');
    this.startDayInText = moment(startDate).format('dddd');
    if (endDate) {
      this.endDay = moment(endDate).format('DD');
      this.endMonth = moment(endDate).format('MMM');
      this.endYear = moment(endDate).format('YYYY');
      this.endDayInText = moment(endDate).format('dddd');
    }
  }

  /**
   * @function onSelectDate
   * This method triggered when the user select the date
   */
  public onSelectRangeDate() {
    if (this.dateValue && this.dateValue[0] && this.dateValue[1]) {
      this.showApplyFilter = true;
      this.filterStartDate = moment(this.dateValue[0]).format('YYYY-MM-DD');
      this.filterEndDate = moment(this.dateValue[1]).format('YYYY-MM-DD');
      this.setDateDetails(this.filterStartDate, this.filterEndDate);
    } else {
      this.setDateDetails(this.dateValue[0]);
      this.showApplyFilter = false;
    }
  }

  /**
   * @function onSelectDate
   * This method is used to set the selected date
   */
  public onSelectDate() {
    this.setDateDetails(this.selectedStartDate);
    this.showApplyFilter = false;
  }

  /**
   * @function onCloseModel
   * This method triggered when the user close the model
   */
  public onCloseModel(params?) {
    this.modalController.dismiss(params);
  }

  /**
   * @function selectStartDate
   * This method is used to set the start date
   */
  public selectStartDate() {
    if (this.dateValue) {
      this.selectedStartDate = this.dateValue[0];
    }
    this.selectionType = false;
  }

  /**
   * @function selectStartDate
   * This method is used to set the end date
   */
  public selectEndDate() {
    this.dateValue = [];
    this.dateValue[0] = this.selectedStartDate;
    this.selectionType = true;
  }

  /**
   * @function onClickDone
   * This method triggered when the user click the done.
   */
  public onClickDone() {
    const filterStartDate = this.filterStartDate;
    const filterEndDate = this.filterEndDate;
    const selectedDates = this.dateValue;
    const params = {
      filterStartDate,
      filterEndDate,
      selectedDates
    };
    this.onCloseModel(params);
  }
}
