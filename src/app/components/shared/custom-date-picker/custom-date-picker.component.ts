import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-date-picker" [class.open]="isOpen">
      <div class="date-picker-header">
        <button
          type="button"
          class="nav-button"
          (click)="previousMonth($event)"
        >
          <span class="arrow">‹</span>
        </button>
        <h3 class="month-year">{{ getCurrentMonthYear() }}</h3>
        <button type="button" class="nav-button" (click)="nextMonth($event)">
          <span class="arrow">›</span>
        </button>
      </div>

      <div class="date-picker-body">
        <div class="day-names">
          <div class="day-name" *ngFor="let day of dayNames">{{ day }}</div>
        </div>

        <div class="calendar-grid">
          <div
            class="calendar-day"
            *ngFor="let day of calendarDays; let i = index"
            [class.other-month]="day.isOtherMonth"
            [class.today]="day.isToday"
            [class.selected]="day.isSelected"
            [class.disabled]="day.isDisabled"
            (click)="selectDate(day, $event)"
          >
            {{ day.date }}
          </div>
        </div>
      </div>

      <div class="date-picker-footer">
        <button type="button" class="btn-secondary" (click)="clearDate($event)">
          Clear
        </button>
        <button
          type="button"
          class="btn-primary"
          (click)="selectTomorrow($event)"
        >
          Tomorrow
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .custom-date-picker {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--DHAWhite);
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        margin-top: 4px;
      }

      .custom-date-picker.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .date-picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
      }

      .nav-button {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        min-height: 32px;
      }

      .nav-button:hover:not(:disabled) {
        background-color: #f5f5f5;
      }

      .nav-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .arrow {
        font-size: 18px;
        font-weight: bold;
        color: var(--DHAGreen);
      }

      .month-year {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--DHAGreen);
      }

      .date-picker-body {
        padding: 16px;
      }

      .day-names {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        margin-bottom: 8px;
      }

      .day-name {
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #666;
        padding: 8px 4px;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }

      .calendar-day {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 32px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        position: relative;
      }

      .calendar-day:hover:not(.disabled) {
        background-color: #f0f8f0;
      }

      .calendar-day.other-month {
        color: #ccc;
      }

      .calendar-day.today {
        background-color: #e8f5e8;
        color: var(--DHAGreen);
        font-weight: 600;
      }

      .calendar-day.selected {
        background-color: var(--DHAGreen);
        color: var(--DHAWhite);
        font-weight: 600;
      }

      .calendar-day.disabled {
        color: #ccc;
        cursor: not-allowed;
        background-color: #f9f9f9;
      }

      .calendar-day.disabled:hover {
        background-color: #f9f9f9;
      }

      .date-picker-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px;
        border-top: 1px solid #e0e0e0;
      }

      .btn-secondary {
        background: none;
        border: 1px solid #e0e0e0;
        color: #666;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .btn-secondary:hover {
        background-color: #f5f5f5;
        border-color: #ccc;
      }

      .btn-primary {
        background-color: var(--DHAGreen);
        border: 1px solid var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .btn-primary:hover {
        background-color: #2d5a2d;
        border-color: #2d5a2d;
      }

      @media (max-width: 768px) {
        .custom-date-picker {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90vw;
          max-width: 320px;
          margin: 0;
        }

        .custom-date-picker.open {
          transform: translate(-50%, -50%);
        }

        .calendar-day {
          min-height: 40px;
          font-size: 16px;
        }

        .day-name {
          padding: 12px 4px;
          font-size: 14px;
        }
      }
    `,
  ],
})
export class CustomDatePickerComponent implements OnInit, OnDestroy {
  @Input() selectedDate: Date | null = null;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() isOpen: boolean = false;
  @Output() dateSelected = new EventEmitter<Date | null>();
  @Output() pickerClosed = new EventEmitter<void>();

  @ViewChild('datePicker', { static: false }) datePickerRef!: ElementRef;

  currentDate: Date = new Date();
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];

  ngOnInit() {
    if (this.selectedDate) {
      this.currentDate = new Date(this.selectedDate);
    }
    this.generateCalendarDays();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  generateCalendarDays() {
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      this.calendarDays.push({
        date: day,
        fullDate: new Date(year, month - 1, day),
        isOtherMonth: true,
        isToday: false,
        isSelected: false,
        isDisabled: this.isDateDisabled(new Date(year, month - 1, day)),
      });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      this.calendarDays.push({
        date: day,
        fullDate: fullDate,
        isOtherMonth: false,
        isToday: this.isToday(fullDate),
        isSelected: this.isSelected(fullDate),
        isDisabled: this.isDateDisabled(fullDate),
      });
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - this.calendarDays.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push({
        date: day,
        fullDate: new Date(year, month + 1, day),
        isOtherMonth: true,
        isToday: false,
        isSelected: false,
        isDisabled: this.isDateDisabled(new Date(year, month + 1, day)),
      });
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.toDateString() === this.selectedDate.toDateString();
  }

  isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  selectDate(day: CalendarDay, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (day.isDisabled || day.isOtherMonth) return;

    this.selectedDate = new Date(day.fullDate);
    this.generateCalendarDays();

    // Emit the selected date immediately
    this.dateSelected.emit(this.selectedDate);
    this.pickerClosed.emit();
  }

  previousMonth(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.generateCalendarDays();
  }

  nextMonth(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.generateCalendarDays();
  }

  isPreviousMonthDisabled(): boolean {
    // Always allow navigation - don't disable previous month button
    return false;
  }

  isNextMonthDisabled(): boolean {
    // Always allow navigation - don't disable next month button
    return false;
  }

  getCurrentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  clearDate(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedDate = null;
    this.generateCalendarDays();
    this.dateSelected.emit(null);
    this.pickerClosed.emit();
  }

  selectTomorrow(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    // Select tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.selectedDate = tomorrow;
    this.generateCalendarDays();
    this.dateSelected.emit(tomorrow);
    this.pickerClosed.emit();
  }
}

interface CalendarDay {
  date: number;
  fullDate: Date;
  isOtherMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}
