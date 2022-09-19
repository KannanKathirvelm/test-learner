import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { StudentClassProgressReportComponent } from './student-class-progress-report.component';

describe('StudentClassProgressReportComponent', () => {
  let component: StudentClassProgressReportComponent;
  let fixture: ComponentFixture<StudentClassProgressReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentClassProgressReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentClassProgressReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
