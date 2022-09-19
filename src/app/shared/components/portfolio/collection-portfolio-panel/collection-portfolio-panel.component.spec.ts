import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CollectionPortfolioPanelComponent } from './collection-portfolio-panel.component';

describe('CollectionPortfolioPanelComponent', () => {
  let component: CollectionPortfolioPanelComponent;
  let fixture: ComponentFixture<CollectionPortfolioPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionPortfolioPanelComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionPortfolioPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
