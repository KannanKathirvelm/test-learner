import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserSubjectCompetencyComponent } from './user-subject-competency.component';

describe('UserSubjectCompetencyComponent', () => {
  let component: UserSubjectCompetencyComponent;
  let fixture: ComponentFixture<UserSubjectCompetencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSubjectCompetencyComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSubjectCompetencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
