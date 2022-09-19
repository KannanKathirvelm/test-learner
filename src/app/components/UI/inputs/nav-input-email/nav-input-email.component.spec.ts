import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NavInputEmailComponent } from './nav-input-email.component';

describe('NavInputEmailComponent', () => {
  let component: NavInputEmailComponent;
  let fixture: ComponentFixture<NavInputEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavInputEmailComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NavInputEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
