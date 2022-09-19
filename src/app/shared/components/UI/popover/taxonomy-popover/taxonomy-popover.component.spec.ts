import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TaxonomyPopoverComponent } from './taxonomy-popover.component';

describe('PopoverComponent', () => {
    let component: TaxonomyPopoverComponent;
    let fixture: ComponentFixture<TaxonomyPopoverComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TaxonomyPopoverComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(TaxonomyPopoverComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
