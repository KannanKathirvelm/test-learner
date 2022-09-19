import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionModel } from '@shared/models/collection/collection';
import { LessonModel } from '@shared/models/lesson/lesson';
import { MilestoneLocationModel } from '@shared/models/location/location';

@Component({
  selector: 'your-location-popover',
  templateUrl: './your-location-popover.component.html',
  styleUrls: ['./your-location-popover.component.scss'],
})
export class YourLocationPopoverComponent implements OnChanges {
  @Input() public currentLocation: MilestoneLocationModel;
  @Input() public collection: CollectionModel;
  @Input() public currentLesson: LessonModel;
  @Input() public lessonSequence: number;
  public title: string;

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.currentLesson && changes.currentLesson.currentValue && !this.collection) {
      this.title = this.currentLesson.lessonTitle;
    }
    if (changes.collection && changes.collection.currentValue) {
      this.title = this.collection.title;
    }
  }
}
