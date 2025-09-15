import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormPageLayoutComponent } from '../shared/form-page-layout/form-page-layout.component';
import { SlotService } from '../../services/slot.service';

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  branch: string;
}

interface Province {
  id: string;
  name: string;
}

interface Area {
  id: string;
  name: string;
  provinceId: string;
}

interface Branch {
  id: string;
  name: string;
  areaId: string;
}

interface SlotSearchCriteria {
  branch: string;
  startDate: string;
  endDate: string;
  services: string[];
}

@Component({
  selector: 'app-appointment-results',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormPageLayoutComponent],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Searching for available slots...</p>
    </div>

    <!-- No Slots Available -->
    <app-form-page-layout
      *ngIf="!isLoading && noSlotsAvailable"
      [currentStep]="2"
      [steps]="stepTitles"
    >
      <h3>No Available Slots Found</h3>
      <p>
        We couldn't find any available appointment slots for your selected
        criteria. <br />
        <br />Try editing your search or try again later.
      </p>
      <hr class="summary-divider" />
      <!-- Booking Summary - Always Visible -->
      <div class="booking-summary">
        <h3>Booking Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">📍 Branch:</span>
            <span class="summary-value">{{ getBranchDisplayName() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">📅 Date Range:</span>
            <span class="summary-value">{{ getDateRangeDisplay() }}</span>
          </div>
        </div>
        <button
          type="button"
          (click)="editSearch()"
          class="action-btn std"
          title="Add an accompanying applicant to this booking"
        >
          <div class="btn-contents">
            <span class="btn-icon"></span>
            <span class="btn-text">Edit Search</span>
          </div>
        </button>
      </div>
    </app-form-page-layout>

    <!-- Available Slots -->
    <app-form-page-layout
      *ngIf="!isLoading && !noSlotsAvailable && availableSlots.length > 0"
      [currentStep]="2"
      [steps]="stepTitles"
    >
      <!-- Booking Summary - Always Visible -->
      <div class="booking-summary">
        <h3>Booking Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">📍 Branch:</span>
            <span class="summary-value">{{ getBranchDisplayName() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">📅 Date Range:</span>
            <span class="summary-value">{{ getDateRangeDisplay() }}</span>
          </div>
        </div>
        <button
          type="button"
          (click)="editSearch()"
          class="action-btn std"
          title="Add an accompanying applicant to this booking"
        >
          <div class="btn-contents">
            <span class="btn-text">Edit Search</span>
          </div>
        </button>
        <hr class="summary-divider" />
      </div>

      <!-- Available Slots - Grouped by Day -->
      <div class="slots-container">
        <div class="slots-header">
          <h3>Available Appointment Slots</h3>
          <div class="slots-header-right">
            <div class="slots-count">
              {{ getTotalSlotsCount() }} slots found across
              {{ getUniqueDaysCount() }} days
            </div>
          </div>
        </div>

        <div class="slots-grouped">
          <div
            *ngFor="let dayGroup of getPaginatedDayGroups()"
            class="day-group"
          >
            <div class="day-header" (click)="toggleDayGroup(dayGroup.date)">
              <div class="day-info">
                <span class="day-name">{{
                  getFormattedDayName(dayGroup.date)
                }}</span>
                <span class="day-date">{{
                  getFormattedDate(dayGroup.date)
                }}</span>
              </div>
              <div class="day-stats">
                <span class="slots-count"
                  >{{ dayGroup.slots.length }} slots</span
                >
                <span
                  class="expand-icon"
                  [class.expanded]="dayGroup.isExpanded"
                >
                  ▼
                </span>
              </div>
            </div>

            <div class="day-slots" [class.expanded]="dayGroup.isExpanded">
              <div class="slots-grid">
                <div
                  *ngFor="let slot of dayGroup.slots"
                  class="slot-card"
                  (click)="selectSlot(slot)"
                >
                  <div class="slot-time">{{ getFormattedTime(slot.time) }}</div>
                  <div class="slot-info">
                    <span class="slot-label">from</span>
                    <span class="slot-time-range">{{
                      getTimeRange(slot.time)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="getTotalPages() > 1">
          <button
            type="button"
            (click)="previousPage()"
            [disabled]="currentPage === 0"
            class="pagination-btn"
          >
            ← Previous
          </button>
          <span class="pagination-info">
            Page {{ currentPage + 1 }} of {{ getTotalPages() }}
          </span>
          <button
            type="button"
            (click)="nextPage()"
            [disabled]="currentPage >= getTotalPages() - 1"
            class="pagination-btn"
          >
            Next →
          </button>
        </div>
      </div>
    </app-form-page-layout>
  `,
  styles: [
    `
      :host {
        --DHAGreen: #016635;
        --DHAOrange: #f3801f;
        --DHALightOrange: #f8ab18;
        --DHAWhite: #ffffff;
        --DHAOffWhite: #fbfbfb;
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHAOffBlack: rgb(42, 41, 41);
        --DHADisabledTextGray: #c4c4c4;
        --DHAGrayLight: gainsboro;
        --form-width: 600px;
        --step-form-gap: 20px;
        --mobile-form-height: 600px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding-top: 73px;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--DHABackGroundLightGray);
        border-top: 4px solid var(--DHAGreen);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .loading-container p {
        color: var(--DHATextGrayDark);
        font-size: 16px;
        margin: 0;
      }

      h3 {
        color: var(--DHAOrange);
        margin-bottom: 15px;
        font-size: 1.5rem;
        text-align: center;
      }

      p {
        color: var(--DHATextGrayDark);
        margin-bottom: 30px;
        line-height: 1.5;
        text-align: center;
      }

      .summary-divider {
        border: none;
        height: 1px;
        background: var(--DHABackGroundLightGray);
        margin: 30px 0;
      }

      .booking-summary {
        background: var(--DHAOffWhite);
        border-radius: 8px;
        padding: 20px;
        border: 1px solid var(--DHABackGroundLightGray);
        margin-bottom: 20px;
      }

      .booking-summary h3 {
        color: var(--DHAGreen);
        margin-bottom: 15px;
        font-size: 1.2rem;
        text-align: left;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .summary-label {
        font-size: 12px;
        color: var(--DHATextGray);
        font-weight: 500;
      }

      .summary-value {
        font-size: 14px;
        color: var(--DHAOffBlack);
        font-weight: 600;
        word-break: break-word;
      }

      .action-btn {
        border: none;
        border-radius: 6px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
      }

      .action-btn.std {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .action-btn.std:hover {
        background: var(--DHAOffBlack);
        transform: translateY(-1px);
      }

      .btn-contents {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn-icon {
        font-size: 16px;
      }

      .btn-text {
        font-size: 14px;
        font-weight: 500;
      }

      .slots-container {
        background: var(--DHAWhite);
        border-radius: 8px;
        border: 1px solid var(--DHABackGroundLightGray);
        overflow: hidden;
      }

      .slots-header {
        background: var(--DHAOffWhite);
        padding: 20px;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      .slots-header h3 {
        color: var(--DHAGreen);
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .slots-count {
        color: var(--DHATextGrayDark);
        font-size: 14px;
        font-weight: 500;
      }

      .slots-grouped {
        max-height: 400px;
        overflow-y: auto;
      }

      .day-group {
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .day-group:last-child {
        border-bottom: none;
      }

      .day-header {
        background: var(--DHAWhite);
        padding: 15px 20px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s ease;
      }

      .day-header:hover {
        background: var(--DHAOffWhite);
      }

      .day-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .day-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--DHAOffBlack);
      }

      .day-date {
        font-size: 12px;
        color: var(--DHATextGray);
      }

      .day-stats {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .expand-icon {
        font-size: 12px;
        color: var(--DHATextGray);
        transition: transform 0.2s ease;
      }

      .expand-icon.expanded {
        transform: rotate(180deg);
      }

      .day-slots {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .day-slots.expanded {
        max-height: 500px;
      }

      .slots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        padding: 20px;
        background: var(--DHAOffWhite);
      }

      .slot-card {
        background: var(--DHAWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }

      .slot-card:hover {
        border-color: var(--DHAGreen);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(1, 102, 53, 0.15);
      }

      .slot-time {
        font-size: 18px;
        font-weight: 600;
        color: var(--DHAGreen);
        margin-bottom: 5px;
      }

      .slot-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .slot-label {
        font-size: 10px;
        color: var(--DHATextGray);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .slot-time-range {
        font-size: 12px;
        color: var(--DHATextGrayDark);
        font-weight: 500;
      }

      .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: var(--DHAOffWhite);
        border-top: 1px solid var(--DHABackGroundLightGray);
      }

      .pagination-btn {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pagination-btn:hover:not(:disabled) {
        background: var(--DHAOffBlack);
        transform: translateY(-1px);
      }

      .pagination-btn:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
        transform: none;
      }

      .pagination-info {
        color: var(--DHATextGrayDark);
        font-size: 14px;
        font-weight: 500;
      }

      /* Mobile Styles */
      @media (max-width: 768px) {
        .loading-container {
          padding: 24px 0;
        }

        h3 {
          font-size: 1.3rem;
        }

        .booking-summary {
          padding: 15px;
        }

        .booking-summary h3 {
          font-size: 1.1rem;
        }

        .summary-grid {
          gap: 10px;
        }

        .action-btn {
          padding: 10px 16px;
          font-size: 13px;
        }

        .slots-header {
          padding: 15px;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .slots-header h3 {
          font-size: 1.1rem;
        }

        .day-header {
          padding: 12px 15px;
        }

        .slots-grid {
          grid-template-columns: 1fr;
          padding: 15px;
          gap: 10px;
        }

        .slot-card {
          padding: 12px;
        }

        .pagination {
          padding: 15px;
          flex-direction: column;
          gap: 10px;
        }

        .pagination-btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class AppointmentResultsComponent implements OnInit {
  @Input() searchCriteria: SlotSearchCriteria | null = null;
  @Input() stepTitles: string[] = [
    'Services',
    'Details',
    'Timeslots',
    'Confirm',
  ];
  @Output() editSearchRequested = new EventEmitter<void>();
  @Output() slotSelected = new EventEmitter<AvailableSlot>();

  availableSlots: AvailableSlot[] = [];
  isLoading = false;
  noSlotsAvailable = false;
  currentPage = 0;
  slotsPerPage = 5;
  expandedDays: Set<string> = new Set();

  constructor(private slotService: SlotService, private router: Router) {}

  ngOnInit(): void {
    if (this.searchCriteria) {
      this.searchSlots();
    }
  }

  searchSlots(): void {
    if (!this.searchCriteria) return;

    this.isLoading = true;
    this.noSlotsAvailable = false;

    // Simulate API call
    this.slotService.searchAvailableSlots(this.searchCriteria!).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.isLoading = false;
        this.noSlotsAvailable = this.availableSlots.length === 0;
      },
      error: (error) => {
        console.error('Error searching slots:', error);
        this.isLoading = false;
        this.noSlotsAvailable = true;
      },
    });
  }

  getBranchDisplayName(): string {
    if (!this.searchCriteria?.branch) return 'N/A';

    // For now, return a simple display name
    return this.searchCriteria.branch
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getDateRangeDisplay(): string {
    if (!this.searchCriteria) return 'N/A';

    const startDate = new Date(this.searchCriteria.startDate);
    const endDate = new Date(this.searchCriteria.endDate);

    const startFormatted = startDate.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const endFormatted = endDate.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return `${startFormatted} to ${endFormatted}`;
  }

  getTotalSlotsCount(): number {
    return this.availableSlots.length;
  }

  getUniqueDaysCount(): number {
    const uniqueDays = new Set(this.availableSlots.map((slot) => slot.date));
    return uniqueDays.size;
  }

  getPaginatedDayGroups(): any[] {
    const groupedSlots = this.groupSlotsByDay();
    const startIndex = this.currentPage * this.slotsPerPage;
    const endIndex = startIndex + this.slotsPerPage;
    return groupedSlots.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    const groupedSlots = this.groupSlotsByDay();
    return Math.ceil(groupedSlots.length / this.slotsPerPage);
  }

  private groupSlotsByDay(): any[] {
    const grouped = this.availableSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {} as Record<string, AvailableSlot[]>);

    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        slots: grouped[date].sort((a, b) => a.time.localeCompare(b.time)),
        isExpanded: this.expandedDays.has(date),
      }));
  }

  getFormattedDayName(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', { weekday: 'short' });
    } catch (error) {
      return 'Unknown';
    }
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Unknown';
    }
  }

  getFormattedTime(timeString: string): string {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return timeString;
    }
  }

  getTimeRange(timeString: string): string {
    try {
      const [hours, minutes] = timeString.split(':');
      const startTime = new Date();
      startTime.setHours(parseInt(hours), parseInt(minutes));

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const startFormatted = startTime.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const endFormatted = endTime.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return `${startFormatted} to ${endFormatted}`;
    } catch (error) {
      return timeString;
    }
  }

  toggleDayGroup(date: string): void {
    if (this.expandedDays.has(date)) {
      this.expandedDays.delete(date);
    } else {
      this.expandedDays.add(date);
    }
  }

  selectSlot(slot: AvailableSlot): void {
    this.slotSelected.emit(slot);
  }

  editSearch(): void {
    this.editSearchRequested.emit();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    const totalPages = this.getTotalPages();
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
    }
  }
}
