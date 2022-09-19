import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FreeResponseComponent } from './free-response.component';

describe('FreeResponseComponent', () => {
  let component: FreeResponseComponent;
  let fixture: ComponentFixture<FreeResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreeResponseComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FreeResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
