import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemsToGradePage } from './items-to-grade.page';

describe('ItemsToGradePage', () => {
  let component: ItemsToGradePage;
  let fixture: ComponentFixture<ItemsToGradePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemsToGradePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsToGradePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
