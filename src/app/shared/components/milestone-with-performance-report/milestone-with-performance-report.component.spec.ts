import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MilestoneWithPerformanceReportComponent } from './milestone-with-performance-report.component';

describe('MilestoneWithPerformanceReportComponent', () => {
  let component: MilestoneWithPerformanceReportComponent;
  let fixture: ComponentFixture<MilestoneWithPerformanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestoneWithPerformanceReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneWithPerformanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
