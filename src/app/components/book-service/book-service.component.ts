import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { AppointmentResultsComponent } from '../appointment-results/appointment-results.component';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { IosModalComponent } from '../shared/ios-modal/ios-modal.component';

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

interface BookingPerson {
  id: string;
  name: string;
  type: 'Main Applicant' | 'Child' | 'Friend' | 'Family Member' | 'Other';
  idNumber?: string;
  selectedServices: Service[];
}

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppointmentFormComponent,
    AppointmentResultsComponent,
    ProgressIndicatorComponent,
    NavbarComponent,
    IosModalComponent,
  ],
  template: `
    <div class="book-service-container">
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Booking Preview Page -->
        <!-- registered applicants (page 1 of booking process)-->
        <div
          *ngIf="currentStep === 'preview'"
          class="booking-preview-container"
        >
          <div class="booking-preview-content-wrapper">
            <app-progress-indicator
              [currentStep]="getBookingStep()"
              [steps]="stepTitles"
            ></app-progress-indicator>
            <div class="booking-preview-card">
              <h2>Select Services Required</h2>
              <div class="card-wrapper">
                <div class="registered-applicants">
                  <h6>
                    Manage booking applicants and their required services ({{
                      bookingPersons.length
                    }})
                  </h6>
                  <!-- Applicants List -->
                  <div class="applicants-list">
                    <div
                      *ngIf="bookingPersons.length > 0"
                      class="applicants-grid"
                    >
                      <div
                        *ngFor="let person of bookingPersons; let i = index"
                        class="applicant-card"
                        [class.primary-applicant]="
                          person.type === 'Main Applicant'
                        "
                      >
                        <div class="applicant-header">
                          <div class="applicant-info">
                            <span class="applicant-name "
                              >{{ person.name }} ({{ person.type }})</span
                            >
                            <span class="applicant-type">{{
                              person.idNumber
                            }}</span>
                          </div>
                          <button
                            *ngIf="bookingPersons.length > 1"
                            type="button"
                            (click)="removeSpecificPerson(i)"
                            class="remove-applicant-btn"
                            title="Remove this applicant"
                          >
                            ×
                          </button>
                        </div>

                        <div class="applicant-services">
                          <div class="services-header">
                            <span class="services-label"
                              >Required Services:</span
                            >
                            <button
                              type="button"
                              (click)="editPersonServices(i)"
                              class="edit-services-btn"
                              title="Edit services for this applicant"
                            >
                              {{
                                person.selectedServices.length === 0
                                  ? 'Add Services'
                                  : 'Edit Services'
                              }}
                            </button>
                          </div>

                          <div class="person-services-preview">
                            <div
                              *ngIf="person.selectedServices.length === 0"
                              class="no-services"
                            >
                              <span>No services selected</span>
                            </div>
                            <div
                              *ngFor="let service of person.selectedServices"
                              class="service-badge"
                            >
                              <span>{{ service.name }}</span>
                              <button
                                type="button"
                                (click)="removeServiceFromPerson(i, service)"
                                class="remove-service-btn"
                                title="Remove this service"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="applicants-header">
                  <div class="header-info">
                    <p class="header-description">
                      Add additional applicants to this booking
                    </p>
                  </div>
                  <div class="header-actions">
                    <button
                      type="button"
                      (click)="addPersonToBooking()"
                      class="action-btn std"
                      title="Add an accompanying applicant to this booking"
                    >
                      <!-- <span class="btn-icon">👤+</span> -->
                      <span class="btn-text">Add Applicant</span>
                    </button>
                    <button
                      type="button"
                      (click)="removePersonFromBooking()"
                      class="action-btn std"
                      [disabled]="bookingPersons.length <= 1"
                      title="Remove an additional applicant from this booking"
                    >
                      <!-- <span class="btn-icon">👤-</span> -->
                      <span class="btn-text">Remove</span>
                    </button>
                    <button
                      type="button"
                      (click)="clearAllPersons()"
                      class="action-btn white"
                      [disabled]="bookingPersons.length <= 1"
                      title="Remove all additional applicants from this booking"
                    >
                      <!-- <span class="btn-icon">🗑️</span> -->
                      <span class="btn-text">Clear All</span>
                    </button>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <button
                    type="button"
                    (click)="goBack()"
                    class="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    (click)="proceedToLocation()"
                    [disabled]="!hasAnyServicesSelected()"
                    class="btn-primary"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Applicant Modal -->
        <app-ios-modal
          [isOpen]="showAddApplicantModal"
          title="Add New Applicant"
          [closeOnOverlayClick]="true"
          [closeOnEscape]="true"
          cancelText="Cancel"
          confirmText="Add"
          [confirmDisabled]="addApplicantForm.invalid"
          (modalClosed)="closeAddApplicantModal()"
          (cancelClicked)="closeAddApplicantModal()"
          (confirmClicked)="saveNewApplicant()"
        >
          <form [formGroup]="addApplicantForm" (ngSubmit)="saveNewApplicant()">
            <!-- relationship to the main applicant -->
            <div class="form-group">
              <label>Applicant Type *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    formControlName="applicantType"
                    value="Child"
                    name="applicantType"
                  />
                  <span class="radio-label">Child</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    formControlName="applicantType"
                    value="Friend"
                    name="applicantType"
                  />
                  <span class="radio-label">Friend</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    formControlName="applicantType"
                    value="Family Member"
                    name="applicantType"
                  />
                  <span class="radio-label">Family Member</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    formControlName="applicantType"
                    value="Other"
                    name="applicantType"
                  />
                  <span class="radio-label">Other</span>
                </label>
              </div>
            </div>

            <!-- validation method -->
            <div class="form-group">
              <label>Validation Method *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    formControlName="validationType"
                    value="id"
                    name="validationType"
                    (change)="onValidationTypeChange('id')"
                  />
                  <span class="radio-label">ID Number</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    formControlName="validationType"
                    value="passport"
                    name="validationType"
                    (change)="onValidationTypeChange('passport')"
                  />
                  <span class="radio-label">Passport Number</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    formControlName="validationType"
                    value="names"
                    name="validationType"
                    (change)="onValidationTypeChange('names')"
                  />
                  <span class="radio-label">Full Names</span>
                </label>
              </div>
            </div>

            <!-- ID Number Field -->
            <div
              class="form-group floating-label-group"
              *ngIf="isValidationTypeSelected('id')"
            >
              <input
                type="text"
                id="idNumber"
                formControlName="idNumber"
                class="floating-input"
                maxlength="13"
                autocomplete="username"
                [class.has-value]="addApplicantForm.get('idNumber')?.value"
              />
              <label for="idNumber" class="floating-label">ID Number *</label>
              <div
                *ngIf="
                  addApplicantForm.get('idNumber')?.invalid &&
                  addApplicantForm.get('idNumber')?.touched
                "
                class="error-message"
              >
                <div
                  *ngIf="addApplicantForm.get('idNumber')?.errors?.['required']"
                >
                  ID number is required
                </div>
                <div
                  *ngIf="addApplicantForm.get('idNumber')?.errors?.['pattern']"
                >
                  ID number must be exactly 13 digits
                </div>
              </div>
            </div>

            <!-- Passport Number Field -->
            <div
              class="form-group floating-label-group"
              *ngIf="isValidationTypeSelected('passport')"
            >
              <input
                type="text"
                id="passportNumber"
                formControlName="passportNumber"
                class="floating-input"
                maxlength="12"
                autocomplete="off"
                [class.has-value]="
                  addApplicantForm.get('passportNumber')?.value
                "
              />
              <label for="passportNumber" class="floating-label"
                >Passport Number *</label
              >
              <div
                *ngIf="
                  addApplicantForm.get('passportNumber')?.invalid &&
                  addApplicantForm.get('passportNumber')?.touched
                "
                class="error-message"
              >
                <div
                  *ngIf="addApplicantForm.get('passportNumber')?.errors?.['required']"
                >
                  Passport number is required
                </div>
                <div
                  *ngIf="addApplicantForm.get('passportNumber')?.errors?.['pattern']"
                >
                  Please enter a valid passport number
                </div>
              </div>
            </div>

            <!-- Forenames and Last Name Fields -->
            <div *ngIf="isValidationTypeSelected('names')">
              <div class="form-group floating-label-group">
                <input
                  type="text"
                  id="forenames"
                  formControlName="forenames"
                  class="floating-input"
                  autocomplete="given-name"
                  [class.has-value]="addApplicantForm.get('forenames')?.value"
                />
                <label for="forenames" class="floating-label"
                  >Forenames *</label
                >
                <div
                  *ngIf="
                    addApplicantForm.get('forenames')?.invalid &&
                    addApplicantForm.get('forenames')?.touched
                  "
                  class="error-message"
                >
                  <div
                    *ngIf="addApplicantForm.get('forenames')?.errors?.['required']"
                  >
                    Forenames are required
                  </div>
                  <div
                    *ngIf="addApplicantForm.get('forenames')?.errors?.['minlength']"
                  >
                    Forenames must be at least 2 characters
                  </div>
                </div>
              </div>

              <div class="form-group floating-label-group">
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  class="floating-input"
                  autocomplete="family-name"
                  [class.has-value]="addApplicantForm.get('lastName')?.value"
                />
                <label for="lastName" class="floating-label">Last Name *</label>
                <div
                  *ngIf="
                    addApplicantForm.get('lastName')?.invalid &&
                    addApplicantForm.get('lastName')?.touched
                  "
                  class="error-message"
                >
                  <div
                    *ngIf="addApplicantForm.get('lastName')?.errors?.['required']"
                  >
                    Last name is required
                  </div>
                  <div
                    *ngIf="addApplicantForm.get('lastName')?.errors?.['minlength']"
                  >
                    Last name must be at least 2 characters
                  </div>
                </div>
              </div>
            </div>
          </form>
        </app-ios-modal>

        <!-- Person Service Selection Modal -->
        <div
          *ngIf="showPersonServiceModal"
          class="modal-overlay"
          (click)="closePersonServiceModal()"
        >
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>
                Select Services for
                {{ bookingPersons[currentPersonIndex].name.split(' ')[0] }}
              </h3>
              <button
                type="button"
                (click)="closePersonServiceModal()"
                class="modal-close"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <p class="modal-description">
                Choose the services required for this applicant:
              </p>
              <div class="services-list">
                <div
                  *ngFor="let service of tempPersonServices"
                  class="service-item"
                  (click)="togglePersonService(service.id)"
                >
                  <label class="service-checkbox">
                    <input
                      type="checkbox"
                      [checked]="service.checked"
                      (change)="togglePersonService(service.id)"
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
                (click)="closePersonServiceModal()"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="savePersonServices()"
                class="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <!-- Show Form or Results based on state -->
        <app-appointment-form
          *ngIf="currentStep === 'form'"
          [stepTitles]="stepTitles"
          [selectedServices]="selectedServices"
          [bookingPersons]="bookingPersons"
          [searchCriteria]="searchCriteria"
          (formSubmitted)="onFormSubmitted($event)"
          (goBackRequested)="onAppointmentFormBackRequested()"
        ></app-appointment-form>

        <app-appointment-results
          *ngIf="currentStep === 'results'"
          [stepTitles]="stepTitles"
          [searchCriteria]="searchCriteria"
          (editSearchRequested)="onEditSearchRequested()"
          (slotSelected)="onSlotSelected($event)"
        ></app-appointment-results>

        <!-- Confirm Booking Step -->
        <div
          *ngIf="currentStep === 'confirm'"
          class="confirm-booking-container"
        >
          <div class="content-wrapper">
            <app-progress-indicator
              [currentStep]="3"
              [steps]="stepTitles"
            ></app-progress-indicator>
            <div class="confirm-booking-card">
              <h2>Confirm Your Booking</h2>
              <p class="confirm-description">
                Please review all details before confirming your appointment
                booking.
              </p>

              <!-- Personal Information -->
              <div class="booking-section">
                <h3>👤 Personal Information</h3>
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

              <!-- Booking Details -->
              <div class="booking-section">
                <h3>📋 Booking Details</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Branch:</span>
                    <span class="info-value">{{ getBranchDisplayName() }}</span>
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

              <!-- Selected Services -->
              <div class="booking-section">
                <h3>🔧 Selected Services</h3>
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

              <!-- Action Buttons -->
              <div class="confirm-actions">
                <button
                  type="button"
                  (click)="goBackToResults()"
                  class="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  (click)="confirmBooking()"
                  class="btn-primary"
                >
                  Confirm
                </button>
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
        --DHAHoverGreen: rgb(1, 73, 38);
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

      .book-service-container {
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding-top: 73px;
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
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

      .main-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        height: 100vh;
        width: 100vw;
      }

      /* Booking Preview Styles */
      .booking-preview-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 73px);
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
      }

      .booking-preview-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--step-form-gap);
        width: var(--form-width);
      }

      .booking-preview-card {
        background: var(--DHAWhite);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 30px;
        width: 100%;
        max-height: calc(100vh - 150px);
        /* width: fit-content; */
        /* min-width: 400px; */
        box-sizing: border-box;
        overflow-y: auto;
      }

      .booking-preview-card h2 {
        color: var(--DHAGreen);
        font-size: 24px;
        margin: 16px 0;
        text-align: center;
      }

      .preview-description {
        color: var(--DHATextGray);
        text-align: center;
        margin-bottom: 20px;
        font-size: 14px;
      }

      .user-details-section,
      .services-section {
        margin-bottom: 20px;
      }

      .user-details-section h3,
      .services-section h3 {
        color: var(--DHATextGrayDark);
        font-size: 12px;
        margin-bottom: 10px;
        border-bottom: 1px solid var(--DHAGreen);
        padding-bottom: 6px;
      }

      .details-grid {
        display: grid;
        gap: 8px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .detail-item:last-child {
        border-bottom: none;
      }

      .detail-item label {
        font-weight: 600;
        color: var(--DHATextGrayDark);
        font-size: 12px;
      }

      .detail-value {
        color: var(--DHAGreen);
        font-weight: 500;
        font-size: 10px;
        text-align: right;
        word-break: break-all;
      }

      .services-preview {
        background: var(--DHAOffWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        padding: 15px;
      }

      .no-services {
        text-align: center;
        color: var(--DHATextGray);
        margin-bottom: 10px;
        font-size: 13px;
      }

      .services-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        /* margin-bottom: 15px; */
      }

      .service-badge {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 2px 8px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
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
        background: none;
        color: var(--DHAOrange);
        border: none;
        padding: 8px 16px;
        border-radius: 0;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        width: auto;
        display: block;
        margin: 0 auto;
        text-decoration: underline;
        text-underline-offset: 4px;
        padding-bottom: 0;
      }

      .btn-add-service:hover {
        color: var(--DHALightOrange);
        text-decoration-thickness: 2px;
      }

      /* Integrated Applicants List Styles */
      .applicants-list {
        border-radius: 12px;
      }

      .applicants-header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .header-info {
        flex: 1;
        min-width: 0;
      }

      .header-info h4,
      h4,
      h6 {
        color: var(--DHATextGrayDark);
        font-size: 18px;
        margin-bottom: 8px;
        font-weight: 600;
        line-height: 1.3;
        margin-top: 0;
      }

      h6 {
        font-size: 16px;
        color: var(--DHATextGray);
        font-weight: normal;
        margin-bottom: 30px;
        margin-top: 10px;
      }

      .header-description {
        color: var(--DHATextGrayDark);
        font-size: 13px;
        margin: 0;
        line-height: 1.5;
        max-width: 400px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 12px;
        width: 100%;
      }

      .action-btn {
        background: var(--DHAOffWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        color: var(--DHATextGrayDark);
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        height: 44px;
        white-space: nowrap;
        justify-content: center;
        flex: 1;
      }
      .action-btn.std {
        background: var(--DHAWhite);
        color: var(--DHATextGrayDark);
        border-color: var(--DHABackGroundLightGray);
      }
      .action-btn.std:hover:not(:disabled) {
        background: var(--DHABackGroundLightGray);
        color: var(--DHATextGrayDark);
        border-color: var(--DHABackGroundLightGray);
      }

      .action-btn.primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border-color: var(--DHAGreen);
      }

      .action-btn.primary:hover:not(:disabled) {
        background: var(--DHAHoverGreen);
        border-color: var(--DHAHoverGreen);
      }

      .action-btn.secondary:hover:not(:disabled) {
        background: var(--DHABackGroundLightGray);
        border-color: var(--DHAGreen);
        color: var(--DHAGreen);
      }

      .action-btn.danger {
        color: var(--DHARed);
        border-color: var(--DHARed);
      }

      .action-btn.danger:hover:not(:disabled) {
        background: var(--DHARed);
        color: var(--DHAWhite);
      }

      .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-icon {
        font-size: 14px;
        white-space: nowrap;
      }

      .btn-text {
        font-size: 12px;
        font-weight: 500;
        white-space: normal;
      }

      .book-service-container .main-content .confirm-booking-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: calc(100vh - 73px);
        padding: 20px;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        width: 100vw;
        box-sizing: border-box;
      }

      .book-service-container .confirm-booking-card {
        background: var(--DHAWhite);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        border: 1px solid var(--DHABackGroundLightGray);
        max-height: calc(100vh - 150px);
        overflow-y: auto;
        box-sizing: border-box;
        margin: 0 auto;
      }

      .book-service-container .confirm-booking-card h2 {
        color: var(--DHAGreen);
        margin-bottom: 4px;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
      }

      .book-service-container .confirm-description {
        color: var(--DHATextGrayDark);
        text-align: center;
        margin-bottom: 16px;
        font-size: 12px;
        line-height: 1.3;
      }

      .book-service-container .booking-section {
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
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
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

      .confirm-actions {
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
        border-radius: 10px;
        padding: 15px 30px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
      }

      .btn-secondary:hover {
        background: var(--DHATextGrayDark);
        transform: translateY(-2px);
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border: none;
        border-radius: 8px;
        padding: 15px 30px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
        min-width: 150px;
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

      .confirm-actions {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-top: 40px;
        padding-top: 30px;
        border-top: 2px solid var(--DHABackGroundLightGray);
      }

      /* Responsive styles for applicants header */
      @media (max-width: 768px) {
        .applicants-header {
          align-items: stretch;
          gap: 8px;
          padding-bottom: 15px;
        }

        .header-info h4 {
          font-size: 16px;
        }

        .header-description {
          font-size: 14px;
          max-width: none;
        }

        .header-actions {
          justify-content: stretch;
          gap: 10px;
        }

        .applicant-card {
          padding: 8px;
        }

        .applicant-services {
          padding-top: 8px;
        }

        .services-header {
          margin-bottom: 6px;
        }

        .action-btn {
          min-width: 0;
          height: 44px;
        }

        .logo-icon {
          height: 32px;
        }

        .btn-home-top {
          padding: 15px 12px;
          font-size: 12px;
        }
      }

      @media (max-width: 480px) {
        .header-actions {
        }

        .action-btn {
          width: 100%;
        }
      }

      .applicants-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .applicant-card {
        background: var(--DHAWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 10px;
        padding: 8px;
        transition: all 0.3s ease;
      }

      .applicant-card:hover {
        border-color: var(--DHAGreen);
        box-shadow: 0 2px 8px rgba(1, 102, 53, 0.1);
      }

      .applicant-card.primary-applicant {
        box-shadow: 0 2px 8p xrgba(248, 170, 24, 0.36);
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          var(--DHAWhite) 100%
        );
      }

      .card-wrapper {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .registered-applicants {
        border-bottom: 1px solid var(--DHABackGroundLightGray);
        padding-bottom: 20px;
      }

      .applicant-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .applicant-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .applicant-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--DHATextGrayDark);
      }

      .applicant-type {
        font-size: 11px;
        color: var(--DHATextGray);
        font-style: italic;
        text-transform: capitalize;
      }

      .remove-applicant-btn {
        background: var(--DHARed);
        color: var(--DHAWhite);
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .remove-applicant-btn:hover {
        background: var(--DHAMaroon);
        transform: scale(1.1);
      }

      .applicant-services {
        border-top: 1px solid var(--DHABackGroundLightGray);
        padding-top: 12px;
      }

      .services-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .services-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--DHATextGrayDark);
      }

      .edit-services-btn {
        background: none;
        color: var(--DHAOrange);
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .edit-services-btn:hover {
        color: var(--DHALightOrange);
        background: rgba(243, 128, 31, 0.1);
      }

      .person-services-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .person-services-preview .service-badge {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 4px 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
      }

      .person-services-preview .remove-service-btn {
        background: rgba(255, 255, 255, 0.2);
        color: var(--DHAWhite);
        border: none;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        font-size: 10px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .person-services-preview .remove-service-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .person-services-preview .no-services {
        color: var(--DHATextGray);
        font-size: 11px;
        font-style: italic;
      }

      /* Form Styles for iOS Modal */
      .radio-group {
        display: flex;
        gap: 12px;
        margin-top: 8px;
        flex-wrap: wrap;
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        transition: all 0.3s ease;
        border: 1px solid transparent;
      }

      .radio-option:hover {
        background: var(--DHABackGroundLightGray);
        border-color: var(--DHAGreen);
      }

      .radio-option input[type='radio'] {
        margin: 0;
        width: 16px;
        height: 16px;
        accent-color: var(--DHAGreen);
      }

      .radio-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--DHATextGrayDark);
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label:not(.floating-label) {
        display: block;
        font-weight: 600;
        color: var(--DHATextGrayDark);
        font-size: 14px;
        margin-bottom: 8px;
      }

      /* Floating Label Styles */
      .floating-label-group {
        position: relative;
        margin-top: 10px;
        margin-bottom: 20px;
      }

      .floating-input {
        width: 100%;
        padding: 16px 12px;
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.3s ease;
        box-sizing: border-box;
        background: var(--DHAWhite);
      }

      .floating-input:focus,
      .floating-input.has-value {
        padding: 16px 12px;
      }

      .floating-input:focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-shadow: 0 0 0 3px rgba(1, 102, 53, 0.1);
      }

      .floating-label {
        position: absolute;
        top: 16px;
        left: 12px;
        font-weight: 600;
        color: var(--DHATextGray);
        font-size: 14px;
        pointer-events: none;
        transition: all 0.3s ease;
        background: var(--DHAWhite);
        padding: 0 4px;
        z-index: 1;
      }

      .floating-input:focus + .floating-label,
      .floating-input.has-value + .floating-label {
        top: -8px;
        left: 8px;
        font-size: 12px;
        color: var(--DHAGreen);
        font-weight: 600;
      }

      .error-message {
        color: var(--DHARed);
        font-size: 12px;
        margin-top: 4px;
        font-weight: 500;
      }

      .action-buttons {
        display: flex;
        gap: 15px;
      }

      .btn-primary,
      .btn-secondary {
        flex: 1;
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 0;
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
        max-height: calc(var(--vh, 1vh) * 80);
        display: flex;
        flex-direction: column;
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
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }

      .modal-description {
        color: var(--DHATextGray);
        margin-bottom: 20px;
        font-size: 14px;
      }

      .modal-body .services-list {
        display: grid;
        gap: 15px;
      }

      .modal-body .service-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 15px;
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        transition: all 0.2s;
        background: var(--DHAWhite);
        cursor: pointer;
      }

      .modal-body .service-item:hover {
        border-color: var(--DHAGreen);
        background: var(--DHAOffWhite);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(1, 102, 53, 0.1);
      }

      .modal-body .service-checkbox {
        position: relative;
        margin-top: 2px;
      }

      .modal-body .service-checkbox input {
        opacity: 0;
        position: absolute;
      }

      .modal-body .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid var(--DHATextGray);
        border-radius: 4px;
        display: block;
        position: relative;
        transition: all 0.2s;
      }

      .modal-body .service-checkbox input:checked + .checkmark {
        background: var(--DHAGreen);
        border-color: var(--DHAGreen);
      }

      .modal-body .service-checkbox input:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--DHAWhite);
        font-size: 12px;
        font-weight: bold;
      }

      .modal-body .service-details {
        flex: 1;
      }

      .modal-body .service-details .service-name {
        font-weight: 600;
        color: var(--DHAGreen);
        margin-bottom: 4px;
        font-size: 16px;
      }

      .modal-body .service-details .service-description {
        color: var(--DHATextGrayDark);
        font-size: 14px;
        line-height: 1.4;
      }

      .modal-footer {
        display: flex;
        gap: 15px;
        padding: 20px;
        border-top: 1px solid var(--DHABackGroundLightGray);
        flex-shrink: 0;
      }

      .modal-footer .btn-secondary,
      .modal-footer .btn-primary {
        flex: 1;
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 150px;
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

      .modal-footer .btn-primary:hover:not(:disabled) {
        background: var(--DHAWhite);
        transform: translateY(-2px);
        color: var(--DHAGreen);
        border: 1px solid var(--DHAGreen);
      }

      .modal-footer .btn-primary:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .main-content {
          padding: 0;
        }
        .booking-preview-container {
          box-sizing: border-box;
        }

        .booking-preview-card {
          padding: 20px;
          min-width: unset;
          max-width: 600px;
          width: 100%;
          max-height: calc(100vh - 150px);
          overflow-y: auto;
          box-sizing: border-box;
        }

        .booking-preview-card h2 {
          font-size: 20px;
        }

        .action-buttons {
          gap: 10px;
        }
        .modal-overlay {
          padding: 10px;
        }
        .modal-content {
          max-height: calc(var(--vh, 1vh) * 80);
          max-width: 90vw;
        }

        .modal-footer {
          gap: 10px;
        }

        .book-service-container .confirm-booking-card {
          background: var(--DHAWhite);
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid var(--DHABackGroundLightGray);
          max-width: 500px;
          width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
        }

        .book-service-container .confirm-booking-card h2 {
          color: var(--DHAGreen);
          margin-bottom: 4px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
        }

        .book-service-container .confirm-description {
          color: var(--DHATextGrayDark);
          text-align: center;
          margin-bottom: 16px;
          font-size: 12px;
          line-height: 1.3;
        }

        .book-service-container .booking-section {
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
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
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

        .confirm-actions {
          /* display: flex;
          // justify-content: space-between;
          // flex-direction: column;*/
          gap: 8px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--DHABackGroundLightGray);
        }

        .btn-secondary {
          background: var(--DHATextGray);
          color: var(--DHAWhite);
          border: none;
          border-radius: 10px;
          padding: 15px 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .btn-secondary:hover {
          background: var(--DHATextGrayDark);
          transform: translateY(-2px);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--DHAGreen) 0%, #018a3a 100%);
          color: var(--DHAWhite);
          border: none;
          border-radius: 10px;
          padding: 15px 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--DHAWhite);
          color: var(--DHAGreen);
          border: 1px solid var(--DHAGreen);
          transform: translateY(-2px);
          /*box-shadow: 2px 4px rgba(1, 102, 53, 0.4);*/
        }

        .btn-primary:disabled {
          background: var(--DHADisabledButtonGray);
          color: var(--DHADisabledTextGray);
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .booking-preview-content-wrapper {
            padding: 0 8px;
            max-width: 100%;
            box-sizing: border-box;
          }
          .book-service-container .main-content .confirm-booking-container {
            padding: 16px 12px;
            max-height: calc(100vh - 150px);
          }

          .confirm-booking-card {
            padding: 20px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .applicant-header {
            margin-bottom: 8px;
          }

          .applicant-services {
            padding-top: 8px;
          }

          .services-header[_ngcontent-ng-c3851277952] {
            margin-bottom: 6px;
          }

          .radio-group {
            flex-direction: column;
            gap: 5px;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            min-width: 0;
            padding: 15px 8px;
          }

          .modal-footer .btn-primary,
          .modal-footer .btn-secondary {
            min-width: 0;
          }

          .btn-text {
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .book-service-container .main-content .confirm-booking-container {
            padding: 8px 6px;
          }
        }
      }
    `,
  ],
})
export class BookServiceComponent implements OnInit {
  currentStep: 'preview' | 'form' | 'results' | 'confirm' = 'preview';
  stepTitles: string[] = ['Services', 'Details', 'Timeslots', 'Confirm'];
  showServiceModal = false;
  searchCriteria: SlotSearchCriteria | null = null;
  selectedSlot: any = null;
  personalData: any = null;
  selectedServices: Service[] = [];
  bookingPersons: BookingPerson[] = [];
  showPersonServiceModal = false;
  currentPersonIndex = -1;
  tempPersonServices: Service[] = [];
  showAddApplicantModal = false;
  addApplicantForm: FormGroup;
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

  constructor(private router: Router, private fb: FormBuilder) {
    this.addApplicantForm = this.fb.group({
      applicantType: ['', Validators.required],
      validationType: ['', Validators.required],
      idNumber: [''],
      passportNumber: [''],
      forenames: [''],
      lastName: [''],
    });
  }

  capitaliseWords(str: string) {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    // Load personal data from session storage
    const personalDataStr = sessionStorage.getItem('personalData');
    if (personalDataStr) {
      this.personalData = JSON.parse(personalDataStr);

      // Initialize booking persons with the current user
      this.bookingPersons = [
        {
          id: 'self',
          name: `${this.capitaliseWords(
            this.personalData.forenames
          )} ${this.capitaliseWords(this.personalData.lastName)}`,
          type: 'Main Applicant',
          idNumber: this.personalData.idNumber,
          selectedServices: [...this.selectedServices], // Copy current services
        },
      ];
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
    // Collect all services from all persons
    this.selectedServices = [];
    this.bookingPersons.forEach((person) => {
      person.selectedServices.forEach((service) => {
        // Avoid duplicates
        if (!this.selectedServices.some((s) => s.id === service.id)) {
          this.selectedServices.push(service);
        }
      });
    });

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

  onAppointmentFormBackRequested(): void {
    this.currentStep = 'preview';
  }

  onSlotSelected(slot: any): void {
    this.selectedSlot = slot;
    this.currentStep = 'confirm';
    window.scrollTo(0, 0);
  }

  goBackToResults(): void {
    this.currentStep = 'results';
    window.scrollTo(0, 0);
  }

  confirmBooking(): void {
    // Clear any existing appointments for this user (one appointment at a time)
    this.clearExistingAppointments();

    // Here you would typically send the booking data to your backend
    const bookingData = {
      id: this.personalData.idNumber, // Use ID number as unique identifier
      personalData: this.personalData,
      selectedSlot: this.selectedSlot,
      bookingPersons: this.bookingPersons,
      searchCriteria: this.searchCriteria,
      confirmedAt: new Date().toISOString(),
    };

    // Save the confirmed appointment to session storage
    // User can only have one appointment at a time, so we overwrite any existing appointment
    sessionStorage.setItem('confirmedAppointment', JSON.stringify(bookingData));

    // Also save with ID number as key for easy retrieval
    sessionStorage.setItem(
      `appointment_${this.personalData.idNumber}`,
      JSON.stringify(bookingData)
    );

    // For now, show a success message
    alert(
      `Booking confirmed successfully! Your appointment is scheduled for ${this.getFormattedDate(
        this.selectedSlot.date
      )} at ${this.selectedSlot.time}`
    );

    // Navigate back to menu or home
    this.router.navigate(['/menu']);
  }

  private clearExistingAppointments(): void {
    // Clear any existing appointment data
    sessionStorage.removeItem('confirmedAppointment');

    // Clear appointment by ID if it exists
    if (this.personalData?.idNumber) {
      sessionStorage.removeItem(`appointment_${this.personalData.idNumber}`);
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
    if (!this.searchCriteria?.branch) return 'N/A';

    // This would typically come from your branch data
    // For now, return a formatted version of the branch ID
    const branchId = this.searchCriteria.branch;
    if (branchId === 'ct-tygervalley-main') {
      return 'Tygervalley Main Branch';
    }
    return branchId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  goBack() {
    this.router.navigate(['/menu']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  getBookingStep(): number {
    // Map booking flow steps to booking step indicator
    // Step 1: Add Service(s) - when on preview page
    // Step 2: Appointment Details - when on form page
    if (this.currentStep === 'preview') {
      return 0; // Add Service(s)
    } else if (this.currentStep === 'form') {
      return 1; // Appointment Details
    }
    return 0; // Default to Add Service(s)
  }

  // Booking Person Management Methods
  addPersonToBooking(): void {
    this.addApplicantForm.reset();
    this.showAddApplicantModal = true;
  }

  removePersonFromBooking(): void {
    if (this.bookingPersons.length <= 1) return;

    const personNames = this.bookingPersons
      .map((p, i) => `${i + 1}. ${p.name} (${p.type})`)
      .join('\n');
    const selection = prompt(
      `Select person to remove:\n${personNames}\n\nEnter number (1-${this.bookingPersons.length}):`
    );
    const index = parseInt(selection || '0') - 1;

    if (index >= 0 && index < this.bookingPersons.length) {
      this.bookingPersons.splice(index, 1);
    }
  }

  removeSpecificPerson(index: number): void {
    if (
      this.bookingPersons.length > 1 &&
      index >= 0 &&
      index < this.bookingPersons.length
    ) {
      this.bookingPersons.splice(index, 1);
    }
  }

  clearAllPersons(): void {
    if (this.bookingPersons.length <= 1) return;

    if (
      confirm(
        'Are you sure you want to remove all additional applicants from this booking?'
      )
    ) {
      // Keep only the primary applicant (Self)
      this.bookingPersons = this.bookingPersons.filter(
        (person) => person.type === 'Main Applicant'
      );
    }
  }

  // Person Service Management Methods
  editPersonServices(personIndex: number): void {
    const person = this.bookingPersons[personIndex];
    if (!person) return;

    // Create a copy of available services with current selections
    const availableServices = this.availableServices.map((service) => ({
      ...service,
      checked: person.selectedServices.some(
        (selected) => selected.id === service.id
      ),
    }));

    // Show service selection modal for this person
    this.showPersonServiceModal = true;
    this.currentPersonIndex = personIndex;
    this.tempPersonServices = [...availableServices];
  }

  savePersonServices(): void {
    if (
      this.currentPersonIndex >= 0 &&
      this.currentPersonIndex < this.bookingPersons.length
    ) {
      const selectedServices = this.tempPersonServices.filter(
        (service) => service.checked
      );
      this.bookingPersons[this.currentPersonIndex].selectedServices =
        selectedServices;
    }
    this.closePersonServiceModal();
  }

  closePersonServiceModal(): void {
    this.showPersonServiceModal = false;
    this.currentPersonIndex = -1;
    this.tempPersonServices = [];
  }

  togglePersonService(serviceId: string): void {
    const service = this.tempPersonServices.find((s) => s.id === serviceId);
    if (service) {
      service.checked = !service.checked;
    }
  }

  removeServiceFromPerson(personIndex: number, service: Service): void {
    if (personIndex >= 0 && personIndex < this.bookingPersons.length) {
      const person = this.bookingPersons[personIndex];
      person.selectedServices = person.selectedServices.filter(
        (s) => s.id !== service.id
      );
    }
  }

  // Validation method for Continue button
  hasAnyServicesSelected(): boolean {
    // Ensure all applicants have at least one service selected
    return (
      this.bookingPersons.length > 0 &&
      this.bookingPersons.every((person) => person.selectedServices.length > 0)
    );
  }

  // Add Applicant Modal Methods
  closeAddApplicantModal(): void {
    this.showAddApplicantModal = false;
    this.addApplicantForm.reset();
  }

  onValidationTypeChange(type: string): void {
    // Clear all validation fields
    this.addApplicantForm.get('idNumber')?.setValue('');
    this.addApplicantForm.get('passportNumber')?.setValue('');
    this.addApplicantForm.get('forenames')?.setValue('');
    this.addApplicantForm.get('lastName')?.setValue('');

    // Clear all validators first
    this.addApplicantForm.get('idNumber')?.clearValidators();
    this.addApplicantForm.get('passportNumber')?.clearValidators();
    this.addApplicantForm.get('forenames')?.clearValidators();
    this.addApplicantForm.get('lastName')?.clearValidators();

    // Set validators based on type
    if (type === 'id') {
      this.addApplicantForm
        .get('idNumber')
        ?.setValidators([Validators.required, Validators.pattern(/^\d{13}$/)]);
    } else if (type === 'passport') {
      this.addApplicantForm
        .get('passportNumber')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^[A-Z0-9]{6,12}$/),
        ]);
    } else if (type === 'names') {
      this.addApplicantForm
        .get('forenames')
        ?.setValidators([Validators.required, Validators.minLength(2)]);
      this.addApplicantForm
        .get('lastName')
        ?.setValidators([Validators.required, Validators.minLength(2)]);
    }

    // Update validity for all fields
    this.addApplicantForm.get('idNumber')?.updateValueAndValidity();
    this.addApplicantForm.get('passportNumber')?.updateValueAndValidity();
    this.addApplicantForm.get('forenames')?.updateValueAndValidity();
    this.addApplicantForm.get('lastName')?.updateValueAndValidity();
  }

  isValidationTypeSelected(type: string): boolean {
    const validationType = this.addApplicantForm.get('validationType')?.value;
    return validationType === type;
  }

  saveNewApplicant(): void {
    if (this.addApplicantForm.valid) {
      const formValue = this.addApplicantForm.value;

      // Determine the name and ID number based on validation type
      let personName: string;
      let idNumber: string | undefined;

      if (formValue.validationType === 'id') {
        personName = formValue.idNumber; // Use ID number as name for display
        idNumber = formValue.idNumber;
      } else if (formValue.validationType === 'passport') {
        personName = formValue.passportNumber; // Use passport number as name for display
        idNumber = undefined;
      } else if (formValue.validationType === 'names') {
        personName = `${formValue.forenames} ${formValue.lastName}`.trim();
        idNumber = undefined;
      } else {
        personName = 'Unknown';
        idNumber = undefined;
      }

      const newPerson: BookingPerson = {
        id: Date.now().toString(),
        name: this.capitaliseWords(personName),
        type: formValue.applicantType,
        idNumber: idNumber,
        selectedServices: [],
      };

      this.bookingPersons.push(newPerson);
      this.closeAddApplicantModal();
    }
  }
}
