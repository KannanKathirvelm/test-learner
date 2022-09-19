import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GradeLevelCategoryComponent } from './grade-level-category.component';

describe('GradeLevelCategoryComponent', () => {
  let component: GradeLevelCategoryComponent;
  let fixture: ComponentFixture<GradeLevelCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GradeLevelCategoryComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GradeLevelCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
