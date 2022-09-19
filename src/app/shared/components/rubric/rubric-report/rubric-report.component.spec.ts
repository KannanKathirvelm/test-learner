import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RubricComponent } from './rubric-report.component';

describe('RubricComponent', () => {
  let component: RubricComponent;
  let fixture: ComponentFixture<RubricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RubricComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RubricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
