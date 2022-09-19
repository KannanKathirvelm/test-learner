import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MathjaxComponent } from './mathjax.component';

describe('MathjaxComponent', () => {
  let component: MathjaxComponent;
  let fixture: ComponentFixture<MathjaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MathjaxComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MathjaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
