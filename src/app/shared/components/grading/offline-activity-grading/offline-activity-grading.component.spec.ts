import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfflineActivityGradingComponent } from './offline-activity-grading.component';

describe('OfflineActivityGradingComponent', () => {
  let component: OfflineActivityGradingComponent;
  let fixture: ComponentFixture<OfflineActivityGradingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineActivityGradingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineActivityGradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
