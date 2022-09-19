import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearningMapComponent } from './learning-map.component';

describe('LearningMapComponent', () => {
  let component: LearningMapComponent;
  let fixture: ComponentFixture<LearningMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningMapComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LearningMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
