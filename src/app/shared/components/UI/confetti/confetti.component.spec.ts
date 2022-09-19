import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConfettiComponent } from './confetti.component';

describe('ConfettiComponent', () => {
  let component: ConfettiComponent;
  let fixture: ComponentFixture<ConfettiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfettiComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfettiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
