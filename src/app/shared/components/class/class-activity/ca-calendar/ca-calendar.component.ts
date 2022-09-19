import { Component, EventEmitter, Input, Output } from '@angular/core';
import { formatDate, formatMonthDate } from '@shared/utils/global';
import * as moment from 'moment';

@Component({
  selector: 'nav-ca-calendar',
  templateUrl: './ca-calendar.component.html',
  styleUrls: ['./ca-calendar.component.scss'],
})
export class CaCalendarComponent {
  public currentDate: Date;
  public currentWeek: Array<Date>;
  public currentMonth: Date;
  public todayDate: string;
  @Input() set dailyViewDate(date: string) {
    this.currentDate = new Date(date);
  }
  @Input() set weeklyViewDate(date: string) {
    this.selectWeek(new Date(date));
  }
  @Input() set monthlyViewDate(date: string) {
    this.currentMonth = new Date(date);
  }
  @Input() public isWeeklyView: boolean;
  @Input() public isDailyView: boolean;
  @Input() public isMonthlyView: boolean;
  @Input() public disabledDates: Array<Date>;
  @Input() public highlightDates: Array<string>;
  @Output() public toggleCalendar = new EventEmitter();
  @Output() public selectView = new EventEmitter<string>();
  @Output() public dailyViewMonthChanged = new EventEmitter<string>();
  @Output() public dailyViewDateChanged = new EventEmitter<{ startDate: string; endDate?: string; }>();
  @Output() public weeklyViewMonthChanged = new EventEmitter<string>();
  @Output() public weeklyViewDateChanged = new EventEmitter<{ startDate: string; endDate?: string; }>();
  @Output() public monthlyViewMonthChanged = new EventEmitter<{ startDate: string; endDate?: string; }>();

  constructor() {
    this.currentDate = new Date();
    this.currentWeek = [];
    this.selectWeek(new Date());
    this.currentMonth = new Date();
    this.todayDate = moment().format('YYYY-MM-DD');
  }

  /**
   * This method is triggered when user select view
   */
  public onClickView(view) {
    this.selectView.emit(view);
  }

  /**
   * This method is triggered when user select date
   */
  public onDailyViewDateChange(date) {
    const startDate = moment(date).format('YYYY-MM-DD');
    this.dailyViewDateChanged.emit({ startDate });
    this.toggleCalendar.emit();
  }

  /**
   * This method is triggered when user change month on daily view
   * @param {Date}date
   */
  public onDailyViewMonthChange(date) {
    const formatedDate = formatMonthDate(date);
    this.dailyViewMonthChanged.emit(formatedDate);
  }

  /**
   * This method is triggered when user change month on weekly view
   * @param {Date}date
   */
  public onWeeklyViewMonthChange(date) {
    const formatedDate = formatMonthDate(date);
    this.weeklyViewMonthChanged.emit(formatedDate);
  }

  /**
   * This method is triggered when user select date on weekly view
   * @param {Date}date
   */
  public onWeeklyViewDateChange(date) {
    this.selectWeek(date);
    const startDate = moment(this.currentWeek[0]).format('YYYY-MM-DD');
    const endDate = moment(this.currentWeek[1]).format('YYYY-MM-DD');
    this.weeklyViewDateChanged.emit({ startDate, endDate });
    this.toggleCalendar.emit();
  }

  /**
   * This method is triggered when user select month on monthly view
   * @param {string}date
   */
  public onMontlyViewMonthChange(date) {
    const startDate = moment(new Date(date)).format('YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
    this.monthlyViewMonthChanged.emit({ startDate, endDate });
    this.toggleCalendar.emit();
  }

  /**
   * This method is used to set startDate and endDate for selected week
   * @param {Date}date
   */
  private selectWeek(selectedDate: Date) {
    selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());
    this.currentWeek[0] = selectedDate;
    const selectedEndDate = new Date(selectedDate);
    selectedEndDate.setDate(selectedDate.getDate() + 6);
    this.currentWeek[1] = selectedEndDate;
  }

  /**
   * This method is used to add a class based on activity exists
   * @param {Date}date
   */
  public isActivityExists(date) {
    const formatedDate = formatDate(date);
    const isExists = this.highlightDates ?
      this.highlightDates.includes(formatedDate) : false;
    return isExists ? 'highlight' : 'no-activities';
  }
}
