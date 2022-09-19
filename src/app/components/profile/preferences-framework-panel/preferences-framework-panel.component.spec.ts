import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreferenceFrameworkPanelComponent } from './preferences-framework-panel.component';

describe('PreferenceFrameworkPanelComponent', () => {
  let component: PreferenceFrameworkPanelComponent;
  let fixture: ComponentFixture<PreferenceFrameworkPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferenceFrameworkPanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferenceFrameworkPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
