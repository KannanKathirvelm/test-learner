import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rating',
  template: `
    <div class="star-rating">
      <button [disabled]="readonly" fill="clear" *ngFor="let current of [].constructor(max); let i = index"
        (click)="onClick(i + 1)">
        <ion-icon slot="icon-only" name="star" [class.filled]="(i + 1 <= hoverRate || (!hoverRate && i + 1 <= rate))"></ion-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .star-rating{
        display: flex;
        justify-content: space-evenly;
      }

      ion-buttons {
        display: flex;
        justify-content: center;
      }

      [ion-button][disabled] {
        opacity: 1;
      }

      ion-icon {
        color: gray;
      }

      ion-icon.filled {
        color: orange;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ]
})
export class RatingComponent implements ControlValueAccessor {
  @Input()
  public rate: number;
  @Input()
  public max: number;
  @Input()
  public readonly: boolean;
  @Input()
  public size: string;
  @Output()
  public rateChange: EventEmitter<number> = new EventEmitter();
  public hoverRate: number;
  // tslint:disable-next-line
  public onChange: Function;

  public onClick(rate) {
    this.rate = rate;
    this.rateChange.emit(this.rate);
    this.onChange(this.rate);
  }

  public writeValue(value: any): void {
    if (value !== undefined) {
      this.rate = value;
    }
  }

  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  // tslint:disable-next-line
  public registerOnTouched(fn: any): void { }

  public setDisabledState?(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }
}
