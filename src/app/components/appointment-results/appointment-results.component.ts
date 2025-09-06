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
      <!-- Top Bar -->
      <!-- <div class="top-bar">
        <div class="top-bar-content">
          <div class="logo-section">
            <button type="button" (click)="goHome()" class="btn-home-top">
              ← Return Home
            </button>
          </div>
          <img src="/Logo_DHA_wecare.png" alt="DHA Logo" class="logo-icon" />
        </div>
      </div> -->

      <!-- Main Content -->
      <div class="results-content">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Searching for available slots...</p>
        </div>

        <!-- No Slots Available -->
        <div *ngIf="!isLoading && noSlotsAvailable" class="no-slots-container">
          <div class="no-slots-card">
            <app-progress-indicator
              [currentStep]="2"
              [steps]="stepTitles"
            ></app-progress-indicator>
            <!-- <div class="no-slots-icon">📅</div> -->
            <h3>No Available Slots Found</h3>
            <p>
              We couldn't find any available appointment slots for your selected
              criteria.
            </p>
            <!-- Booking Summary - Always Visible -->
            <div class="booking-summary">
              <h3>📋 Booking Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">📍 Branch:</span>
                  <span class="summary-value">{{
                    getBranchDisplayName()
                  }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">📅 Date Range:</span>
                  <span class="summary-value">{{ getDateRangeDisplay() }}</span>
                </div>
                <!-- <div class="summary-item">
                  <span class="summary-label">🔍 Search Date:</span>
                  <span class="summary-value">{{
                    getSearchDateDisplay()
                  }}</span>
                </div> -->
              </div>
              <button (click)="editSearch()" class="btn-edit-search">
                ✏️ Edit Search Criteria
              </button>
            </div>
          </div>
        </div>

        <!-- Available Slots -->
        <div
          *ngIf="!isLoading && !noSlotsAvailable && availableSlots.length > 0"
          class="slots-container-wrapper"
        >
          <app-progress-indicator
            [currentStep]="2"
            [steps]="stepTitles"
          ></app-progress-indicator>
          <!-- Booking Summary - Always Visible -->
          <div class="booking-summary">
            <h3>📋 Booking Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">📍 Branch:</span>
                <span class="summary-value">{{ getBranchDisplayName() }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">📅 Date Range:</span>
                <span class="summary-value">{{ getDateRangeDisplay() }}</span>
              </div>
              <!-- <div class="summary-item">
                <span class="summary-label">🔍 Search Date:</span>
                <span class="summary-value">{{ getSearchDateDisplay() }}</span>
              </div> -->
            </div>
            <button (click)="editSearch()" class="btn-edit-search">
              ✏️ Edit Search Criteria
            </button>
          </div>

          <!-- Available Slots - Grouped by Day -->
          <div class="slots-container">
            <div class="slots-header">
              <h3>📅 Available Appointment Slots</h3>
              <div class="slots-header-right">
                <div class="slots-count">
                  {{ getTotalSlotsCount() }} slots found across
                  {{ getUniqueDaysCount() }} days
                </div>
                <button
                  *ngIf="shouldShowReturnToMenu()"
                  (click)="returnToMenu()"
                  class="btn-return-menu"
                >
                  ← Return to Menu
                </button>
              </div>
            </div>

            <div class="slots-grouped">
              <div
                *ngFor="let dayGroup of getPaginatedDayGroups()"
                class="day-group"
              >
                <div class="day-header" (click)="toggleDayGroup(dayGroup.date)">
                  <div class="day-info">
                    <span class="day-date">{{
                      dayGroup.date | date : 'EEEE, MMMM d, y'
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

                <div class="day-slots" [class.expanded]="dayGroup.isExpanded">
                  <div *ngFor="let slot of dayGroup.slots" class="slot-item">
                    <div class="slot-info">
                      <div class="slot-time">{{ slot.time }}</div>
                      <div class="slot-branch">
                        {{ getBranchDisplayName() }}
                      </div>
                    </div>
                    <div class="slot-actions">
                      <button (click)="bookSlot(slot)" class="btn-book-slot">
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
                📅 See {{ getRemainingDaysCount() }} more day{{
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
                📅 Show Less ({{ daysPerPage }} days)
              </button>
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
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        // padding-top: 70px;
      }

      .top-bar {
        background: whitesmoke;
        color: var(--DHATextGrayDark);
        padding: 15px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
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
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-home-top:hover {
        background: var(--DHALightOrange);
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

      /* No Slots Available */
      .no-slots-container {
        display: flex;
        justify-content: center;
        padding: 40px 20px;
      }

      .no-slots-card {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAOrange);
        max-width: 500px;
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
        max-width: 600px;
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
      }

      /* Available Slots */
      .slots-container {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

        // border: 2px solid var(--DHAWhite);
      }

      /* Booking Summary */
      .booking-summary {
        margin-bottom: 20px;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #f8f9fa 100%
        );
        border-radius: 12px;
        padding: 18px;
        border: 1px solid var(--DHABackGroundLightGray);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        position: relative;
        overflow: hidden;
      }

      // .booking-summary::before {
      //   content: '';
      //   position: absolute;
      //   top: 0;
      //   left: 0;
      //   right: 0;
      //   height: 3px;
      //   background: linear-gradient(
      //     90deg,
      //     var(--DHAGreen) 0%,
      //     var(--DHAOrange) 100%
      //   );
      // }

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
        color: var(--DHATextGrayDark);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
      }

      .summary-value {
        color: var(--DHAGreen);
        font-weight: 600;
        font-size: 14px;
        line-height: 1.3;
        word-break: break-word;
      }

      .btn-edit-search {
        background: linear-gradient(
          135deg,
          var(--DHAOrange) 0%,
          var(--DHALightOrange) 100%
        );
        color: var(--DHAWhite);
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(243, 128, 31, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.3px;
        align-self: flex-start;
      }

      .btn-edit-search:hover {
        background: linear-gradient(
          135deg,
          var(--DHALightOrange) 0%,
          var(--DHAOrange) 100%
        );
        transform: translateY(-1px);
        box-shadow: 0 3px 12px rgba(243, 128, 31, 0.4);
      }

      .btn-edit-search:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px rgba(243, 128, 31, 0.3);
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
        padding: 15px 30px;
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
        padding: 15px 30px;
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
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
      }

      .slots-header h3 {
        color: var(--DHAGreen);
        margin: 0;
        font-size: 1.4rem;
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
        padding-top: 1rem;
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
        border: 2px solid var(--DividerGray);
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
        padding: 15px 20px;
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
        padding: 15px 20px;
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
      }

      .slot-time {
        font-size: 18px;
        font-weight: 700;
        color: var(--DHAGreen);
        margin-bottom: 5px;
      }

      .slot-service {
        color: var(--DHATextGrayDark);
        font-size: 14px;
        margin-bottom: 5px;
      }

      .slot-branch {
        color: var(--DHAOrange);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .slot-actions {
        display: flex;
        align-items: center;
      }

      .btn-book-slot {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        padding: 12px 20px;
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
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover {
        background: var(--DHAMaroon);
        transform: translateY(-1px);
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
          padding: 20px 15px;
        }

        .slots-container {
          padding: 20px 15px;
        }

        .slots-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .slots-header-right {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
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
          height: 32px
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
