import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';
import {
  SlotService,
  AvailableSlot,
  SlotSearchCriteria,
} from '../../services/slot.service';

interface Service {
  id: string;
  name: string;
  description: string;
  checked: boolean;
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

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressIndicatorComponent],
  template: `
    <div class="top-bar">
      <div class="top-bar-content">
        <div class="logo-section">
          <span class="logo-icon">🏛️</span>
          <span class="logo-text">DHA Online Booking</span>
        </div>
        <button type="button" (click)="goHome()" class="btn-home-top">
          🏠 Return Home
        </button>
      </div>
    </div>

    <div class="booking-container">
      <div class="booking-card">
        <app-progress-indicator [currentStep]="2"></app-progress-indicator>
        <h2>Step 3: Book a Service</h2>

        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Select Service(s) Required *</label>
            <div class="services-list">
              <div *ngFor="let service of services" class="service-item">
                <input
                  type="checkbox"
                  [id]="service.id"
                  [checked]="service.checked"
                  (change)="onServiceChange(service)"
                />
                <label [for]="service.id" class="service-label">
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-description">{{
                    service.description
                  }}</span>
                </label>
              </div>
            </div>
            <div *ngIf="!hasSelectedServices" class="error-message">
              Please select at least one service
            </div>
          </div>

          <div class="form-group">
            <label for="province">Province *</label>
            <select
              id="province"
              formControlName="province"
              class="form-control"
              (change)="onProvinceChange()"
            >
              <option value="">Select Province</option>
              <option *ngFor="let prov of provinces" [value]="prov.id">
                {{ prov.name }}
              </option>
            </select>
            <div
              *ngIf="
                bookingForm.get('province')?.invalid &&
                bookingForm.get('province')?.touched
              "
              class="error-message"
            >
              Please select a province
            </div>
          </div>

          <div class="form-group">
            <label for="area">Area *</label>
            <select
              id="area"
              formControlName="area"
              class="form-control"
              (change)="onAreaChange()"
              [disabled]="!bookingForm.get('province')?.value"
            >
              <option value="">Select Area</option>
              <option *ngFor="let area of filteredAreas" [value]="area.id">
                {{ area.name }}
              </option>
            </select>
            <div
              *ngIf="
                bookingForm.get('area')?.invalid &&
                bookingForm.get('area')?.touched
              "
              class="error-message"
            >
              Please select an area
            </div>
          </div>

          <div class="form-group">
            <label for="branch">Branch *</label>
            <select
              id="branch"
              formControlName="branch"
              class="form-control"
              [disabled]="!bookingForm.get('area')?.value"
            >
              <option value="">Select Branch</option>
              <option
                *ngFor="let branch of filteredBranches"
                [value]="branch.id"
              >
                {{ branch.name }}
              </option>
            </select>
            <div
              *ngIf="
                bookingForm.get('branch')?.invalid &&
                bookingForm.get('branch')?.touched
              "
              class="error-message"
            >
              Please select a branch
            </div>
          </div>

          <div class="form-group">
            <label for="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              formControlName="startDate"
              class="form-control"
              [min]="today"
            />
            <div
              *ngIf="
                bookingForm.get('startDate')?.invalid &&
                bookingForm.get('startDate')?.touched
              "
              class="error-message"
            >
              Please select a start date
            </div>
          </div>

          <div class="form-group">
            <label for="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              formControlName="endDate"
              class="form-control"
              [min]="bookingForm.get('startDate')?.value || today"
            />
            <div
              *ngIf="
                bookingForm.get('endDate')?.invalid &&
                bookingForm.get('endDate')?.touched
              "
              class="error-message"
            >
              <div *ngIf="bookingForm.get('endDate')?.errors?.['required']">
                Please select an end date
              </div>
              <div
                *ngIf="bookingForm.get('endDate')?.errors?.['invalidDateRange']"
              >
                End date must be after start date
              </div>
            </div>
          </div>

          <div class="button-group">
            <button type="button" (click)="goBack()" class="btn-secondary">
              Back
            </button>
            <button
              type="submit"
              [disabled]="!isFormValid()"
              class="btn-primary"
            >
              Find Slots
            </button>
          </div>
        </form>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Searching for available slots...</p>
        </div>

        <!-- No Slots Available -->
        <div
          *ngIf="noSlotsAvailable && searchPerformed && !isLoading"
          class="no-slots-container"
        >
          <div class="no-slots-icon">📅</div>
          <h3>No Available Slots</h3>
          <p>No appointment slots are available for the selected criteria.</p>
          <div class="no-slots-actions">
            <button (click)="editSearch()" class="btn-secondary">
              Edit Search
            </button>
            <button (click)="searchForSlots()" class="btn-primary">
              Try Again
            </button>
          </div>
        </div>

        <!-- Available Slots -->
        <!-- Booking Summary - Always Visible -->
        <div *ngIf="showSlots" class="booking-summary">
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
        <div
          *ngIf="showSlots && availableSlots.length > 0"
          class="slots-container"
        >
          <div class="slots-header">
            <h3>📅 Available Appointment Slots</h3>
            <div class="slots-count">
              {{ getTotalSlotsCount() }} slots found across
              {{ getUniqueDaysCount() }} days
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
                    <div class="slot-branch">{{ getBranchDisplayName() }}</div>
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
        --DHAOffBlack: #381a46;
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #f57c00;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
      }

      .top-bar {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 15px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
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

      .booking-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 70px);
        background: var(--DHABackGroundLightGray);
        padding: 20px;
      }

      .booking-card {
        background: var(--DHAWhite);
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 600px;
        border: 2px solid var(--DHAGreen);
      }

      h2 {
        text-align: center;
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 28px;
        font-weight: 600;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--DHATextGrayDark);
      }

      .form-control {
        width: 100%;
        padding: 12px;
        border: 2px solid var(--DividerGray);
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.3s ease;
      }

      .form-control:focus {
        outline: none;
        border-color: var(--DHAGreen);
      }

      .form-control:disabled {
        background-color: var(--DHABackGroundLightGray);
        cursor: not-allowed;
      }

      .error-message {
        color: var(--DHAErrorColor);
        font-size: 14px;
        margin-top: 5px;
      }

      .services-list {
        border: 2px solid var(--DividerGray);
        border-radius: 6px;
        padding: 15px;
        max-height: 200px;
        overflow-y: auto;
      }

      .service-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .service-item:hover {
        background-color: var(--DHABackGroundLightGray);
      }

      .service-item:last-child {
        margin-bottom: 0;
      }

      .service-item input[type='checkbox'] {
        margin-right: 12px;
        margin-top: 2px;
      }

      .service-label {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        flex: 1;
      }

      .service-name {
        font-weight: 600;
        color: var(--DHATextGrayDark);
        margin-bottom: 4px;
      }

      .service-description {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      }

      .button-group {
        display: flex;
        gap: 15px;
        margin-top: 30px;
      }

      .btn-primary,
      .btn-secondary {
        flex: 1;
        padding: 14px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--DHAMaroon);
      }

      .btn-primary:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
      }

      .btn-secondary {
        background: var(--DHATextGrayDark);
        color: var(--DHAWhite);
      }

      .btn-secondary:hover {
        background: var(--DHAOffBlack);
      }

      /* Loading State */
      .loading-container {
        text-align: center;
        padding: 40px 20px;
        margin-top: 20px;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
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

      .loading-container p {
        color: #666;
        font-size: 16px;
        margin: 0;
      }

      /* No Slots Available */
      .no-slots-container {
        text-align: center;
        padding: 40px 20px;
        margin-top: 20px;
        background: #f8f9fa;
        border-radius: 12px;
        border: 2px solid #e9ecef;
      }

      .no-slots-icon {
        font-size: 4rem;
        margin-bottom: 20px;
      }

      .no-slots-container h3 {
        color: #333;
        margin-bottom: 15px;
        font-size: 1.5rem;
      }

      .no-slots-container p {
        color: #666;
        margin-bottom: 25px;
        font-size: 16px;
      }

      .no-slots-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .no-slots-actions button {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      /* Booking Summary */
      .booking-summary {
        margin-top: 30px;
        background: var(--DHAWhite);
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAGreen);
        margin-bottom: 20px;
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

      /* Available Slots */
      .slots-container {
        margin-top: 30px;
        background: var(--DHAWhite);
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAGreen);
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

      .slots-count {
        color: var(--DHATextGray);
        font-size: 14px;
        font-weight: 500;
      }

      .btn-edit-search {
        background: #6c757d;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .btn-edit-search:hover {
        background: #5a6268;
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

      .slots-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
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

      .slot-date {
        font-weight: 600;
        color: #333;
        font-size: 16px;
        margin-bottom: 5px;
      }

      .slot-time {
        font-size: 18px;
        font-weight: 700;
        color: var(--DHAGreen);
        margin-bottom: 5px;
      }

      .slot-service {
        color: #666;
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

      @media (max-width: 600px) {
        .slot-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }

        .slots-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .no-slots-actions {
          flex-direction: column;
          align-items: center;
        }

        .no-slots-actions button {
          width: 100%;
          max-width: 200px;
        }
      }
    `,
  ],
})
export class BookServiceComponent implements OnInit {
  bookingForm: FormGroup;
  personalData: any;
  today: string;
  hasSelectedServices = false;

  // Slot availability properties
  availableSlots: AvailableSlot[] = [];
  isLoading = false;
  showSlots = false;
  noSlotsAvailable = false;
  searchPerformed = false;

  // Day group expansion state
  dayGroupExpansionState: Map<string, boolean> = new Map();

  services: Service[] = [
    {
      id: 'smart-id',
      name: 'Smart ID Card',
      description: 'Apply for or renew your smart ID card',
      checked: false,
    },
    {
      id: 'id-book',
      name: 'ID Book',
      description: 'Apply for or renew your ID book',
      checked: false,
    },
    {
      id: 'passport',
      name: 'Passport',
      description: 'Apply for or renew your passport',
      checked: false,
    },
    {
      id: 'birth-cert',
      name: 'Birth Certificate',
      description: 'Apply for birth certificate',
      checked: false,
    },
    {
      id: 'marriage-cert',
      name: 'Marriage Certificate',
      description: 'Apply for marriage certificate',
      checked: false,
    },
    {
      id: 'death-cert',
      name: 'Death Certificate',
      description: 'Apply for death certificate',
      checked: false,
    },
    {
      id: 'citizenship',
      name: 'Citizenship',
      description: 'Apply for citizenship or naturalization',
      checked: false,
    },
    {
      id: 'visa',
      name: 'Visa Services',
      description: 'Apply for or extend visas',
      checked: false,
    },
  ];

  provinces: Province[] = [
    { id: 'gauteng', name: 'Gauteng' },
    { id: 'western-cape', name: 'Western Cape' },
    { id: 'kwazulu-natal', name: 'KwaZulu-Natal' },
    { id: 'eastern-cape', name: 'Eastern Cape' },
    { id: 'free-state', name: 'Free State' },
    { id: 'limpopo', name: 'Limpopo' },
    { id: 'mpumalanga', name: 'Mpumalanga' },
    { id: 'north-west', name: 'North West' },
    { id: 'northern-cape', name: 'Northern Cape' },
  ];

  areas: Area[] = [
    { id: 'johannesburg', name: 'Johannesburg', provinceId: 'gauteng' },
    { id: 'pretoria', name: 'Pretoria', provinceId: 'gauteng' },
    { id: 'cape-town', name: 'Cape Town', provinceId: 'western-cape' },
    { id: 'durban', name: 'Durban', provinceId: 'kwazulu-natal' },
    {
      id: 'port-elizabeth',
      name: 'Port Elizabeth',
      provinceId: 'eastern-cape',
    },
    { id: 'bloemfontein', name: 'Bloemfontein', provinceId: 'free-state' },
    { id: 'polokwane', name: 'Polokwane', provinceId: 'limpopo' },
    { id: 'nelspruit', name: 'Nelspruit', provinceId: 'mpumalanga' },
    { id: 'mahikeng', name: 'Mahikeng', provinceId: 'north-west' },
    { id: 'kimberley', name: 'Kimberley', provinceId: 'northern-cape' },
  ];

  branches: Branch[] = [
    { id: 'jhb-central', name: 'Johannesburg Central', areaId: 'johannesburg' },
    { id: 'jhb-sandton', name: 'Sandton', areaId: 'johannesburg' },
    { id: 'jhb-randburg', name: 'Randburg', areaId: 'johannesburg' },
    { id: 'pta-central', name: 'Pretoria Central', areaId: 'pretoria' },
    { id: 'pta-menkeng', name: 'Menkeng', areaId: 'pretoria' },
    { id: 'ct-central', name: 'Cape Town Central', areaId: 'cape-town' },
    { id: 'ct-bellville', name: 'Bellville', areaId: 'cape-town' },
    { id: 'dbn-central', name: 'Durban Central', areaId: 'durban' },
    { id: 'dbn-umhlanga', name: 'Umhlanga', areaId: 'durban' },
  ];

  filteredAreas: Area[] = [];
  filteredBranches: Branch[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private slotService: SlotService
  ) {
    this.bookingForm = this.fb.group({
      province: ['', Validators.required],
      area: ['', Validators.required],
      branch: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    // Get personal data from session storage
    const personalDataStr = sessionStorage.getItem('personalData');
    if (personalDataStr) {
      this.personalData = JSON.parse(personalDataStr);
    } else {
      // Redirect back to personal info if no data
      this.router.navigate(['/personal-info']);
    }

    // Add custom validator for date range
    this.bookingForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });

    this.bookingForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }

  onServiceChange(service: Service) {
    service.checked = !service.checked;
    this.hasSelectedServices = this.services.some((s) => s.checked);
  }

  onProvinceChange() {
    const provinceId = this.bookingForm.get('province')?.value;
    this.filteredAreas = this.areas.filter(
      (area) => area.provinceId === provinceId
    );

    // Reset dependent fields
    this.bookingForm.patchValue({ area: '', branch: '' });
    this.filteredBranches = [];
  }

  onAreaChange() {
    const areaId = this.bookingForm.get('area')?.value;
    this.filteredBranches = this.branches.filter(
      (branch) => branch.areaId === areaId
    );

    // Reset dependent field
    this.bookingForm.patchValue({ branch: '' });
  }

  validateDateRange() {
    const startDate = this.bookingForm.get('startDate')?.value;
    const endDate = this.bookingForm.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      this.bookingForm.get('endDate')?.setErrors({ invalidDateRange: true });
    } else {
      this.bookingForm.get('endDate')?.setErrors(null);
    }
  }

  isFormValid(): boolean {
    return this.bookingForm.valid && this.hasSelectedServices;
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.searchForSlots();
    }
  }

  searchForSlots() {
    this.isLoading = true;
    this.showSlots = false;
    this.noSlotsAvailable = false;
    this.searchPerformed = true;

    // Get selected services
    const selectedServices = this.services
      .filter((s) => s.checked)
      .map((s) => s.id);

    const searchCriteria: SlotSearchCriteria = {
      branch: this.bookingForm.get('branch')?.value,
      startDate: this.bookingForm.get('startDate')?.value,
      endDate: this.bookingForm.get('endDate')?.value,
      services: selectedServices,
    };

    this.slotService.searchAvailableSlots(searchCriteria).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.isLoading = false;

        if (slots.length === 0) {
          this.noSlotsAvailable = true;
        } else {
          this.showSlots = true;
        }
      },
      error: (error) => {
        console.error('Error searching for slots:', error);
        this.isLoading = false;
        this.noSlotsAvailable = true;
      },
    });
  }

  editSearch() {
    this.showSlots = false;
    this.noSlotsAvailable = false;
    this.searchPerformed = false;
    this.availableSlots = [];
  }

  bookSlot(slot: AvailableSlot) {
    this.slotService.bookSlot(slot.id).subscribe({
      next: (result) => {
        if (result.success) {
          // Store booking data
          const selectedServices = this.services
            .filter((s) => s.checked)
            .map((s) => s.id);

          const bookingData = {
            ...this.personalData,
            selectedServices,
            ...this.bookingForm.value,
            selectedSlot: slot,
            bookingId: result.bookingId,
          };
          sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

          alert(
            `Slot booked successfully! Your booking ID is: ${result.bookingId}`
          );
          this.router.navigate(['/authenticate']);
        } else {
          alert('Failed to book slot. Please try again.');
        }
      },
      error: (error) => {
        console.error('Error booking slot:', error);
        alert('Failed to book slot. Please try again.');
      },
    });
  }

  goBack() {
    this.router.navigate(['/personal-info']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  getServiceDisplayName(serviceType: string): string {
    const service = this.services.find((s) => s.id === serviceType);
    return service ? service.name : serviceType;
  }

  getBranchDisplayName(): string {
    const branchId = this.bookingForm.get('branch')?.value;
    if (!branchId) return 'Not selected';

    const province = this.provinces.find(
      (p) => p.id === this.bookingForm.get('province')?.value
    );
    const area = this.areas.find(
      (a) => a.id === this.bookingForm.get('area')?.value
    );
    const branch = this.branches.find((b) => b.id === branchId);

    if (branch && area && province) {
      return `${branch.name}, ${area.name}, ${province.name}`;
    }
    return 'Not selected';
  }

  getDateRangeDisplay(): string {
    const startDate = this.bookingForm.get('startDate')?.value;
    const endDate = this.bookingForm.get('endDate')?.value;

    if (!startDate || !endDate) return 'Not selected';

    const start = new Date(startDate);
    const end = new Date(endDate);

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
}
