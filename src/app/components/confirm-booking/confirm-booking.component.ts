import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormPageLayoutComponent } from '../shared/form-page-layout/form-page-layout.component';

interface BookingPerson {
  id: string;
  name: string;
  type: string;
  selectedServices: any[];
}

interface PersonalData {
  forenames: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email: string;
}

interface SelectedSlot {
  date: string;
  time: string;
}

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  imports: [CommonModule, FormPageLayoutComponent],
  template: `
    <app-form-page-layout [currentStep]="3" [steps]="stepTitles">
      <h2>Confirm Your Booking</h2>
      <p class="confirm-description">
        Please review all details before confirming your appointment booking.
      </p>

      <!-- Personal Information -->
      <div class="booking-section">
        <h3>👤 Personal Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Full Name:</span>
            <span class="info-value">{{
              personalData?.forenames + ' ' + personalData?.lastName || 'N/A'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">ID Number:</span>
            <span class="info-value">{{
              personalData?.idNumber || 'N/A'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">{{ personalData?.phone || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ personalData?.email || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Booking Details -->
      <div class="booking-section">
        <h3>📋 Booking Details</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Branch:</span>
            <span class="info-value">{{ branchDisplayName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Appointment Date:</span>
            <span class="info-value">{{
              getFormattedDate(selectedSlot?.date)
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Appointment Time:</span>
            <span class="info-value">{{ selectedSlot?.time || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Applicants:</span>
            <span class="info-value">{{ bookingPersons.length }}</span>
          </div>
        </div>
      </div>

      <!-- Selected Services -->
      <div class="booking-section">
        <h3>🔧 Selected Services</h3>
        <div class="services-summary">
          <div *ngFor="let person of bookingPersons" class="person-services">
            <h4>{{ person.name }} ({{ person.type }})</h4>
            <div class="services-list">
              <div
                *ngFor="let service of person.selectedServices"
                class="service-item"
              >
                {{ service.name }}
              </div>
              <div
                *ngIf="
                  !person.selectedServices ||
                  person.selectedServices.length === 0
                "
                class="no-services"
              >
                No services selected
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="confirm-actions">
        <button type="button" (click)="onBackToResults()" class="btn-secondary">
          ← Back
        </button>
        <button type="button" (click)="onConfirmBooking()" class="btn-primary">
          Confirm
        </button>
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
      }

      .confirm-description {
        color: var(--DHATextGrayDark);
        text-align: center;
        margin-bottom: 16px;
        font-size: 12px;
        line-height: 1.3;
      }

      .booking-section {
        margin-bottom: 12px;
        padding: 12px;
        background: var(--DHAOffWhite);
        border-radius: 6px;
        border: 1px solid var(--DHABackGroundLightGray);
      }

      .booking-section h3 {
        color: var(--DHAGreen);
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
      }

      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .info-label {
        font-size: 10px;
        color: var(--DHATextGray);
        font-weight: 500;
      }

      .info-value {
        font-size: 12px;
        color: var(--DHAOffBlack);
        font-weight: 600;
        word-break: break-word;
      }

      .services-summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .person-services h4 {
        color: var(--DHAGreen);
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      .services-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .service-item {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
        white-space: nowrap;
      }

      .no-services {
        color: var(--DHATextGray);
        font-size: 10px;
        font-style: italic;
      }

      .confirm-actions {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--DHABackGroundLightGray);
      }

      .btn-primary,
      .btn-secondary {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover {
        background: var(--DHAOffBlack);
        transform: translateY(-1px);
      }

      .btn-secondary {
        background: var(--DHATextGrayDark);
        color: var(--DHAWhite);
      }

      .btn-secondary:hover {
        background: var(--DHAOffBlack);
        transform: translateY(-1px);
      }

      /* Mobile Styles */
      @media (max-width: 768px) {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .confirm-actions {
          flex-direction: column;
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
        }
      }
    `,
  ],
})
export class ConfirmBookingComponent {
  @Input() stepTitles: string[] = [
    'Services',
    'Details',
    'Timeslots',
    'Confirm',
  ];
  @Input() personalData: PersonalData | null = null;
  @Input() bookingPersons: BookingPerson[] = [];
  @Input() selectedSlot: SelectedSlot | null = null;
  @Input() branchDisplayName: string = '';

  @Output() backToResults = new EventEmitter<void>();
  @Output() confirmBooking = new EventEmitter<void>();

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  }

  onBackToResults(): void {
    this.backToResults.emit();
  }

  onConfirmBooking(): void {
    this.confirmBooking.emit();
  }
}
