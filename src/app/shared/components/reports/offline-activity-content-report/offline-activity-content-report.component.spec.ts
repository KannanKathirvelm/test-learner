import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfflineActivityContentReportComponent } from './offline-activity-content-report.component';

describe('OfflineActivityContentReportComponent', () => {
  let component: OfflineActivityContentReportComponent;
  let fixture: ComponentFixture<OfflineActivityContentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineActivityContentReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineActivityContentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
