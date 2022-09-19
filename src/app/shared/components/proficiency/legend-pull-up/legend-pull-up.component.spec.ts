import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LegendPullUpComponent } from './legend-pull-up.component';

describe('LegendPullUp', () => {
    let component: LegendPullUpComponent;
    let fixture: ComponentFixture<LegendPullUpComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LegendPullUpComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(LegendPullUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
