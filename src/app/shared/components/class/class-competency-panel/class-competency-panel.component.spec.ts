import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassCompetencyPanelComponent } from './class-competency-panel.component';

describe('ClassCompetencyPanelComponent', () => {
  let component: ClassCompetencyPanelComponent;
  let fixture: ComponentFixture<ClassCompetencyPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassCompetencyPanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassCompetencyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
