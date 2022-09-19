import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NavigatorPage } from './navigator.page';

describe('NavigatorPage', () => {
  let component: NavigatorPage;
  let fixture: ComponentFixture<NavigatorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigatorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
