import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-appointment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="view-appointment-container">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="top-bar-content">
          <div class="logo-section">
            <button type="button" (click)="goHome()" class="btn-home-top">
              ← Home
            </button>
          </div>
          <img src="/Logo_DHA_wecare.png" alt="DHA Logo" class="logo-icon" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="view-appointment-content">
        <div class="appointment-card">
          <h1>Your Appointment Details</h1>
          <p class="appointment-description">
            Here are the details of your confirmed appointment.
          </p>

          <!-- Personal Information -->
          <div class="appointment-section">
            <h3>👤 Personal Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Full Name:</span>
                <span class="info-value"
                  >{{ appointmentData?.personalData?.forenames }}
                  {{ appointmentData?.personalData?.lastName }}</span
                >
              </div>
              <div class="info-item">
                <span class="info-label">ID Number:</span>
                <span class="info-value">{{
                  appointmentData?.personalData?.idNumber
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone:</span>
                <span class="info-value">{{
                  appointmentData?.personalData?.phone
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">{{
                  appointmentData?.personalData?.email
                }}</span>
              </div>
            </div>
          </div>

          <!-- Appointment Details -->
          <div class="appointment-section">
            <h3>📋 Appointment Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Branch:</span>
                <span class="info-value">{{ getBranchDisplayName() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Appointment Date:</span>
                <span class="info-value">{{
                  getFormattedDate(appointmentData?.selectedSlot?.date)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Appointment Time:</span>
                <span class="info-value">{{
                  appointmentData?.selectedSlot?.time
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Applicants:</span>
                <span class="info-value">{{
                  appointmentData?.bookingPersons?.length
                }}</span>
              </div>
            </div>
          </div>

          <!-- Selected Services -->
          <div class="appointment-section">
            <h3>🔧 Selected Services</h3>
            <div class="services-summary">
              <div
                *ngFor="let person of appointmentData?.bookingPersons"
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

          <!-- Action Buttons -->
          <div class="appointment-actions">
            <button type="button" (click)="goBack()" class="btn-secondary">
              ← Back to Menu
            </button>
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

      .view-appointment-container {
        min-height: 100vh;
        background: var(--DHABackGroundLightGray);
        padding-top: 70px;
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
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .top-bar-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 15px;
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

      .logo-icon {
        height: 60px;
        width: auto;
      }

      .view-appointment-content {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: calc(100vh - 70px);
        padding: 20px;
      }

      .appointment-card {
        background: var(--DHAWhite);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        border: 1px solid var(--DHABackGroundLightGray);
        max-width: 500px;
        width: 100%;
        box-sizing: border-box;
        margin: 0 auto;
      }

      .appointment-card h1 {
        color: var(--DHAGreen);
        margin-bottom: 4px;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
      }

      .appointment-description {
        color: var(--DHATextGrayDark);
        text-align: center;
        margin-bottom: 16px;
        font-size: 12px;
        line-height: 1.3;
      }

      .appointment-section {
        margin-bottom: 12px;
        padding: 12px;
        background: var(--DHAOffWhite);
        border-radius: 6px;
        border: 1px solid var(--DHABackGroundLightGray);
      }

      .appointment-section h3 {
        color: var(--DHAGreen);
        margin: 0;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 4px;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 8px;
        background: var(--DHAWhite);
        border-radius: 4px;
        border: 1px solid var(--DHABackGroundLightGray);
      }

      .info-label {
        font-weight: 600;
        color: var(--DHATextGrayDark);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.2px;
      }

      .info-value {
        color: var(--DHAGreen);
        font-weight: 600;
        font-size: 11px;
        word-break: break-word;
      }

      .services-summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .person-services h4 {
        color: var(--DHAGreen);
        margin: 0;
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      .services-summary .services-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .services-summary .service-item {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 3px 6px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 500;
      }

      .no-services {
        color: var(--DHATextGray);
        font-style: italic;
        font-size: 10px;
      }

      .appointment-actions {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--DHABackGroundLightGray);
      }

      .btn-secondary {
        background: var(--DHATextGray);
        color: var(--DHAWhite);
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
      }

      .btn-secondary:hover {
        background: var(--DHATextGrayDark);
        transform: translateY(-1px);
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
      }

      .btn-primary:hover {
        background: var(--DHAOrange);
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .logo-icon {
          height: 40px;
        }
        .btn-home-top {
          padding: 4px 8px;
          font-size: 11px;
        }

        .view-appointment-content {
          padding: 16px 12px;
        }

        .appointment-card {
          padding: 12px;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        .appointment-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ViewAppointmentComponent implements OnInit {
  appointmentData: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Load appointment data from session storage
    let appointmentDataStr = sessionStorage.getItem('confirmedAppointment');

    // If not found, try to get personal data and look by ID
    if (!appointmentDataStr) {
      const personalDataStr = sessionStorage.getItem('personalData');
      if (personalDataStr) {
        const personalData = JSON.parse(personalDataStr);
        if (personalData?.idNumber) {
          appointmentDataStr = sessionStorage.getItem(
            `appointment_${personalData.idNumber}`
          );
        }
      }
    }

    if (appointmentDataStr) {
      this.appointmentData = JSON.parse(appointmentDataStr);
    } else {
      // If no appointment data, redirect to menu
      this.router.navigate(['/menu']);
    }
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getBranchDisplayName(): string {
    if (!this.appointmentData?.searchCriteria?.branch) return 'N/A';
    const branchId = this.appointmentData.searchCriteria.branch;
    if (branchId === 'ct-tygervalley-main') {
      return 'Tygervalley Main Branch';
    }
    return branchId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

  goBack() {
    this.router.navigate(['/menu']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
