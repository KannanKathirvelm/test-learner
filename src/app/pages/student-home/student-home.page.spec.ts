import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentHomePage } from './student-home.page';

describe('StudentHomePage', () => {
  let component: StudentHomePage;
  let fixture: ComponentFixture<StudentHomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentHomePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
