import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContentReportComponent } from './content-report.component';

describe('ContentReportComponent', () => {
  let component: ContentReportComponent;
  let fixture: ComponentFixture<ContentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
