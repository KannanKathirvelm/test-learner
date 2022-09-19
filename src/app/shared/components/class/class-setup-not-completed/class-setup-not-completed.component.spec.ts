import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassSetupNotCompletedComponent } from './class-setup-not-completed.component';

describe('ClassSetupNotCompletedComponent', () => {
  let component: ClassSetupNotCompletedComponent;
  let fixture: ComponentFixture<ClassSetupNotCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassSetupNotCompletedComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassSetupNotCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
