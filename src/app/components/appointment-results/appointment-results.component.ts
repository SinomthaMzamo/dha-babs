import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  branch: string;
  serviceType: string;
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
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="appointment-results-container">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="top-bar-content">
          <div class="logo-section">
            <span class="logo-icon">🏛️</span>
            <span class="logo-text">DHA Online Services</span>
          </div>
          <button (click)="goHome()" class="btn-home-top">
            🏠 Return Home
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="results-content">
        <h1>Appointment Results</h1>
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Searching for available slots...</p>
        </div>

        <!-- No Slots Available -->
        <div *ngIf="!isLoading && noSlotsAvailable" class="no-slots-container">
          <div class="no-slots-card">
            <div class="no-slots-icon">📅</div>
            <h3>No Available Slots Found</h3>
            <p>
              We couldn't find any available appointment slots for your selected
              criteria.
            </p>
            <div class="no-slots-actions">
              <button (click)="editSearch()" class="btn-primary">
                ✏️ Edit Search Criteria
              </button>
              <button (click)="goBack()" class="btn-secondary">
                ← Back to Form
              </button>
            </div>
          </div>
        </div>

        <!-- Available Slots -->
        <div
          *ngIf="!isLoading && !noSlotsAvailable && availableSlots.length > 0"
          class="slots-container-wrapper"
        >
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
              <div class="summary-item">
                <span class="summary-label">🔍 Search Date:</span>
                <span class="summary-value">{{ getSearchDateDisplay() }}</span>
              </div>
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
                *ngFor="let dayGroup of getSlotsGroupedByDay()"
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
                      <div class="slot-service">
                        {{ getServiceDisplayName(slot.serviceType) }}
                      </div>
                      <div class="slot-branch">
                        {{ getBranchDisplayName() }}
                      </div>
                    </div>
                    <div class="slot-actions">
                      <button (click)="bookSlot(slot)" class="btn-book-slot">
                        Book This Slot
                      </button>
                    </div>
                  </div>
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
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        // padding-top: 70px;
      }

      .top-bar {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
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
        font-size: 24px;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--DHAWhite);
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
        background: transparent;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAWhite);
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
        margin-bottom: 30px;
        background: var(--DHAWhite);
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAWhite);
      }

      .booking-summary h3 {
        color: var(--DHAGreen);
        margin-bottom: 20px;
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .summary-label {
        font-weight: 600;
        color: var(--DHATextGrayDark);
        font-size: 14px;
      }

      .summary-value {
        color: var(--DHAGreen);
        font-weight: 500;
        font-size: 16px;
      }

      .btn-edit-search {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-edit-search:hover {
        background: var(--DHALightOrange);
        transform: translateY(-1px);
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
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
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
      }
    `,
  ],
})
export class AppointmentResultsComponent implements OnInit {
  @Input() searchCriteria: SlotSearchCriteria | null = null;
  @Output() editSearchRequested = new EventEmitter<void>();

  availableSlots: AvailableSlot[] = [];
  isLoading = false;
  noSlotsAvailable = false;

  // Day group expansion state
  dayGroupExpansionState: Map<string, boolean> = new Map();

  // Mock data for demonstration
  private mockSlots: AvailableSlot[] = [
    {
      id: '1',
      date: '2024-12-20',
      time: '09:00',
      branch: 'ct-bellville',
      serviceType: 'smart-id',
    },
    {
      id: '2',
      date: '2024-12-20',
      time: '10:00',
      branch: 'ct-bellville',
      serviceType: 'passport',
    },
    {
      id: '3',
      date: '2024-12-20',
      time: '11:00',
      branch: 'ct-bellville',
      serviceType: 'smart-id',
    },
    {
      id: '4',
      date: '2024-12-21',
      time: '08:00',
      branch: 'ct-bellville',
      serviceType: 'id-book',
    },
    {
      id: '5',
      date: '2024-12-21',
      time: '09:30',
      branch: 'ct-bellville',
      serviceType: 'passport',
    },
    {
      id: '6',
      date: '2024-12-21',
      time: '13:00',
      branch: 'ct-bellville',
      serviceType: 'smart-id',
    },
    {
      id: '7',
      date: '2024-12-23',
      time: '10:00',
      branch: 'ct-bellville',
      serviceType: 'birth-cert',
    },
    {
      id: '8',
      date: '2024-12-23',
      time: '14:00',
      branch: 'ct-bellville',
      serviceType: 'marriage-cert',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Simulate loading and then show results
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.availableSlots = this.mockSlots;
      this.noSlotsAvailable = this.availableSlots.length === 0;
    }, 2000);
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
        // Check if we have stored expansion state, default to true if not
        const isExpanded = this.dayGroupExpansionState.has(slot.date)
          ? this.dayGroupExpansionState.get(slot.date)!
          : true;

        grouped.set(slot.date, {
          date: slot.date,
          slots: [],
          isExpanded: isExpanded,
        });
      }
      grouped.get(slot.date).slots.push(slot);
    });

    // Sort by date and convert to array
    return Array.from(grouped.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  toggleDayGroup(date: string): void {
    const currentState = this.dayGroupExpansionState.get(date) ?? true;
    this.dayGroupExpansionState.set(date, !currentState);

    // Trigger change detection by updating the availableSlots array reference
    this.availableSlots = [...this.availableSlots];
  }

  getServiceDisplayName(serviceType: string): string {
    const serviceNames: { [key: string]: string } = {
      'smart-id': 'Smart ID Card',
      passport: 'Passport',
      'id-book': 'ID Book',
      'birth-cert': 'Birth Certificate',
      'marriage-cert': 'Marriage Certificate',
      'death-cert': 'Death Certificate',
      citizenship: 'Citizenship',
      visa: 'Visa Services',
    };

    return serviceNames[serviceType] || serviceType;
  }

  shouldShowReturnToMenu(): boolean {
    return sessionStorage.getItem('returnToMenu') === 'true';
  }

  editSearch() {
    this.editSearchRequested.emit();
  }

  bookSlot(slot: AvailableSlot) {
    // Simulate booking process
    alert(
      `Slot booked successfully! Your appointment is scheduled for ${slot.date} at ${slot.time}`
    );
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
