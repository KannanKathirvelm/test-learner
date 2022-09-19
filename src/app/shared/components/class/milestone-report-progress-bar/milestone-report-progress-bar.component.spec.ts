
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MilestoneReportProgressBarComponent } from './milestone-report-progress-bar.component';

describe('MilestoneReportProgressBarComponent', () => {
  let component: MilestoneReportProgressBarComponent;
  let fixture: ComponentFixture<MilestoneReportProgressBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MilestoneReportProgressBarComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneReportProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
