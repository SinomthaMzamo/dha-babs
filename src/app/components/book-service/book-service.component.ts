import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { AppointmentResultsComponent } from '../appointment-results/appointment-results.component';

interface SlotSearchCriteria {
  branch: string;
  startDate: string;
  endDate: string;
  services: string[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentFormComponent,
    AppointmentResultsComponent,
  ],
  template: `
    <div class="book-service-container">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="top-bar-content">
          <div class="logo-section">
            <button type="button" (click)="goHome()" class="btn-home-top">
              ← Return Home
            </button>
          </div>
          <img src="/Logo_DHA_wecare.png" alt="DHA Logo" class="logo-icon" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Booking Preview Page -->
        <div
          *ngIf="currentStep === 'preview'"
          class="booking-preview-container"
        >
          <div class="booking-preview-card">
            <h2>Schedule Your Appointment</h2>
            <p class="preview-description">
              Review your details and select the services you need
            </p>

            <!-- User Details Preview -->
            <div class="user-details-section">
              <h3>Your Details</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <label>ID Number:</label>
                  <span class="detail-value">{{ personalData?.idNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>Full Name:</label>
                  <span class="detail-value"
                    >{{ personalData?.forenames }}
                    {{ personalData?.lastName }}</span
                  >
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span class="detail-value">{{ personalData?.email }}</span>
                </div>
                <div class="detail-item">
                  <label>Phone:</label>
                  <span class="detail-value">{{ personalData?.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Services Section -->
            <div class="services-section">
              <h3>Selected Services</h3>
              <div class="services-preview">
                <div *ngIf="selectedServices.length === 0" class="no-services">
                  <p>No services selected yet</p>
                </div>
                <div
                  *ngIf="selectedServices.length > 0"
                  class="services-badges"
                >
                  <div
                    *ngFor="let service of selectedServices"
                    class="service-badge"
                  >
                    <span class="service-name">{{ service.name }}</span>
                    <button
                      type="button"
                      (click)="removeService(service)"
                      class="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="openServiceModal()"
                  class="btn-add-service"
                >
                  {{
                    selectedServices.length === 0
                      ? 'Add Services'
                      : 'Edit Services'
                  }}
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button type="button" (click)="goBack()" class="btn-secondary">
                Back to Menu
              </button>
              <button
                type="button"
                (click)="proceedToLocation()"
                [disabled]="selectedServices.length === 0"
                class="btn-primary"
              >
                Continue to Location Selection
              </button>
            </div>
          </div>
        </div>

        <!-- Service Selection Modal -->
        <div
          *ngIf="showServiceModal"
          class="modal-overlay"
          (click)="closeServiceModal()"
        >
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Select Services</h3>
              <button
                type="button"
                (click)="closeServiceModal()"
                class="modal-close"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <p class="modal-description">Choose the services you need:</p>
              <div class="services-list">
                <div
                  *ngFor="let service of availableServices"
                  class="service-item"
                >
                  <label class="service-checkbox">
                    <input
                      type="checkbox"
                      [checked]="service.checked"
                      (change)="toggleService(service)"
                    />
                    <span class="checkmark"></span>
                  </label>
                  <div class="service-details">
                    <div class="service-name">{{ service.name }}</div>
                    <div class="service-description">
                      {{ service.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                (click)="closeServiceModal()"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="saveServices()"
                class="btn-primary"
              >
                Save Services
              </button>
            </div>
          </div>
        </div>

        <!-- Show Form or Results based on state -->
        <app-appointment-form
          *ngIf="currentStep === 'form'"
          [selectedServices]="selectedServices"
          (formSubmitted)="onFormSubmitted($event)"
        ></app-appointment-form>

        <app-appointment-results
          *ngIf="currentStep === 'results'"
          [searchCriteria]="searchCriteria"
          (editSearchRequested)="onEditSearchRequested()"
        ></app-appointment-results>
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
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
      }

      .book-service-container {
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding-top: 70px;
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

      .main-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      /* Booking Preview Styles */
      .booking-preview-container {
        min-height: calc(100vh - 70px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .booking-preview-card {
        background: var(--DHAWhite);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 40px;
        max-width: 600px;
        width: 100%;
      }

      .booking-preview-card h2 {
        color: var(--DHATextGrayDark);
        font-size: 28px;
        margin-bottom: 10px;
        text-align: center;
      }

      .preview-description {
        color: var(--DHATextGray);
        text-align: center;
        margin-bottom: 30px;
        font-size: 16px;
      }

      .user-details-section,
      .services-section {
        margin-bottom: 30px;
      }

      .user-details-section h3,
      .services-section h3 {
        color: var(--DHATextGrayDark);
        font-size: 20px;
        margin-bottom: 15px;
        border-bottom: 2px solid var(--DHAGreen);
        padding-bottom: 8px;
      }

      .details-grid {
        display: grid;
        gap: 12px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .detail-item:last-child {
        border-bottom: none;
      }

      .detail-item label {
        font-weight: 600;
        color: var(--DHATextGrayDark);
        font-size: 14px;
      }

      .detail-value {
        color: var(--DHAGreen);
        font-weight: 500;
        font-size: 14px;
        text-align: right;
        word-break: break-all;
      }

      .services-preview {
        background: var(--DHAOffWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        padding: 20px;
      }

      .no-services {
        text-align: center;
        color: var(--DHATextGray);
        margin-bottom: 15px;
      }

      .services-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
      }

      .service-badge {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 8px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .service-badge .remove-btn {
        background: none;
        border: none;
        color: var(--DHAWhite);
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .service-badge .remove-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .btn-add-service {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
      }

      .btn-add-service:hover {
        background: var(--DHALightOrange);
      }

      .action-buttons {
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

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .modal-content {
        background: var(--DHAWhite);
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .modal-header h3 {
        color: var(--DHATextGrayDark);
        margin: 0;
        font-size: 20px;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--DHATextGray);
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .modal-close:hover {
        background: var(--DHABackGroundLightGray);
      }

      .modal-body {
        padding: 20px;
      }

      .modal-description {
        color: var(--DHATextGray);
        margin-bottom: 20px;
        font-size: 14px;
      }

      .services-list {
        display: grid;
        gap: 15px;
      }

      .service-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 15px;
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        transition: all 0.2s;
      }

      .service-item:hover {
        border-color: var(--DHAGreen);
        background: var(--DHAOffWhite);
      }

      .service-checkbox {
        position: relative;
        cursor: pointer;
        margin-top: 2px;
      }

      .service-checkbox input {
        opacity: 0;
        position: absolute;
      }

      .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid var(--DHATextGray);
        border-radius: 4px;
        display: block;
        position: relative;
        transition: all 0.2s;
      }

      .service-checkbox input:checked + .checkmark {
        background: var(--DHAGreen);
        border-color: var(--DHAGreen);
      }

      .service-checkbox input:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--DHAWhite);
        font-size: 12px;
        font-weight: bold;
      }

      .service-details {
        flex: 1;
      }

      .service-details .service-name {
        font-weight: 600;
        color: var(--DHATextGrayDark);
        margin-bottom: 4px;
        font-size: 16px;
      }

      .service-details .service-description {
        color: var(--DHATextGray);
        font-size: 14px;
        line-height: 1.4;
      }

      .modal-footer {
        display: flex;
        gap: 15px;
        padding: 20px;
        border-top: 1px solid var(--DHABackGroundLightGray);
      }

      .modal-footer .btn-secondary,
      .modal-footer .btn-primary {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .modal-footer .btn-secondary {
        background: var(--DHATextGrayDark);
        color: var(--DHAWhite);
      }

      .modal-footer .btn-secondary:hover {
        background: var(--DHAOffBlack);
      }

      .modal-footer .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .modal-footer .btn-primary:hover {
        background: var(--DHAMaroon);
      }

      @media (max-width: 768px) {
        .main-content {
          padding: 15px;
        }

        .booking-preview-card {
          padding: 20px;
        }

        .booking-preview-card h2 {
          font-size: 24px;
        }

        .action-buttons {
          flex-direction: column;
        }

        .modal-content {
          margin: 10px;
          max-height: 90vh;
        }

        .modal-footer {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class BookServiceComponent implements OnInit {
  currentStep: 'preview' | 'form' | 'results' = 'preview';
  showServiceModal = false;
  searchCriteria: SlotSearchCriteria | null = null;
  personalData: any = null;
  selectedServices: Service[] = [];
  availableServices: Service[] = [
    {
      id: 'id-card',
      name: 'ID Card Application',
      description: 'Apply for a new South African ID card',
      checked: false,
    },
    {
      id: 'passport',
      name: 'Passport Application',
      description: 'Apply for a new South African passport',
      checked: false,
    },
    {
      id: 'birth-certificate',
      name: 'Birth Certificate',
      description: 'Apply for a birth certificate',
      checked: false,
    },
    {
      id: 'marriage-certificate',
      name: 'Marriage Certificate',
      description: 'Apply for a marriage certificate',
      checked: false,
    },
    {
      id: 'death-certificate',
      name: 'Death Certificate',
      description: 'Apply for a death certificate',
      checked: false,
    },
    {
      id: 'citizenship',
      name: 'Citizenship Application',
      description: 'Apply for South African citizenship',
      checked: false,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Load personal data from session storage
    const personalDataStr = sessionStorage.getItem('personalData');
    if (personalDataStr) {
      this.personalData = JSON.parse(personalDataStr);
    } else {
      // Redirect to menu if no personal data
      this.router.navigate(['/menu']);
    }

    // Load selected services from session storage if any
    const selectedServicesStr = sessionStorage.getItem('selectedServices');
    if (selectedServicesStr) {
      this.selectedServices = JSON.parse(selectedServicesStr);
      // Update available services to reflect current selections
      this.updateAvailableServices();
    }
  }

  openServiceModal() {
    this.showServiceModal = true;
  }

  closeServiceModal() {
    this.showServiceModal = false;
  }

  toggleService(service: Service) {
    service.checked = !service.checked;
  }

  saveServices() {
    // Update selected services based on checked items
    this.selectedServices = this.availableServices.filter(
      (service) => service.checked
    );

    // Save to session storage
    sessionStorage.setItem(
      'selectedServices',
      JSON.stringify(this.selectedServices)
    );

    // Close modal
    this.closeServiceModal();
  }

  removeService(service: Service) {
    // Remove from selected services
    this.selectedServices = this.selectedServices.filter(
      (s) => s.id !== service.id
    );

    // Update available services
    const availableService = this.availableServices.find(
      (s) => s.id === service.id
    );
    if (availableService) {
      availableService.checked = false;
    }

    // Save to session storage
    sessionStorage.setItem(
      'selectedServices',
      JSON.stringify(this.selectedServices)
    );
  }

  updateAvailableServices() {
    // Update the checked state of available services based on selected services
    this.availableServices.forEach((service) => {
      service.checked = this.selectedServices.some(
        (selected) => selected.id === service.id
      );
    });
  }

  proceedToLocation() {
    this.currentStep = 'form';
    window.scrollTo(0, 0);
  }

  onFormSubmitted(formData: any) {
    // Store the search criteria
    this.searchCriteria = {
      branch: formData.branch,
      startDate: formData.startDate,
      endDate: formData.endDate,
      services: this.selectedServices.map((s) => s.name),
    };

    // Switch to results view
    this.currentStep = 'results';

    // Scroll to top when switching to results
    window.scrollTo(0, 0);
  }

  onEditSearchRequested() {
    // Switch back to form view
    this.currentStep = 'form';

    // Scroll to top when switching back to form
    window.scrollTo(0, 0);
  }

  goBack() {
    this.router.navigate(['/menu']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
