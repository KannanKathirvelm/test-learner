import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { GroupedFeaturedCourseModel } from '@shared/models/course/course';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'nav-featured-course',
  templateUrl: './featured-course.component.html',
  styleUrls: ['./featured-course.component.scss'],
  animations: [
    collapseAnimation({ duration: 500, delay: 0 })
  ],
})
export class FeaturedCourseComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public featuredCourseList: Array<GroupedFeaturedCourseModel>;
  @Output() public scrollToIonContent = new EventEmitter();
  @Output() public takeTour = new EventEmitter();
  @Output() public toggleClassCards: EventEmitter<{ offsetTop: number, selectedIndex: number }> = new EventEmitter();
  @Output() public clickCourseListShowMore: EventEmitter<number> = new EventEmitter();

  constructor(private elementRef: ElementRef, private parseService: ParseService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function scrollToTop
   * Method to scroll top
   */
  public scrollToTop() {
    this.scrollToIonContent.emit();
  }

  /**
   * @function onToggleCourses
   * This method is used to toggle courses
   */
  public onToggleCourses(selectedIndex, isActive) {
    const featuredCourseCard = this.elementRef.nativeElement.querySelector(`.featured-course-${selectedIndex}`) as HTMLElement;
    const offsetTop = isActive ? null : (featuredCourseCard.offsetTop);
    this.toggleClassCards.emit({
      offsetTop,
      selectedIndex
    });
    this.parseService.trackEvent(EVENTS.CLICK_STUDY_HOME_SEE_ALL_COURSE);
  }

  /**
   * @function onToggleClassCards
   * This method is used to show more/less class cards
   */
  public onToggleClassCards(index) {
    this.clickCourseListShowMore.emit(index);
    this.parseService.trackEvent(EVENTS.CLICK_STUDY_HOME_SEE_ALL_COURSE);
  }
}
