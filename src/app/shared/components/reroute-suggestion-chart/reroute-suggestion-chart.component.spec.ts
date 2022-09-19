import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RerouteSuggestionChartComponent } from './reroute-suggestion-chart.component';

describe('RerouteSuggestionChartComponent', () => {
  let component: RerouteSuggestionChartComponent;
  let fixture: ComponentFixture<RerouteSuggestionChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RerouteSuggestionChartComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RerouteSuggestionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
