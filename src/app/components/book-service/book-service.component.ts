import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { IosModalComponent } from '../shared/ios-modal/ios-modal.component';
import { ConfirmBookingComponent } from '../confirm-booking/confirm-booking.component';
import { BookingPreviewComponent } from '../booking-preview/booking-preview.component';
import { ModalCleanupService } from '../../services/modal-cleanup.service';

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
  price?: number;
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
    NavbarComponent,
    IosModalComponent,
    ConfirmBookingComponent,
    BookingPreviewComponent,
  ],
  template: `
    <div class="book-service-container">
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Booking Preview Page -->
        <app-booking-preview
          *ngIf="currentStep === 'preview'"
          [stepTitles]="stepTitles"
          [bookingPersons]="bookingPersons"
          (goBack)="goBack()"
          (proceedToLocation)="proceedToLocation()"
          (addPersonToBooking)="addPersonToBooking()"
          (removePersonFromBooking)="removePersonFromBooking()"
          (clearAllPersons)="clearAllPersons()"
          (removeSpecificPerson)="removeSpecificPerson($event)"
          (editPersonServices)="editPersonServices($event)"
          (removeServiceFromPerson)="
            removeServiceFromPerson($event.personIndex, $event.service)
          "
        ></app-booking-preview>

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

        <!-- additional applicant Service Selection Modal -->
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
          (alternativeBranchSelected)="onAlternativeBranchSelected($event)"
        ></app-appointment-results>

        <!-- Confirm Booking Step -->
        <app-confirm-booking
          *ngIf="currentStep === 'confirm'"
          [stepTitles]="stepTitles"
          [personalData]="personalData"
          [bookingPersons]="bookingPersons"
          [selectedSlot]="selectedSlot"
          [branchDisplayName]="getBranchDisplayName()"
          (backToResults)="goBackToResults()"
          (confirmBooking)="confirmBooking()"
        ></app-confirm-booking>

        <!-- Booking Success Modal -->
        <div
          *ngIf="showBookingSuccessModal"
          class="modal-overlay"
          (click)="closeBookingSuccessModal()"
        >
          <div
            class="modal-content booking-success-modal"
            (click)="$event.stopPropagation()"
          >
            <div class="modal-header">
              <!-- <div class="success-icon">✅</div> -->
              <h3>Booking Confirmed Successfully!</h3>
              <button
                type="button"
                (click)="closeBookingSuccessModal()"
                class="modal-close"
              >
                ×
              </button>
            </div>

            <div class="modal-body confirmed">
              <!-- Booking Reference -->
              <div class="booking-reference-section">
                <div class="reference-label">Your Booking Reference</div>
                <div class="reference-number-container">
                  <div class="reference-number">{{ bookingReference }}</div>
                  <button
                    [class]="'copy-button' + (isCopied ? ' copied' : '')"
                    (click)="copyBookingReference()"
                    title="Copy booking reference"
                    aria-label="Copy booking reference to clipboard"
                  >
                    <i [class]="copyButtonIcon"></i>
                    {{ copyButtonText }}
                  </button>
                </div>
                <div class="reference-note">
                  Please save this reference number for your records
                </div>
              </div>

              <!-- Expandable Sections -->
              <div class="expandable-sections">
                <!-- Appointment Details -->
                <div class="expandable-section">
                  <div
                    class="section-header"
                    (click)="toggleSection('appointment')"
                  >
                    <span class="section-title">📅 Appointment Details</span>
                    <span
                      class="expand-icon"
                      [class.expanded]="expandedSections['appointment']"
                      >▼</span
                    >
                  </div>
                  <div
                    class="section-content"
                    [class.expanded]="expandedSections['appointment']"
                  >
                    <div class="details-grid">
                      <div class="detail-item">
                        <label>Branch</label>
                        <span>{{ getBranchDisplayName() }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Appointment Date</label>
                        <span>{{ getFormattedDate(selectedSlot?.date) }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Appointment Time</label>
                        <span>{{ selectedSlot?.time || 'N/A' }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Duration</label>
                        <span>1 Hour</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Personal Information -->
                <div class="expandable-section">
                  <div
                    class="section-header"
                    (click)="toggleSection('personal')"
                  >
                    <span class="section-title">👤 Personal Information</span>
                    <span
                      class="expand-icon"
                      [class.expanded]="expandedSections['personal']"
                      >▼</span
                    >
                  </div>
                  <div
                    class="section-content"
                    [class.expanded]="expandedSections['personal']"
                  >
                    <div class="details-grid">
                      <div class="detail-item">
                        <label>Full Name</label>
                        <span
                          >{{ personalData?.forenames }}
                          {{ personalData?.lastName }}</span
                        >
                      </div>
                      <div class="detail-item">
                        <label>ID Number</label>
                        <span>{{ personalData?.idNumber }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Email</label>
                        <span>{{ personalData?.email }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Phone</label>
                        <span>{{ personalData?.phone }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Applicants & Services -->
                <div class="expandable-section">
                  <div
                    class="section-header"
                    (click)="toggleSection('applicants')"
                  >
                    <span class="section-title"
                      >👥 Applicants & Services ({{
                        bookingPersons.length
                      }})</span
                    >
                    <span
                      class="expand-icon"
                      [class.expanded]="expandedSections['applicants']"
                      >▼</span
                    >
                  </div>
                  <div
                    class="section-content"
                    [class.expanded]="expandedSections['applicants']"
                  >
                    <div class="applicants-list">
                      <div
                        *ngFor="let person of bookingPersons; let i = index"
                        class="applicant-item"
                      >
                        <div class="applicant-header">
                          <span class="applicant-name"
                            >{{ person.name }} ({{ person.type }})</span
                          >
                          <span class="applicant-id">{{
                            person.idNumber
                          }}</span>
                        </div>
                        <div class="services-list">
                          <div
                            *ngFor="let service of person.selectedServices"
                            class="service-item"
                          >
                            <span class="service-name">{{ service.name }}</span>
                            <span class="service-price"
                              >R{{ service.price || 0 }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Booking Summary -->
                <div class="expandable-section">
                  <div
                    class="section-header"
                    (click)="toggleSection('summary')"
                  >
                    <span class="section-title">💰 Booking Summary</span>
                    <span
                      class="expand-icon"
                      [class.expanded]="expandedSections['summary']"
                      >▼</span
                    >
                  </div>
                  <div
                    class="section-content"
                    [class.expanded]="expandedSections['summary']"
                  >
                    <div class="summary-details">
                      <div class="summary-item">
                        <span class="summary-label">Total Services</span>
                        <span class="summary-value">{{
                          getTotalServices()
                        }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Total Amount</span>
                        <span class="summary-value"
                          >R{{ getTotalAmount() }}</span
                        >
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Booking Date</span>
                        <span class="summary-value">{{
                          getFormattedDate(getCurrentDate())
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                (click)="closeBookingSuccessModal()"
                class="btn-primary"
              >
                Done
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
        --DHAHoverGreen: rgb(1, 73, 38);
        --DHAOrange: #f3801f;
        --DHALightOrange: #f8ab18;
        --DHALightOrangeLight: rgba(243, 126, 31, 0.2);
        --DHAWhite: #ffffff;
        --DHAOffWhite: #fbfbfb;
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHAOffBlack: rgb(51, 51, 51);
        --DHADisabledTextGray: #c4c4c4;
      }

      .book-service-container {
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
        min-height: calc(100vh - 73px);
        width: 100vw;
        box-sizing: border-box;
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
        border: 1px solid var(--DHATextGray);
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

      .modal-body.confirmed {
        padding: 0;
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
          width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
          scroll-behavior: smooth;
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
            min-height: calc(100vh - 120px);
          }

          .confirm-booking-card {
            padding: 20px;
            height: 600px; /* Fixed height like appointment form */
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
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

      /* Enhanced Booking Success Modal Styles */
      .booking-success-modal {
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .modal-header {
        text-align: center;
        padding: 20px 20px 10px;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .success-icon {
        font-size: 3rem;
        margin-bottom: 10px;
      }

      .modal-header h3 {
        color: var(--DHAGreen);
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .booking-reference-section {
        color: white;
        padding: 20px;
        margin: 20px;
        border-radius: 12px;
        text-align: center;
        background-color: var(--DHAOffWhite);
      }

      .reference-label {
        font-size: 0.9rem;
        opacity: 0.9;
        margin-bottom: 8px;
        color: var(--DHAOffBlack);
      }

      .reference-number-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .reference-number {
        font-size: 1.8rem;
        font-weight: 700;
        font-family: 'Courier New', monospace;
        letter-spacing: 2px;
        color: var(--DHAOrange);
        margin: 0;
      }

      .copy-button {
        background: var(--DHAOffWhite);
        color: var(--DHAOffBlack);
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s ease;
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        height: 40px;
        font-weight: 500;
      }

      .copy-button.copied {
        background: var(--DHAGreen);
        color: white;
      }

      .copy-button:hover {
        background: var(--DHALightOrangeLight);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .copy-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .copy-button i {
        font-size: 1rem;
      }

      .reference-note {
        font-size: 0.8rem;
        opacity: 0.8;
        color: var(--DHATextGray);
      }

      .expandable-sections {
        padding: 0 20px 20px;
      }

      .expandable-section {
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        margin-bottom: 12px;
        overflow: hidden;
      }

      .section-header {
        background: var(--DHAOffWhite);
        padding: 15px 20px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.3s ease;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .section-header:hover {
        background: var(--DHABackGroundLightGray);
      }

      .section-title {
        font-weight: 600;
        color: var(--DHAGreen);
        font-size: 1rem;
      }

      .expand-icon {
        transition: transform 0.3s ease;
        color: var(--DHATextGray);
        font-size: 0.8rem;
      }

      .expand-icon.expanded {
        transform: rotate(180deg);
      }

      .section-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .section-content.expanded {
        max-height: 500px;
      }

      .details-grid {
        padding: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .detail-item label {
        font-size: 0.8rem;
        color: var(--DHATextGray);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-item span {
        font-size: 0.95rem;
        color: var(--DHATextGrayDark);
        font-weight: 500;
      }

      .applicants-list {
        padding: 20px;
      }

      .applicant-item {
        background: var(--DHAOffWhite);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 12px;
        border: 1px solid var(--DHABackGroundLightGray);
      }

      .applicant-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .applicant-name {
        font-weight: 600;
        color: var(--DHAGreen);
      }

      .applicant-id {
        font-size: 0.8rem;
        color: var(--DHATextGray);
        font-family: 'Courier New', monospace;
      }

      .services-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .service-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
      }

      .service-name {
        font-size: 0.9rem;
        color: var(--DHATextGrayDark);
      }

      .service-price {
        font-weight: 600;
        color: var(--DHAGreen);
        font-size: 0.9rem;
      }

      .summary-details {
        padding: 20px;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
      }

      .summary-item:last-child {
        border-bottom: none;
      }

      .summary-label {
        font-size: 0.9rem;
        color: var(--DHATextGray);
        font-weight: 500;
      }

      .summary-value {
        font-weight: 600;
        color: var(--DHAGreen);
        font-size: 1rem;
      }

      .modal-footer {
        padding: 20px;
        border-top: 1px solid var(--DHABackGroundLightGray);
        text-align: center;
      }

      @media (max-width: 768px) {
        .booking-success-modal {
          max-width: 95vw;
          margin: 10px;
        }

        .details-grid {
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .reference-number-container {
          gap: 8px;
        }

        .reference-number {
          font-size: 1.4rem;
        }

        .copy-button {
          min-width: 36px;
          height: 36px;
          padding: 6px 10px;
        }

        .copy-button i {
          font-size: 0.9rem;
        }

        .applicant-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }

      @media (max-width: 480px) {
        .reference-number-container {
          gap: 6px;
        }

        .reference-number {
          font-size: 1rem;
        }

        .copy-button {
          min-width: 32px;
          height: 32px;
          padding: 4px 8px;
        }

        .copy-button i {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class BookServiceComponent implements OnInit, OnDestroy {
  currentStep: 'preview' | 'form' | 'results' | 'confirm' = 'preview';
  stepTitles: string[] = ['Services', 'Details', 'Timeslots', 'Confirm'];
  showServiceModal = false;
  showBookingSuccessModal = false;
  bookingReference: string = '';
  copyButtonText: string = 'Copy';
  copyButtonIcon: string = 'fas fa-clone';
  isCopied: boolean = false;
  expandedSections: { [key: string]: boolean } = {
    appointment: true,
    personal: false,
    applicants: false,
    summary: false,
  };
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
      name: 'Smart ID Card Application',
      description: 'Apply for a new South African smart ID card',
      checked: false,
    },
    {
      id: 'passport',
      name: 'Passport Application',
      description: 'Apply for a new South African passport',
      checked: false,
    },
    {
      id: 'ehome-affairs',
      name: 'eHomeAffairs Application',
      description: 'Schedule an appointment for your eHomeAffairs application',
      checked: false,
    },
    {
      id: 'collection',
      name: 'Collection of ID or Passport',
      description: 'Collect your smart ID or Passport',
      checked: false,
    },
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalCleanupService: ModalCleanupService
  ) {
    this.addApplicantForm = this.fb.group({
      applicantType: ['', Validators.required],
      validationType: ['', Validators.required],
      idNumber: [''],
      passportNumber: [''],
      forenames: [''],
      lastName: [''],
    });
  }

  closeBookingSuccessModal() {
    this.showBookingSuccessModal = false;
    this.router.navigate(['/menu']);
  }

  generateBookingReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `DHA-${timestamp}-${random}`;
  }

  copyBookingReference(): void {
    if (this.bookingReference) {
      navigator.clipboard
        .writeText(this.bookingReference)
        .then(() => {
          // Show success feedback
          this.showCopySuccess();
          console.log('Booking reference copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy booking reference: ', err);
          // Fallback for older browsers
          this.fallbackCopyTextToClipboard(this.bookingReference);
        });
    }
  }

  private showCopySuccess(): void {
    // Change button text and icon to show success
    this.copyButtonText = 'Copied!';
    this.copyButtonIcon = 'fas fa-check';
    this.isCopied = true;

    // Reset after 2 seconds
    setTimeout(() => {
      this.copyButtonText = 'Copy';
      this.copyButtonIcon = 'fas fa-clone';
      this.isCopied = false;
    }, 2000);
  }

  private fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      // Show success feedback for fallback method too
      this.showCopySuccess();
      console.log('Booking reference copied to clipboard (fallback)');
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }

    document.body.removeChild(textArea);
  }

  toggleSection(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  getTotalServices(): number {
    return this.bookingPersons.reduce(
      (total, person) => total + person.selectedServices.length,
      0
    );
  }

  getTotalAmount(): number {
    return this.bookingPersons.reduce((total, person) => {
      return (
        total +
        person.selectedServices.reduce(
          (personTotal, service) => personTotal + (service.price || 0),
          0
        )
      );
    }, 0);
  }

  getCurrentDate(): string {
    return new Date().toISOString();
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

    // Register cleanup callback with the modal cleanup service
    this.modalCleanupService.registerCleanup(() => this.cleanupAllModals());

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

  ngOnDestroy() {
    // Ensure all modals are closed and body styles are restored
    this.cleanupAllModals();

    // Unregister cleanup callback
    this.modalCleanupService.unregisterCleanup(() => this.cleanupAllModals());
  }

  /**
   * Cleanup method to restore body styles if any modals are stuck open
   * This prevents the body from being locked in a modal state
   */
  private cleanupAllModals() {
    // Close all modals
    this.showAddApplicantModal = false;
    this.showServiceModal = false;
    this.showPersonServiceModal = false;

    // Force restore body styles (safety net)
    this.restoreBodyStyles();
  }

  /**
   * Restore body styles to their original state
   * This is a safety net in case modal cleanup fails
   */
  private restoreBodyStyles() {
    // Use the static cleanup method from IosModalComponent for consistency
    IosModalComponent.forceCleanup();
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

  onAlternativeBranchSelected(branchId: string): void {
    // Update the search criteria with the new branch
    if (this.searchCriteria) {
      // Create a new object reference to trigger change detection
      this.searchCriteria = {
        ...this.searchCriteria,
        branch: branchId,
      };
      // Ensure we're on the results step to show the new search
      this.currentStep = 'results';
      window.scrollTo(0, 0);
    }
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

    // Generate booking reference
    this.bookingReference = this.generateBookingReference();

    // For now, show a success message
    // TODO: show a success message in a modal
    this.showBookingSuccessModal = true;
    // alert(
    //   `Booking confirmed successfully! Your appointment is scheduled for ${this.getFormattedDate(
    //     this.selectedSlot.date
    //   )} at ${this.selectedSlot.time}`
    // );

    // Navigate back to menu or home
    // this.router.navigate(['/menu']);
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
