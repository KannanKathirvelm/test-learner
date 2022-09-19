import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MilestoneLessonReportComponent } from './milestone-lesson-report.component';

describe('MilestoneLessonReportComponent', () => {
  let component: MilestoneLessonReportComponent;
  let fixture: ComponentFixture<MilestoneLessonReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestoneLessonReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneLessonReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
