import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassActivityListPage } from './class-activities.page';

describe('ClassActivityListPage', () => {
  let component: ClassActivityListPage;
  let fixture: ComponentFixture<ClassActivityListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassActivityListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassActivityListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
