import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PageRefresherComponent } from './page-refresher.component';

describe('PageRefresherComponent', () => {
  let component: PageRefresherComponent;
  let fixture: ComponentFixture<PageRefresherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageRefresherComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PageRefresherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
