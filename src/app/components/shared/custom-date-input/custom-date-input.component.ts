import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDatePickerComponent } from '../custom-date-picker/custom-date-picker.component';

@Component({
  selector: 'app-custom-date-input',
  standalone: true,
  imports: [CommonModule, CustomDatePickerComponent],
  template: `
    <div
      class="floating-label-group"
      [class.has-value]="hasValue"
      [class.focused]="isFocused"
    >
      <label class="floating-label">{{ label }}</label>
      <div class="input-container" #inputContainer>
        <input
          type="text"
          class="floating-input"
          [value]="displayValue"
          [placeholder]="placeholder"
          [disabled]="disabled"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (click)="onInputClick()"
          readonly
        />
        <button
          type="button"
          class="date-picker-button"
          (click)="togglePicker()"
          [disabled]="disabled"
        >
          <svg
            class="calendar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>

      <app-custom-date-picker
        *ngIf="showPicker"
        [selectedDate]="selectedDate"
        [minDate]="minDate"
        [maxDate]="maxDate"
        [isOpen]="showPicker"
        (dateSelected)="onDateSelected($event)"
        (pickerClosed)="onPickerClosed()"
      ></app-custom-date-picker>
    </div>
  `,
  styles: [
    `
      :host {
        --DHAGreen: #016635;
        --DHAOrange: #f3801f;
        --DHALightOrange: #f8ab18;
        --DHARed: #ea2127;
        --DHABrown: #9e5c26;
        --DHAApache: #ddc16a;
        --DHALaser: #caac6c;
        --DHAMaroon: #711d12;
        --DHAWhite: #ffffff;
        --DHAOffWhite: #fbfbfb;
        --DHABlack: #000000;
        --DHAOffBlack: rgb(51, 51, 51);
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHAGrayLight: gainsboro;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
      }

      .floating-label-group {
        position: relative;
        margin-top: 10px;
      }

      .floating-label {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        background-color: var(--DHAWhite);
        padding: 0 4px;
        font-size: 16px;
        color: var(--DHATextGray);
        font-weight: 600;
        pointer-events: none;
        transition: all 0.3s ease;
        z-index: 1;
      }

      .floating-label-group.focused .floating-label,
      .floating-label-group.has-value .floating-label {
        top: 0;
        font-size: 12px;
        color: var(--DHAGreen);
        transform: translateY(-50%);
      }

      .input-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .floating-input {
        width: 100%;
        padding: 16px 12px;
        border: 1px solid var(--DividerGray);
        border-radius: 6px;
        font-size: 16px;
        background-color: var(--DHAWhite);
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .floating-input:focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
      }

      .floating-input:disabled {
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
      }

      .date-picker-button {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .date-picker-button:hover:not(:disabled) {
        background-color: #f0f8f0;
      }

      .date-picker-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .calendar-icon {
        width: 20px;
        height: 20px;
        color: var(--DHAGreen);
      }

      /* Hide the date format hint when not focused and no value */
      .floating-input::placeholder {
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .floating-label-group.focused .floating-input::placeholder,
      .floating-label-group.has-value .floating-input::placeholder {
        opacity: 0.5;
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .floating-input {
          font-size: 16px; /* Prevent zoom on iOS */
          padding: 16px 12px;
        }

        .date-picker-button {
          padding: 6px;
        }

        .calendar-icon {
          width: 22px;
          height: 22px;
        }
      }

      /* Error state */
      .floating-label-group.error .floating-input {
        border-color: #e74c3c;
      }

      .floating-label-group.error .floating-label {
        color: #e74c3c;
      }

      /* Success state */
      .floating-label-group.success .floating-input {
        border-color: var(--DHAGreen);
      }

      .floating-label-group.success .floating-label {
        color: var(--DHAGreen);
      }
    `,
  ],
})
export class CustomDateInputComponent implements OnInit, OnDestroy, OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() value: Date | null = null;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() error: string = '';
  @Input() success: boolean = false;
  @Output() valueChange = new EventEmitter<Date | null>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  @ViewChild('inputContainer', { static: false })
  inputContainerRef!: ElementRef;

  selectedDate: Date | null = null;
  showPicker: boolean = false;
  isFocused: boolean = false;

  ngOnInit() {
    this.selectedDate = this.value;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['value'] &&
      changes['value'].currentValue !== this.selectedDate
    ) {
      this.selectedDate = changes['value'].currentValue;
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  get hasValue(): boolean {
    return this.selectedDate !== null;
  }

  get displayValue(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  onFocus() {
    this.isFocused = true;
    this.focus.emit();
  }

  onBlur() {
    // Delay blur to allow for picker interactions
    setTimeout(() => {
      if (!this.showPicker) {
        this.isFocused = false;
        this.blur.emit();
      }
    }, 150);
  }

  onInputClick() {
    if (!this.disabled) {
      this.togglePicker();
    }
  }

  togglePicker() {
    if (this.disabled) return;
    this.showPicker = !this.showPicker;
    if (this.showPicker) {
      this.isFocused = true;
    }
  }

  onDateSelected(date: Date | null) {
    this.selectedDate = date;
    this.valueChange.emit(date);
    this.showPicker = false;
    this.isFocused = false;
  }

  onPickerClosed() {
    this.showPicker = false;
    this.isFocused = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const inputContainer = this.inputContainerRef?.nativeElement;

    if (inputContainer && !inputContainer.contains(target)) {
      this.showPicker = false;
      this.isFocused = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showPicker) {
      this.showPicker = false;
      this.isFocused = false;
    }
  }

  // Method to programmatically set value
  setValue(date: Date | null) {
    this.selectedDate = date;
    this.valueChange.emit(date);
  }

  // Method to clear the value
  clear() {
    this.setValue(null);
  }

  // Method to get the current value
  getValue(): Date | null {
    return this.selectedDate;
  }
}
