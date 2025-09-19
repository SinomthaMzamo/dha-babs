import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
      <h2 class="step-title">Confirm Your Booking</h2>
      <p class="confirm-description">
        Please review all details before confirming your appointment booking.
      </p>

      <div class="section-grid">
        <!-- Personal Information -->
        <div class="section">
          <h3 class="booking-section-title">Personal Information</h3>
          <div class="booking-section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Full Name:</span>
                <span class="info-value">{{
                  personalData?.forenames + ' ' + personalData?.lastName ||
                    'N/A'
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
                <span class="info-value">{{
                  personalData?.phone || 'N/A'
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">{{
                  personalData?.email || 'N/A'
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Details -->
        <div class="section">
          <h3 class="booking-section-title">Booking Details</h3>
          <div class="booking-section">
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
                <span class="info-value">{{
                  selectedSlot?.time || 'N/A'
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Applicants:</span>
                <span class="info-value">{{ bookingPersons.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Services -->
        <div class="section">
          <h3 class="booking-section-title">Selected Services</h3>
          <div class="booking-section">
            <div class="services-summary">
              <div
                *ngFor="let person of bookingPersons"
                class="person-services"
              >
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

      <!-- Demo Mode Section -->
      <div class="demo-section" *ngIf="showDemoMode">
        <hr class="demo-divider" />
        <h4>🎬 Demo Mode</h4>
        <p class="demo-description">Quick confirm for demo purposes</p>
        <div class="demo-buttons">
          <button type="button" (click)="confirmDemoBooking()" class="btn-demo">
            Confirm Demo Booking
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
      }

      .step-title {
        text-align: center;
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 600;
        margin-top: 0;
      }

      .confirm-description {
        color: var(--DHATextGray);
        font-size: 16px;
        margin: 0;
        line-height: 1.5;
        font-weight: 400;
        margin-bottom: 30px;
      }

      .section-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .booking-section {
        padding: 12px;
        background: var(--DHAOffWhite);
        border-radius: 6px;
        border: 1px solid var(--DHABackGroundLightGray);
      }

      .booking-section-title {
        color: var(--DHAOffBlack);
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
        margin-top: 0;
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
        color: var(--DHATextGrayDark);
        font-weight: 600;
        word-break: break-word;
      }

      .services-summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .person-services h4 {
        color: var(--DHATextGrayDark);
        margin-bottom: 4px;
        margin-top: 0;
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
        padding: 4px 8px;
        border-radius: 12px;
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
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
        }

        .step-title {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }
      }

      /* Demo Mode Styles */
      .demo-section {
        margin-top: 30px;
        text-align: center;
        background: var(--DHAOffWhite);
        border-radius: 8px;
        padding: 20px;
        border: 2px dashed var(--DHAGreen);
      }

      .demo-divider {
        border: none;
        height: 1px;
        background: var(--DHABackGroundLightGray);
        margin: 0 0 15px 0;
      }

      .demo-section h4 {
        color: var(--DHAGreen);
        margin: 0 0 8px 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .demo-description {
        color: var(--DHATextGray);
        font-size: 14px;
        margin: 0 0 15px 0;
      }

      .demo-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn-demo {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        border-radius: 6px;
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 140px;
      }

      .btn-demo:hover {
        background: var(--DHALightOrange);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(243, 128, 31, 0.3);
      }
    `,
  ],
})
export class ConfirmBookingComponent implements OnInit {
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

  showDemoMode: boolean = false;

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

  // Demo Mode Methods
  checkDemoMode() {
    // Check URL parameters for demo mode
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('demo');

    // Check localStorage for demo mode
    const demoMode = localStorage.getItem('dha-demo-mode');

    this.showDemoMode = demoParam === 'true' || demoMode === 'true';

    // If demo mode is enabled via URL, persist it to localStorage
    if (demoParam === 'true') {
      localStorage.setItem('dha-demo-mode', 'true');
    }
  }

  confirmDemoBooking() {
    // Simulate confirming the booking for demo purposes
    this.onConfirmBooking();
  }

  ngOnInit() {
    // Check for demo mode when component initializes
    this.checkDemoMode();
  }
}
