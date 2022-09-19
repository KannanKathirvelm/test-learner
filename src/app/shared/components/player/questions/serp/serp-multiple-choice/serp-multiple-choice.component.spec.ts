import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SerpMultipleChoiceComponent } from './serp-multiple-choice.component';

describe('SerpMultipleChoiceComponent', () => {
  let component: SerpMultipleChoiceComponent;
  let fixture: ComponentFixture<SerpMultipleChoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SerpMultipleChoiceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SerpMultipleChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
