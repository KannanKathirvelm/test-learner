import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MilestonePanelPopUpComponent } from './milestone-panel-popup.component';

describe('MilestonePanelPopUpComponent', () => {
  let component: MilestonePanelPopUpComponent;
  let fixture: ComponentFixture<MilestonePanelPopUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestonePanelPopUpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MilestonePanelPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
