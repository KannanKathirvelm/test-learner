import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LessonListPullupComponent } from './lesson-list-pullup.component';

describe('LessonListPullupComponent', () => {
  let component: LessonListPullupComponent;
  let fixture: ComponentFixture<LessonListPullupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LessonListPullupComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonListPullupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
