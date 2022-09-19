import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassActivityPage } from './class-activity.page';

describe('ClassActivityPage', () => {
  let component: ClassActivityPage;
  let fixture: ComponentFixture<ClassActivityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassActivityPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassActivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
