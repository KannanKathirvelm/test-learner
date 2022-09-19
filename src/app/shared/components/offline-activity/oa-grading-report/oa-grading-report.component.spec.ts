import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OaGradingReportComponent } from './oa-grading-report.component';

describe('OaGradingReportComponent', () => {
  let component: OaGradingReportComponent;
  let fixture: ComponentFixture<OaGradingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OaGradingReportComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OaGradingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
