import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassActivitiesPanelComponent } from './class-activities-panel.component';

describe('ClassActivitiesPanelComponent', () => {
  let component: ClassActivitiesPanelComponent;
  let fixture: ComponentFixture<ClassActivitiesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassActivitiesPanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassActivitiesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
