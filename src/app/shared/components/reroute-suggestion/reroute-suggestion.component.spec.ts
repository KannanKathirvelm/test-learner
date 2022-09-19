import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RerouteSuggestionComponent } from './reroute-suggestion.component';

describe('RerouteSuggestionComponent', () => {
  let component: RerouteSuggestionComponent;
  let fixture: ComponentFixture<RerouteSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RerouteSuggestionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RerouteSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
