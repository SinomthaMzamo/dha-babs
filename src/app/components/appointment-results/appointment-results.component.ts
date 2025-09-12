import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';
import { SlotService } from '../../services/slot.service';

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  branch: string;
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
  imports: [CommonModule, ReactiveFormsModule, ProgressIndicatorComponent],
  template: `
    <div class="appointment-results-container">
      <!-- Main Content -->
      <div class="results-content">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Searching for available slots...</p>
        </div>

        <!-- No Slots Available -->
        <div *ngIf="!isLoading && noSlotsAvailable" class="no-slots-container">
          <div class="content-wrapper">
            <app-progress-indicator
              [currentStep]="2"
              [steps]="stepTitles"
            ></app-progress-indicator>
            <div class="no-slots-card">
              <!-- <div class="no-slots-icon">📅</div> -->
              <h3>No Available Slots Found</h3>
              <p>
                We couldn't find any available appointment slots for your
                selected criteria. <br />
                <br />Try editing your search or try again later.
              </p>
              <!-- Booking Summary - Always Visible -->
              <div class="booking-summary">
                <h3>Booking Summary</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">📍 Branch:</span>
                    <span class="summary-value">{{
                      getBranchDisplayName()
                    }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">📅 Date Range:</span>
                    <span class="summary-value">{{
                      getDateRangeDisplay()
                    }}</span>
                  </div>
                  <!-- <div class="summary-item">
                    <span class="summary-label">🔍 Search Date:</span>
                    <span class="summary-value">{{
                      getSearchDateDisplay()
                    }}</span>
                  </div> -->
                </div>
                <button
                  type="button"
                  (click)="editSearch()"
                  class="action-btn std"
                  title="Add an accompanying applicant to this booking"
                >
                  <div class="btn-contents">
                    <span class="btn-icon"></span>
                    <span class="btn-text">Edit Search Criteria</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Slots -->
        <div
          *ngIf="!isLoading && !noSlotsAvailable && availableSlots.length > 0"
        >
          <div class="content-wrapper">
            <app-progress-indicator
              [currentStep]="2"
              [steps]="stepTitles"
            ></app-progress-indicator>
            <div class="no-slots-card no-outline">
              <!-- Booking Summary - Always Visible -->
              <div class="booking-summary">
                <h3>Booking Summary</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">📍 Branch:</span>
                    <span class="summary-value">{{
                      getBranchDisplayName()
                    }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">📅 Date Range:</span>
                    <span class="summary-value">{{
                      getDateRangeDisplay()
                    }}</span>
                  </div>
                  <!-- <div class="summary-item">
                  <span class="summary-label">🔍 Search Date:</span>
                  <span class="summary-value">{{ getSearchDateDisplay() }}</span>
                </div> -->
                </div>
                <button
                  type="button"
                  (click)="editSearch()"
                  class="action-btn std"
                  title="Add an accompanying applicant to this booking"
                >
                  <div class="btn-contents">
                    <span class="btn-text">Edit Search Criteria</span>
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
                    <!-- <button
                      *ngIf="shouldShowReturnToMenu()"
                      (click)="returnToMenu()"
                      class="btn-return-menu"
                    >
                      ← Return to Menu
                    </button> -->
                  </div>
                </div>

                <div class="slots-grouped">
                  <div
                    *ngFor="let dayGroup of getPaginatedDayGroups()"
                    class="day-group"
                  >
                    <div
                      class="day-header"
                      (click)="toggleDayGroup(dayGroup.date)"
                    >
                      <div class="day-info">
                        <span class="day-date">{{
                          dayGroup.date | date : 'EEEE MMM d y'
                        }}</span>
                        <span class="day-slots-count"
                          >{{ dayGroup.slots.length }} slot{{
                            dayGroup.slots.length !== 1 ? 's' : ''
                          }}</span
                        >
                      </div>
                      <div class="day-toggle">
                        <span class="toggle-icon">{{
                          dayGroup.isExpanded ? '▼' : '▶'
                        }}</span>
                      </div>
                    </div>

                    <div
                      class="day-slots"
                      [class.expanded]="dayGroup.isExpanded"
                    >
                      <div
                        *ngFor="let slot of dayGroup.slots"
                        class="slot-item"
                      >
                        <div class="slot-info">
                          <div class="slot-time">
                            {{ formatTimeRange(slot.time) }}
                          </div>
                        </div>
                        <div class="slot-actions">
                          <button
                            (click)="bookSlot(slot)"
                            class="btn-book-slot"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pagination Controls -->
                <div class="pagination-controls">
                  <!-- Load More Button -->
                  <button
                    *ngIf="hasMoreDays"
                    (click)="loadMoreDays()"
                    class="btn-load-more"
                  >
                    See {{ getRemainingDaysCount() }} more day{{
                      getRemainingDaysCount() !== 1 ? 's' : ''
                    }}
                    with available slots
                  </button>

                  <!-- Show Less Button -->
                  <button
                    *ngIf="currentPage > 1"
                    (click)="showLessDays()"
                    class="btn-show-less"
                  >
                    Show Less ({{ daysPerPage }} days)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        --DHAErrorColor: #f57c00;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
      }

      .appointment-results-container {
        display: flex;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
      }

      .top-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: whitesmoke;
        border-bottom: 2px solid var(--DHAGreen);
        z-index: 1000;
        display: flex;
        align-items: center;
        padding: 0 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .top-bar-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-icon {
        height: 60px;
        width: auto;
        object-fit: contain;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--DHATextGrayDark);
      }

      .btn-home-top {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-home-top:hover {
        background: var(--DHAOrange);
        transform: translateY(-1px);
      }

      .results-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      /* Loading State */
      .loading-container {
        text-align: center;
        padding: 60px 20px;
      }

      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid var(--DHABackGroundLightGray);
        border-top: 4px solid var(--DHAGreen);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .no-slots-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 70px);
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding: 20px;
      }

      .no-slots-card {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAOrange);
        max-width: var(--form-width);
        height: var(--mobile-form-height);
        overflow-y: auto;
        width: 100%; /* fill the wrapper */
        box-sizing: border-box;
      }

      .no-slots-card.no-outline {
        border-color: var(--DHAWhite);
        text-align: unset;
      }

      .no-slots-icon {
        font-size: 4rem;
        margin-bottom: 20px;
      }

      .no-slots-card h3 {
        color: var(--DHAOrange);
        margin-bottom: 15px;
        font-size: 1.5rem;
      }

      .no-slots-card p {
        color: var(--DHATextGrayDark);
        margin-bottom: 30px;
        line-height: 1.5;
      }

      .no-slots-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .slots-container-wrapper {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAWhite);
        max-width: var(--form-width);
        height: var(--mobile-form-height);
        overflow-y: auto;
        width: 100%; /* fill the wrapper */
        box-sizing: border-box;
      }

      .content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--step-form-gap);
        width: 100%;
        max-width: var(--form-width);
        box-sizing: border-box;
      }

      /* Available Slots */
      .slots-container {
        border-radius: 16px;
        padding: 30px 0;
      }

      .summary-divider {
        margin-top: 20px;
        margin-bottom: 0;
        height: 1px;
        border: none; /* nuke all borders */
        border-top: 1px solid gainsboro; /* only top border */
      }

      /* Booking Summary */
      .booking-summary {
        border-radius: 12px;
        padding-bottom: 1px;
        position: relative;
        overflow: hidden;
      }

      .booking-summary h3 {
        color: var(--DHAGreen);
        margin-bottom: 15px;
        margin-top: 0;
        font-size: 18px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin-bottom: 15px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px;
        background: var(--DHAWhite);
        border-radius: 8px;
        border: 1px solid var(--DHABackGroundLightGray);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        transition: all 0.3s ease;
      }

      .summary-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-color: var(--DHAGreen);
      }

      .summary-label {
        font-weight: 600;
        color: var(--DHATextGray);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
      }

      .summary-value {
        color: var(--DHATextGrayDark);
        font-weight: 600;
        font-size: 14px;
        line-height: 1.3;
        word-break: break-word;
      }

      .btn-contents {
        display: flex;
        gap: 4px;
      }

      .action-btn {
        background: none;
        color: var(--DHAOrange);
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-underline-offset: 2px;
        display: block;
        margin: 0 auto;
      }

      .action-btn:hover {
        color: var(--DHALightOrange);
        background: rgba(243, 128, 31, 0.1);
      }

      .btn-icon {
        font-size: 14px;
      }

      .btn-text {
        font-size: 12px;
        font-weight: 500;
        text-decoration: underline;
      }

      /* Pagination Controls */
      .pagination-controls {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 2px solid var(--DHABackGroundLightGray);
        flex-wrap: wrap;
      }

      .btn-load-more {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        border-radius: 12px;
        padding: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(243, 128, 31, 0.2);
      }

      .btn-load-more:hover {
        background: var(--DHALightOrange);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(243, 128, 31, 0.3);
      }

      .btn-load-more:active {
        transform: translateY(0);
      }

      .btn-show-less {
        background: var(--DHATextGray);
        color: var(--DHAWhite);
        border: none;
        border-radius: 12px;
        padding: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(90, 90, 90, 0.2);
      }

      .btn-show-less:hover {
        background: var(--DHATextGrayDark);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(90, 90, 90, 0.3);
      }

      .btn-show-less:active {
        transform: translateY(0);
      }

      .slots-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        flex-wrap: wrap;
        gap: 15px;
      }

      .slots-header h3 {
        color: var(--DHAGreen);
        margin: 0;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .slots-header-right {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        width: 100%;
      }

      .slots-count {
        color: var(--DHATextGray);
        font-size: 14px;
        font-weight: 500;
      }

      .btn-return-menu {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .btn-return-menu:hover {
        background: var(--DHALightOrange);
        transform: translateY(-1px);
      }

      .slots-grouped {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .day-group {
        border: 1px solid var(--DividerGray);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .day-group:hover {
        border-color: var(--DHAGreen);
        box-shadow: 0 4px 12px rgba(1, 102, 53, 0.1);
      }

      .day-header {
        background: var(--DHABackGroundLightGray);
        padding: 10px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.3s ease;
      }

      .day-header:hover {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .day-header:hover .day-date,
      .day-header:hover .day-slots-count {
        color: var(--DHAWhite);
      }

      .day-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .day-date {
        font-weight: 600;
        color: var(--DHATextGrayDark);
        font-size: 16px;
        transition: color 0.3s ease;
      }

      .day-slots-count {
        color: var(--DHATextGray);
        font-size: 14px;
        font-weight: 500;
        transition: color 0.3s ease;
      }

      .day-toggle {
        color: var(--DHAGreen);
        font-size: 18px;
        font-weight: bold;
        transition: color 0.3s ease;
      }

      .day-header:hover .day-toggle {
        color: var(--DHAWhite);
      }

      .day-slots {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .day-slots.expanded {
        max-height: 1000px;
      }

      .slot-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: var(--DHAWhite);
        border-bottom: 1px solid var(--DividerGray);
        transition: all 0.3s ease;
      }

      .slot-item:last-child {
        border-bottom: none;
      }

      .slot-item:hover {
        background: var(--DHAOffWhite);
        border-left: 4px solid var(--DHAOrange);
        padding-left: 16px;
      }

      .slot-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .slot-time {
        font-size: 16px;
        font-weight: 600;
        color: var(--DHAGreen);
        background: rgba(1, 102, 53, 0.1);
        padding: 8px 12px;
        border-radius: 6px;
        display: inline-block;
        width: 116px;
      }

      .slot-service {
        color: var(--DHATextGrayDark);
        font-size: 14px;
        margin-bottom: 5px;
      }

      .slot-branch {
        color: var(--DHAOrange);
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: rgba(255, 140, 0, 0.1);
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
        width: fit-content;
      }

      .slot-actions {
        display: flex;
        align-items: center;
      }

      .btn-book-slot {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .btn-book-slot:hover {
        background: var(--DHALightOrange);
        transform: translateY(-2px);
      }

      /* Buttons */
      .btn-primary,
      .btn-secondary {
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 150px;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--DHAWhite);
        transform: translateY(-2px);
        color: var(--DHAGreen);
        border: 1px solid var(--DHAGreen);
      }

      .btn-primary:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
      }

      .btn-secondary {
        background: var(--DHATextGray);
        color: var(--DHAWhite);
      }

      .btn-secondary:hover {
        background: var(--DHATextGrayDark);
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .results-content {
          padding: 0;
        }

        .no-slots-container {
          padding: 24px 2px;
          flex-direction: column;
        }

        .content-wrapper {
          padding: 0 8px;
        }

        .no-slots-card {
          padding: 25px 20px;
          min-width: unset;
          height: var(--mobile-form-height);
          overflow-y: auto;
          width: 100%;
        }

        .slots-container-wrapper {
          padding: 25px 20px;
          height: var(--mobile-form-height);
          overflow-y: auto;
          width: 100%;
        }

        .slots-container {
          padding: 14px 0;
        }

        .slots-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .slots-header-right {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .no-slots-actions {
          flex-direction: column;
          align-items: center;
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
          max-width: 200px;
        }
        .logo-icon {
          height: 32px;
        }

        .btn-home-top {
          padding: 4px 10px;
          font-size: 12px;
        }
      }
    `,
  ],
})
export class AppointmentResultsComponent implements OnInit {
  @Input() searchCriteria: SlotSearchCriteria | null = null;
  @Output() editSearchRequested = new EventEmitter<void>();
  @Output() slotSelected = new EventEmitter<AvailableSlot>();

  availableSlots: AvailableSlot[] = [];
  isLoading = false;
  noSlotsAvailable = false;

  // Day group expansion state
  dayGroupExpansionState: Map<string, boolean> = new Map();

  // Pagination state
  daysPerPage = 5;
  currentPage = 1;
  totalDays = 0;
  hasMoreDays = false;

  @Input() stepTitles: string[] = [];

  constructor(private router: Router, private slotService: SlotService) {}

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    // Load slots from the slot service
    if (this.searchCriteria) {
      this.isLoading = true;
      this.slotService.searchAvailableSlots(this.searchCriteria).subscribe({
        next: (slots) => {
          this.isLoading = false;
          this.availableSlots = slots;
          this.noSlotsAvailable = this.availableSlots.length === 0;

          // Scroll to top again when results are displayed
          window.scrollTo(0, 0);
        },
        error: (error) => {
          this.isLoading = false;
          this.noSlotsAvailable = true;
          console.error('Error loading slots:', error);
        },
      });
    } else {
      this.noSlotsAvailable = true;
    }
  }

  getBranchDisplayName(): string {
    if (!this.searchCriteria?.branch) return 'Not selected';

    // This would normally come from the search criteria
    return 'Bellville, Cape Town, Western Cape';
  }

  getDateRangeDisplay(): string {
    if (!this.searchCriteria?.startDate || !this.searchCriteria?.endDate)
      return 'Not selected';

    const start = new Date(this.searchCriteria.startDate);
    const end = new Date(this.searchCriteria.endDate);

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  getSearchDateDisplay(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getTotalSlotsCount(): number {
    return this.availableSlots.length;
  }

  getUniqueDaysCount(): number {
    const uniqueDays = new Set(this.availableSlots.map((slot) => slot.date));
    return uniqueDays.size;
  }

  getSlotsGroupedByDay(): any[] {
    const grouped = new Map<string, any>();

    this.availableSlots.forEach((slot) => {
      if (!grouped.has(slot.date)) {
        grouped.set(slot.date, {
          date: slot.date,
          slots: [],
        });
      }
      grouped.get(slot.date).slots.push(slot);
    });

    // Sort by date and convert to array
    const sortedGroups = Array.from(grouped.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Set expansion state: first group expanded, others collapsed by default
    return sortedGroups.map((group, index) => {
      const isExpanded = this.dayGroupExpansionState.has(group.date)
        ? this.dayGroupExpansionState.get(group.date)!
        : index === 0; // Only first group expanded by default

      return {
        ...group,
        isExpanded: isExpanded,
      };
    });
  }

  getPaginatedDayGroups(): any[] {
    const allDayGroups = this.getSlotsGroupedByDay();
    this.totalDays = allDayGroups.length;
    this.hasMoreDays = this.currentPage * this.daysPerPage < this.totalDays;

    const startIndex = 0;
    const endIndex = this.currentPage * this.daysPerPage;

    return allDayGroups.slice(startIndex, endIndex);
  }

  loadMoreDays(): void {
    this.currentPage++;
  }

  showLessDays(): void {
    this.currentPage = 1;
  }

  getRemainingDaysCount(): number {
    const remaining = this.totalDays - this.currentPage * this.daysPerPage;
    return Math.max(0, remaining);
  }

  toggleDayGroup(date: string): void {
    // Get the current state, defaulting to collapsed (false) for new groups
    const currentState = this.dayGroupExpansionState.get(date) ?? false;
    this.dayGroupExpansionState.set(date, !currentState);

    // Trigger change detection by updating the availableSlots array reference
    this.availableSlots = [...this.availableSlots];
  }

  shouldShowReturnToMenu(): boolean {
    return sessionStorage.getItem('returnToMenu') === 'true';
  }

  editSearch() {
    this.editSearchRequested.emit();
  }

  bookSlot(slot: AvailableSlot) {
    this.slotSelected.emit(slot);
  }

  formatTimeRange(time: string): string {
    // Convert time string (e.g., "13:00") to time range (e.g., "from 13:00 to 14:00")
    if (!time) return '';

    // Parse the time
    const [hours, minutes] = time.split(':').map(Number);

    // Create start time
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    // Calculate end time (add 1 hour)
    const endHours = (hours + 1) % 24;
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    return `${startTime} to ${endTime}`;
  }

  returnToMenu() {
    this.router.navigate(['/menu']);
  }

  goBack() {
    this.editSearchRequested.emit();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
