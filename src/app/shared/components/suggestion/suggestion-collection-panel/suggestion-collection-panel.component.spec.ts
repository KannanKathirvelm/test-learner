import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SuggestionCollectionPanelComponent } from './suggestion-collection-panel.component';

describe('SuggestionCollectionPanelComponent', () => {
  let component: SuggestionCollectionPanelComponent;
  let fixture: ComponentFixture<SuggestionCollectionPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SuggestionCollectionPanelComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestionCollectionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
