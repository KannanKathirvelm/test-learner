import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PortfolioCalendarComponent } from './portfolio-calendar.component';

describe('PortfolioCalendar', () => {
    let component: PortfolioCalendarComponent;
    let fixture: ComponentFixture<PortfolioCalendarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PortfolioCalendarComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(PortfolioCalendarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
