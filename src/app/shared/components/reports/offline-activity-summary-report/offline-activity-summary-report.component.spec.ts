import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfflineActivitySummaryReportComponent } from './offline-activity-summary-report.component';

describe('OfflineActivitySummaryReportComponent', () => {
  let component: OfflineActivitySummaryReportComponent;
  let fixture: ComponentFixture<OfflineActivitySummaryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineActivitySummaryReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineActivitySummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
