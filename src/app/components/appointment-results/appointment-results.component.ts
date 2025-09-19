import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
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

interface City {
  id: string;
  name: string;
  provinceId: string;
}

interface Branch {
  id: string;
  name: string;
  cityId: string;
}

interface SlotSearchCriteria {
  branch: string;
  startDate: string;
  endDate: string;
  services: string[];
}

interface AlternativeSuggestion {
  branchId: string;
  branchName: string;
  cityName: string;
  provinceName: string;
  distance: 'same-city' | 'same-province' | 'neighboring-province';
  availableSlots: number;
  nextAvailableDate?: string;
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
        <br />Try a different branch, edit your search or try again later.
      </p>

      <hr class="summary-divider" />
      <!-- Alternative Suggestions -->
      <div
        *ngIf="alternativeSuggestions.length > 0"
        class="alternative-suggestions"
      >
        <h4>📍 Alternative Locations Available</h4>
        <p class="suggestions-intro">
          We found available slots at these nearby branches:
        </p>

        <div class="suggestions-list">
          <div
            *ngFor="let suggestion of alternativeSuggestions; let i = index"
            class="suggestion-card"
            [class.same-city]="suggestion.distance === 'same-city'"
            [class.same-province]="suggestion.distance === 'same-province'"
            [class.neighboring-province]="
              suggestion.distance === 'neighboring-province'
            "
          >
            <div class="suggestion-header">
              <div class="suggestion-location">
                <h5>{{ suggestion.branchName }}</h5>
                <p class="location-details">
                  {{ suggestion.cityName }}, {{ suggestion.provinceName }}
                </p>
              </div>
              <div class="suggestion-badge">
                <span
                  *ngIf="suggestion.distance === 'same-city'"
                  class="badge same-city-badge"
                >
                  Same City
                </span>
                <span
                  *ngIf="suggestion.distance === 'same-province'"
                  class="badge same-province-badge"
                >
                  Same Province
                </span>
                <span
                  *ngIf="suggestion.distance === 'neighboring-province'"
                  class="badge neighboring-badge"
                >
                  Nearby Province
                </span>
              </div>
            </div>

            <div class="suggestion-details">
              <div class="availability-info">
                <span class="slots-count"
                  >{{ suggestion.availableSlots }} slots available</span
                >
                <span *ngIf="suggestion.nextAvailableDate" class="next-date">
                  Next: {{ getFormattedDate(suggestion.nextAvailableDate) }}
                </span>
              </div>
            </div>

            <button
              type="button"
              (click)="selectAlternativeSuggestion(suggestion)"
              class="btn-select-alternative"
            >
              Select This Branch
            </button>
          </div>
        </div>
      </div>

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
        margin-top: 0;
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

      /* Alternative Suggestions Styles */
      .alternative-suggestions {
        margin: 20px 0;
        border-radius: 12px;
      }

      .alternative-suggestions h4 {
        color: var(--DHAGreen);
        margin: 0 0 10px 0;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .suggestions-intro {
        color: var(--DHATextGrayDark);
        margin: 0 0 20px 0;
        font-size: 0.95rem;
      }

      .suggestions-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .suggestion-card {
        background: white;
        border: 2px solid var(--DHABackGroundLightGray);
        border-radius: 10px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .suggestion-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .suggestion-card.same-city {
        border-color: var(--DHAGreen);
        background: linear-gradient(
          135deg,
          #f8f9fa 0%,
          rgba(1, 102, 53, 0.05) 100%
        );
      }

      .suggestion-card.same-province {
        border-color: var(--DHAOrange);
        background: linear-gradient(
          135deg,
          #f8f9fa 0%,
          rgba(243, 128, 31, 0.05) 100%
        );
      }

      .suggestion-card.neighboring-province {
        border-color: var(--DHATextGray);
        background: linear-gradient(
          135deg,
          #f8f9fa 0%,
          rgba(148, 148, 148, 0.05) 100%
        );
      }

      .suggestion-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
      }

      .suggestion-location h5 {
        color: var(--DHAGreen);
        margin: 0 0 5px 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .location-details {
        color: var(--DHATextGrayDark);
        margin: 0;
        font-size: 0.9rem;
      }

      .suggestion-badge {
        flex-shrink: 0;
      }

      .badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .same-city-badge {
        background: var(--DHAGreen);
        color: white;
      }

      .same-province-badge {
        background: var(--DHAOrange);
        color: white;
      }

      .neighboring-badge {
        background: var(--DHATextGray);
        color: white;
      }

      .suggestion-details {
        margin-bottom: 15px;
      }

      .availability-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .slots-count {
        color: var(--DHAGreen);
        font-weight: 600;
        font-size: 0.95rem;
      }

      .next-date {
        color: var(--DHATextGray);
        font-size: 0.85rem;
      }

      .btn-select-alternative {
        background: var(--DHAGreen);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
      }

      .btn-select-alternative:hover {
        background: var(--DHALightGreen);
        color: var(--DHAGreen);
        text-decoration: underline;
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .alternative-suggestions {
          margin: 15px 0;
        }

        .suggestion-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .suggestion-badge {
          align-self: flex-start;
        }

        .availability-info {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }
    `,
  ],
})
export class AppointmentResultsComponent implements OnInit, OnChanges {
  @Input() searchCriteria: SlotSearchCriteria | null = null;
  @Input() stepTitles: string[] = [
    'Services',
    'Details',
    'Timeslots',
    'Confirm',
  ];
  @Output() editSearchRequested = new EventEmitter<void>();
  @Output() slotSelected = new EventEmitter<AvailableSlot>();
  @Output() alternativeBranchSelected = new EventEmitter<string>();

  availableSlots: AvailableSlot[] = [];
  alternativeSuggestions: AlternativeSuggestion[] = [];
  isLoading = false;
  noSlotsAvailable = false;
  currentPage = 0;
  slotsPerPage = 5;
  expandedDays: Set<string> = new Set();

  // Branch data structures (same as appointment form)
  provinces: Province[] = [
    { id: 'gauteng', name: 'Gauteng' },
    { id: 'western-cape', name: 'Western Cape' },
    { id: 'kwazulu-natal', name: 'KwaZulu-Natal' },
    { id: 'eastern-cape', name: 'Eastern Cape' },
    { id: 'free-state', name: 'Free State' },
    { id: 'mpumalanga', name: 'Mpumalanga' },
    { id: 'limpopo', name: 'Limpopo' },
    { id: 'north-west', name: 'North West' },
    { id: 'northern-cape', name: 'Northern Cape' },
  ];

  cities: City[] = [
    // Gauteng
    { id: 'johannesburg', name: 'Johannesburg', provinceId: 'gauteng' },
    { id: 'pretoria-menlyn', name: 'Pretoria Menlyn', provinceId: 'gauteng' },
    { id: 'pretoria', name: 'Pretoria', provinceId: 'gauteng' },
    { id: 'soweto', name: 'Soweto', provinceId: 'gauteng' },
    { id: 'springs', name: 'Springs', provinceId: 'gauteng' },
    { id: 'vereeniging', name: 'Vereeniging', provinceId: 'gauteng' },
    { id: 'alberton', name: 'Alberton', provinceId: 'gauteng' },
    { id: 'benoni', name: 'Benoni', provinceId: 'gauteng' },
    { id: 'brakpan', name: 'Brakpan', provinceId: 'gauteng' },
    { id: 'boksburg', name: 'Boksburg', provinceId: 'gauteng' },
    { id: 'carletonville', name: 'Carletonville', provinceId: 'gauteng' },
    { id: 'edenvale', name: 'Edenvale', provinceId: 'gauteng' },
    { id: 'ga-rankawa', name: 'Ga-Rankuwa', provinceId: 'gauteng' },
    { id: 'heidelberg', name: 'Heidelberg', provinceId: 'gauteng' },
    { id: 'kempton-park', name: 'Kempton Park', provinceId: 'gauteng' },
    { id: 'mogale-city', name: 'Mogale City', provinceId: 'gauteng' },
    {
      id: 'hammanskraal-temba',
      name: 'Hammanskraal Temba',
      provinceId: 'gauteng',
    },
    { id: 'nigel', name: 'Nigel', provinceId: 'gauteng' },
    {
      id: 'medium-office-randburg',
      name: 'Medium Office Randburg',
      provinceId: 'gauteng',
    },
    { id: 'pretoria-north', name: 'Pretoria North', provinceId: 'gauteng' },
    {
      id: 'johannesburg-metro-municipality',
      name: 'Johannesburg Metro Municipality',
      provinceId: 'gauteng',
    },
    { id: 'vanderbijlpark', name: 'Vanderbijlpark', provinceId: 'gauteng' },
    { id: 'tshwane', name: 'Tshwane', provinceId: 'gauteng' },
    { id: 'randfontein', name: 'Randfontein', provinceId: 'gauteng' },
    { id: 'centurion', name: 'Centurion', provinceId: 'gauteng' },
    { id: 'mamelodi-east', name: 'Mamelodi East', provinceId: 'gauteng' },
    { id: 'evaton', name: 'Evaton', provinceId: 'gauteng' },
    { id: 'bronkhorstspruit', name: 'Bronkhorstspruit', provinceId: 'gauteng' },

    // Western Cape
    {
      id: 'epping-goodwood',
      name: 'Epping Goodwood',
      provinceId: 'western-cape',
    },
    { id: 'bellville', name: 'Bellville', provinceId: 'western-cape' },
    { id: 'vredendal', name: 'Vredendal', provinceId: 'western-cape' },
    { id: 'grabouw', name: 'Grabouw', provinceId: 'western-cape' },
    { id: 'george', name: 'George', provinceId: 'western-cape' },
    { id: 'cape-town', name: 'Cape Town', provinceId: 'western-cape' },
    { id: 'paarl', name: 'Paarl', provinceId: 'western-cape' },
    { id: 'beaufort-west', name: 'Beaufort West', provinceId: 'western-cape' },
    { id: 'caledon', name: 'Caledon', provinceId: 'western-cape' },
    {
      id: 'mitchells-plain',
      name: 'Mitchells Plain',
      provinceId: 'western-cape',
    },
    { id: 'malmesbury', name: 'Malmesbury', provinceId: 'western-cape' },
    { id: 'oudtshoorn', name: 'Oudtshoorn', provinceId: 'western-cape' },
    { id: 'worcester', name: 'Worcester', provinceId: 'western-cape' },
    { id: 'stellenbosch', name: 'Stellenbosch', provinceId: 'western-cape' },
    { id: 'kwanonqaba', name: 'Kwanonqaba', provinceId: 'western-cape' },
    { id: 'prince-albert', name: 'Prince Albert', provinceId: 'western-cape' },
    { id: 'bredasdorp', name: 'Bredasdorp', provinceId: 'western-cape' },
    { id: 'robertson', name: 'Robertson', provinceId: 'western-cape' },
    { id: 'ceres', name: 'Ceres', provinceId: 'western-cape' },
    {
      id: 'plettenburg-bay',
      name: 'Plettenburg Bay',
      provinceId: 'western-cape',
    },

    // KwaZulu-Natal
    { id: 'durban', name: 'Durban', provinceId: 'kwazulu-natal' },
    { id: 'umhlanga', name: 'Umhlanga', provinceId: 'kwazulu-natal' },

    // Eastern Cape
    {
      id: 'port-elizabeth',
      name: 'Port Elizabeth',
      provinceId: 'eastern-cape',
    },
    { id: 'east-london', name: 'East London', provinceId: 'eastern-cape' },

    // Free State
    { id: 'bloemfontein', name: 'Bloemfontein', provinceId: 'free-state' },

    // Mpumalanga
    { id: 'nelspruit', name: 'Nelspruit', provinceId: 'mpumalanga' },

    // Limpopo
    { id: 'polokwane', name: 'Polokwane', provinceId: 'limpopo' },

    // North West
    { id: 'mahikeng', name: 'Mahikeng', provinceId: 'north-west' },

    // Northern Cape
    { id: 'kimberley', name: 'Kimberley', provinceId: 'northern-cape' },
  ];

  branches: Branch[] = [
    // Johannesburg branches
    {
      id: 'cresta',
      name: 'Cresta',
      cityId: 'johannesburg',
    },
    {
      id: 'johannesburg',
      name: 'Johannesburg',
      cityId: 'johannesburg',
    },
    {
      id: 'roodepoort',
      name: 'Roodepoort',
      cityId: 'johannesburg',
    },

    // Pretoria Menlyn
    {
      id: 'pretoria-menlyn',
      name: 'Pretoria Menlyn',
      cityId: 'pretoria-menlyn',
    },

    // Pretoria
    {
      id: 'pretoria',
      name: 'Pretoria',
      cityId: 'pretoria',
    },

    // Soweto
    {
      id: 'soweto',
      name: 'Soweto',
      cityId: 'soweto',
    },

    // Springs
    {
      id: 'springs',
      name: 'Springs',
      cityId: 'springs',
    },

    // Vereeniging
    {
      id: 'vereeniging',
      name: 'Vereeniging',
      cityId: 'vereeniging',
    },

    // Alberton
    {
      id: 'alberton',
      name: 'Alberton',
      cityId: 'alberton',
    },

    // Benoni
    {
      id: 'benoni',
      name: 'Benoni',
      cityId: 'benoni',
    },

    // Brakpan
    {
      id: 'brakpan',
      name: 'Brakpan',
      cityId: 'brakpan',
    },

    // Boksburg
    {
      id: 'boksburg',
      name: 'Boksburg',
      cityId: 'boksburg',
    },

    // Carletonville
    {
      id: 'carletonville',
      name: 'Carletonville',
      cityId: 'carletonville',
    },

    // Edenvale
    {
      id: 'edenvale',
      name: 'Edenvale',
      cityId: 'edenvale',
    },

    // Ga-Rankuwa
    {
      id: 'ga-rankawa',
      name: 'Ga-Rankuwa',
      cityId: 'ga-rankawa',
    },

    // Heidelberg
    {
      id: 'heidelberg',
      name: 'Heidelberg',
      cityId: 'heidelberg',
    },

    // Kempton Park
    {
      id: 'kempton-park',
      name: 'Kempton Park',
      cityId: 'kempton-park',
    },

    // Mogale City
    {
      id: 'mogale-city',
      name: 'Mogale City',
      cityId: 'mogale-city',
    },

    // Hammanskraal Temba
    {
      id: 'hammanskraal-temba',
      name: 'Hammanskraal Temba',
      cityId: 'hammanskraal-temba',
    },

    // Nigel
    {
      id: 'nigel',
      name: 'Nigel',
      cityId: 'nigel',
    },

    // Medium Office Randburg
    {
      id: 'medium-office-randburg',
      name: 'Medium Office Randburg',
      cityId: 'medium-office-randburg',
    },

    // Pretoria North
    {
      id: 'pretoria-north',
      name: 'Pretoria North',
      cityId: 'pretoria-north',
    },

    // Johannesburg Metro Municipality
    {
      id: 'johannesburg-metro-municipality',
      name: 'Johannesburg Metro Municipality',
      cityId: 'johannesburg-metro-municipality',
    },

    // Vanderbijlpark
    {
      id: 'vanderbijlpark',
      name: 'Vanderbijlpark',
      cityId: 'vanderbijlpark',
    },

    // Tshwane
    {
      id: 'tshwane',
      name: 'Tshwane',
      cityId: 'tshwane',
    },

    // Randfontein
    {
      id: 'randfontein',
      name: 'Randfontein',
      cityId: 'randfontein',
    },

    // Centurion
    {
      id: 'centurion',
      name: 'Centurion',
      cityId: 'centurion',
    },

    // Mamelodi East
    {
      id: 'mamelodi-east',
      name: 'Mamelodi East',
      cityId: 'mamelodi-east',
    },

    // Evaton
    {
      id: 'evaton',
      name: 'Evaton',
      cityId: 'evaton',
    },

    // Bronkhorstspruit
    {
      id: 'bronkhorstspruit',
      name: 'Bronkhorstspruit',
      cityId: 'bronkhorstspruit',
    },

    // Cape Town branches
    {
      id: 'cape-town',
      name: 'Cape Town',
      cityId: 'cape-town',
    },
    {
      id: 'khayelitsha',
      name: 'Khayelitsha',
      cityId: 'cape-town',
    },
    {
      id: 'nyanga',
      name: 'Nyanga',
      cityId: 'cape-town',
    },
    {
      id: 'wynberg',
      name: 'Wynberg',
      cityId: 'cape-town',
    },
    {
      id: 'somerset-west',
      name: 'Somerset West',
      cityId: 'cape-town',
    },
    {
      id: 'vredenburg',
      name: 'Vredenburg',
      cityId: 'cape-town',
    },

    // Bellville branches
    {
      id: 'bellville',
      name: 'Bellville',
      cityId: 'bellville',
    },
    {
      id: 'tygervalley',
      name: 'Tygervalley',
      cityId: 'bellville',
    },

    // Other Western Cape cities (one branch each)
    {
      id: 'epping-goodwood',
      name: 'Epping Goodwood',
      cityId: 'epping-goodwood',
    },
    {
      id: 'vredendal',
      name: 'Vredendal',
      cityId: 'vredendal',
    },
    {
      id: 'grabouw',
      name: 'Grabouw',
      cityId: 'grabouw',
    },
    {
      id: 'george',
      name: 'George',
      cityId: 'george',
    },
    {
      id: 'paarl',
      name: 'Paarl',
      cityId: 'paarl',
    },
    {
      id: 'beaufort-west',
      name: 'Beaufort West',
      cityId: 'beaufort-west',
    },
    {
      id: 'caledon',
      name: 'Caledon',
      cityId: 'caledon',
    },
    {
      id: 'mitchells-plain',
      name: 'Mitchells Plain',
      cityId: 'mitchells-plain',
    },
    {
      id: 'malmesbury',
      name: 'Malmesbury',
      cityId: 'malmesbury',
    },
    {
      id: 'oudtshoorn',
      name: 'Oudtshoorn',
      cityId: 'oudtshoorn',
    },
    {
      id: 'worcester',
      name: 'Worcester',
      cityId: 'worcester',
    },
    {
      id: 'stellenbosch',
      name: 'Stellenbosch',
      cityId: 'stellenbosch',
    },
    {
      id: 'kwanonqaba',
      name: 'Kwanonqaba',
      cityId: 'kwanonqaba',
    },
    {
      id: 'prince-albert',
      name: 'Prince Albert',
      cityId: 'prince-albert',
    },
    {
      id: 'bredasdorp',
      name: 'Bredasdorp',
      cityId: 'bredasdorp',
    },
    {
      id: 'robertson',
      name: 'Robertson',
      cityId: 'robertson',
    },
    {
      id: 'ceres',
      name: 'Ceres',
      cityId: 'ceres',
    },
    {
      id: 'plettenburg-bay',
      name: 'Plettenburg Bay',
      cityId: 'plettenburg-bay',
    },

    // Durban
    {
      id: 'durban',
      name: 'Durban',
      cityId: 'durban',
    },

    // Umhlanga
    {
      id: 'umhlanga',
      name: 'Umhlanga',
      cityId: 'umhlanga',
    },

    // Port Elizabeth
    {
      id: 'port-elizabeth',
      name: 'Port Elizabeth',
      cityId: 'port-elizabeth',
    },

    // East London
    {
      id: 'east-london',
      name: 'East London',
      cityId: 'east-london',
    },

    // Bloemfontein
    {
      id: 'bloemfontein',
      name: 'Bloemfontein',
      cityId: 'bloemfontein',
    },

    // Nelspruit
    {
      id: 'nelspruit',
      name: 'Nelspruit',
      cityId: 'nelspruit',
    },

    // Polokwane
    {
      id: 'polokwane',
      name: 'Polokwane',
      cityId: 'polokwane',
    },

    // Mahikeng
    {
      id: 'mahikeng',
      name: 'Mahikeng',
      cityId: 'mahikeng',
    },

    // Kimberley
    {
      id: 'kimberley',
      name: 'Kimberley',
      cityId: 'kimberley',
    },
  ];

  constructor(private slotService: SlotService, private router: Router) {}

  ngOnInit(): void {
    if (this.searchCriteria) {
      this.searchSlots();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if searchCriteria has changed
    if (changes['searchCriteria'] && this.searchCriteria) {
      this.searchSlots();
    }
  }

  searchSlots(): void {
    if (!this.searchCriteria) return;

    this.isLoading = true;
    this.noSlotsAvailable = false;
    this.alternativeSuggestions = [];

    // Use the new service method that returns alternatives
    this.slotService
      .searchAvailableSlotsWithAlternatives(this.searchCriteria!)
      .subscribe({
        next: (result) => {
          this.availableSlots = result.slots;
          this.alternativeSuggestions = result.alternatives;
          this.isLoading = false;
          this.noSlotsAvailable = this.availableSlots.length === 0;
        },
        error: (error) => {
          console.error('Error searching slots:', error);
          this.isLoading = false;
          this.noSlotsAvailable = true;
          this.alternativeSuggestions = [];
        },
      });
  }

  getBranchDisplayName(): string {
    if (!this.searchCriteria?.branch) return 'N/A';

    const branch = this.branches.find(
      (b) => b.id === this.searchCriteria!.branch
    );
    if (!branch) return 'N/A';

    const city = this.cities.find((c) => c.id === branch.cityId);
    if (!city) return branch.name;

    const province = this.provinces.find((p) => p.id === city.provinceId);
    if (!province) return `${city.name} - ${branch.name}`;

    return `${province.name} → ${city.name} → ${branch.name}`;
  }

  getDateRangeDisplay(): string {
    if (!this.searchCriteria) return 'N/A';

    const startDate = new Date(this.searchCriteria.startDate);
    const endDate = new Date(this.searchCriteria.endDate);

    // const startFormatted = startDate.toLocaleDateString('en-ZA', {
    //   day: 'numeric',
    //   month: 'short'
    // });

    // const endFormatted = endDate.toLocaleDateString('en-US', {
    //   year: 'numeric',
    //   month: 'short',
    //   day: 'numeric',
    // });

    const dayMonthOnlyFormatter = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
    });

    const allFormatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const startParts = dayMonthOnlyFormatter.formatToParts(startDate);
    const endParts = allFormatter.formatToParts(endDate);

    const startFormatted = `${
      startParts.find((p) => p.type === 'day')!.value
    } ${startParts.find((p) => p.type === 'month')!.value}`;

    const endFormatted = `${endParts.find((p) => p.type === 'day')!.value} ${
      endParts.find((p) => p.type === 'month')!.value
    } ${endParts.find((p) => p.type === 'year')!.value}`;

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
      return date.toLocaleDateString('en-ZA', { weekday: 'long' });
    } catch (error) {
      return 'Unknown';
    }
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);

      const allFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const parts = allFormatter.formatToParts(date);

      const formatted = `${parts.find((p) => p.type === 'day')!.value} ${
        parts.find((p) => p.type === 'month')!.value
      } ${parts.find((p) => p.type === 'year')!.value}`;

      return formatted;
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

  selectAlternativeSuggestion(suggestion: AlternativeSuggestion): void {
    // Emit the selected alternative branch ID
    this.alternativeBranchSelected.emit(suggestion.branchId);
  }
}
