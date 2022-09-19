import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GradeRubricCategoryComponent } from './grade-rubric-category.component';

describe('GradeRubricCategoryComponent', () => {
  let component: GradeRubricCategoryComponent;
  let fixture: ComponentFixture<GradeRubricCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GradeRubricCategoryComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GradeRubricCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
