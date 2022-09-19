import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreferencesCategoryPanelComponent } from './preferences-category-panel.component';

describe('PreferencesCategoryPanelComponent', () => {
  let component: PreferencesCategoryPanelComponent;
  let fixture: ComponentFixture<PreferencesCategoryPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreferencesCategoryPanelComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesCategoryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
