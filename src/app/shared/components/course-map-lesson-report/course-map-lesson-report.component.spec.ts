import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CourseMapLessonReportComponent } from './course-map-lesson-report.component';

describe('CourseMapLessonReportComponent', () => {
  let component: CourseMapLessonReportComponent;
  let fixture: ComponentFixture<CourseMapLessonReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseMapLessonReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseMapLessonReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
