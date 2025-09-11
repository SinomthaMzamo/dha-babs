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
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BookingStepIndicatorComponent } from '../booking-step-indicator/booking-step-indicator.component';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';

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
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressIndicatorComponent],
  template: `
    <div class="appointment-form-container">
      <div class="appointment-form-content-wrapper">
        <app-progress-indicator
          [currentStep]="1"
          [steps]="stepTitles"
        ></app-progress-indicator>
        <div class="appointment-form-card">
          <h2>Book A New Appointment</h2>

          <form
            [formGroup]="appointmentForm"
            (ngSubmit)="onSubmit()"
            (click)="onDocumentClick($event)"
            autocomplete="on"
          >
            <!-- Selected Services Display -->
            <div
              class="form-section collapsible"
              *ngIf="selectedServices && selectedServices.length > 0"
              data-section="selectedServices"
            >
              <div
                class="section-header"
                (click)="toggleSection('selectedServices')"
                (focus)="onSectionFocus('selectedServices')"
                tabindex="0"
              >
                <h3>Applicants & Selected Services</h3>
                <span
                  class="expand-icon"
                  [class.expanded]="selectedServicesExpanded"
                  >▼</span
                >
              </div>
              <div
                class="section-content"
                [class.expanded]="selectedServicesExpanded"
              >
                <!-- Applicant Information Cards -->
                <div
                  class="applicants-overview"
                  *ngIf="bookingPersons && bookingPersons.length > 0"
                >
                  <div
                    *ngFor="let person of bookingPersons; let i = index"
                    class="applicant-card"
                  >
                    <div class="applicant-header capitalised">
                      <div class="applicant-info">
                        <span class="applicant-type">{{ person.type }}</span>
                        <h4 class="applicant-name">{{ person.name }}</h4>
                      </div>
                      <div class="applicant-identifier" *ngIf="person.idNumber">
                        <span class="identifier-label">ID Number</span>
                        <span class="identifier-value">{{
                          person.idNumber
                        }}</span>
                      </div>
                    </div>

                    <div
                      class="applicant-services"
                      *ngIf="
                        person.selectedServices &&
                        person.selectedServices.length > 0
                      "
                    >
                      <div class="services-label">Selected Services:</div>
                      <div class="services-list">
                        <div
                          *ngFor="let service of person.selectedServices"
                          class="service-badge"
                        >
                          {{ service.name }}
                        </div>
                      </div>
                    </div>

                    <div
                      class="no-services"
                      *ngIf="
                        !person.selectedServices ||
                        person.selectedServices.length === 0
                      "
                    >
                      <span class="no-services-text">No services selected</span>
                    </div>
                  </div>
                </div>

                <!-- Fallback for legacy selectedServices -->
                <div
                  class="legacy-services"
                  *ngIf="
                    (!bookingPersons || bookingPersons.length === 0) &&
                    selectedServices &&
                    selectedServices.length > 0
                  "
                >
                  <div class="services-label">Selected Services:</div>
                  <div class="selected-services-display">
                    <div
                      *ngFor="let service of selectedServices"
                      class="service-badge"
                    >
                      {{ service.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Location Selection -->
            <div class="form-section collapsible" data-section="location">
              <div
                class="section-header"
                (click)="toggleSection('location')"
                (focus)="onSectionFocus('location')"
                tabindex="0"
              >
                <h3>Branch Selection</h3>
                <span class="expand-icon" [class.expanded]="locationExpanded"
                  >▼</span
                >
              </div>
              <div class="section-content" [class.expanded]="locationExpanded">
                <p class="section-description">Choose your preferred branch:</p>

                <div class="location-grid">
                  <div class="form-group floating-label-group">
                    <select
                      id="province"
                      formControlName="province"
                      (change)="onProvinceChange()"
                      (focus)="onSectionFocus('location')"
                      (blur)="onSectionBlur('location')"
                      class="floating-input"
                      [class.has-value]="appointmentForm.get('province')?.value"
                    >
                      <option value=""></option>
                      <option
                        *ngFor="let province of provinces"
                        [value]="province.id"
                      >
                        {{ province.name }}
                      </option>
                    </select>
                    <label for="province" class="floating-label"
                      >Select province *</label
                    >
                    <div
                      *ngIf="
                        appointmentForm.get('province')?.invalid &&
                        appointmentForm.get('province')?.touched
                      "
                      class="error-message"
                    >
                      Province is required
                    </div>
                  </div>

                  <div
                    class="form-group floating-label-group"
                    *ngIf="appointmentForm.get('province')?.value"
                  >
                    <select
                      id="area"
                      formControlName="area"
                      (change)="onAreaChange()"
                      (focus)="onSectionFocus('location')"
                      (blur)="onSectionBlur('location')"
                      class="floating-input"
                      [class.has-value]="appointmentForm.get('area')?.value"
                    >
                      <option value=""></option>
                      <option
                        *ngFor="let area of filteredAreas"
                        [value]="area.id"
                      >
                        {{ area.name }}
                      </option>
                    </select>
                    <label for="area" class="floating-label"
                      >Select area *</label
                    >
                    <div
                      *ngIf="
                        appointmentForm.get('area')?.invalid &&
                        appointmentForm.get('area')?.touched
                      "
                      class="error-message"
                    >
                      Area is required
                    </div>
                  </div>

                  <div
                    class="form-group floating-label-group"
                    *ngIf="appointmentForm.get('area')?.value"
                  >
                    <select
                      id="branch"
                      formControlName="branch"
                      (focus)="onSectionFocus('location')"
                      (blur)="onSectionBlur('location')"
                      class="floating-input"
                      [class.has-value]="appointmentForm.get('branch')?.value"
                    >
                      <option value=""></option>
                      <option
                        *ngFor="let branch of filteredBranches"
                        [value]="branch.id"
                      >
                        {{ branch.name }}
                      </option>
                    </select>
                    <label for="branch" class="floating-label"
                      >Select branch *</label
                    >
                    <div
                      *ngIf="
                        appointmentForm.get('branch')?.invalid &&
                        appointmentForm.get('branch')?.touched
                      "
                      class="error-message"
                    >
                      Branch is required
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Date Range Selection -->
            <div class="form-section collapsible" data-section="dateRange">
              <div
                class="section-header"
                (click)="toggleSection('dateRange')"
                (focus)="onSectionFocus('dateRange')"
                tabindex="0"
              >
                <h3>Select Booking Date Range</h3>
                <span class="expand-icon" [class.expanded]="dateRangeExpanded"
                  >▼</span
                >
              </div>
              <div class="section-content" [class.expanded]="dateRangeExpanded">
                <p class="section-description">
                  Choose when you'd like to book your appointment:
                </p>

                <div class="date-grid">
                  <div class="form-group floating-label-group">
                    <input
                      type="date"
                      id="startDate"
                      formControlName="startDate"
                      placeholder=""
                      [min]="today"
                      (focus)="onSectionFocus('dateRange')"
                      (blur)="onSectionBlur('dateRange')"
                      class="floating-input"
                      [class.has-value]="
                        appointmentForm.get('startDate')?.value
                      "
                    />
                    <label for="startDate" class="floating-label"
                      >Select start date *</label
                    >
                    <div
                      *ngIf="
                        appointmentForm.get('startDate')?.invalid &&
                        appointmentForm.get('startDate')?.touched
                      "
                      class="error-message"
                    >
                      Start date is required
                    </div>
                  </div>

                  <div class="form-group floating-label-group">
                    <input
                      type="date"
                      id="endDate"
                      formControlName="endDate"
                      [min]="appointmentForm.get('startDate')?.value || today"
                      [max]="maxDate"
                      (focus)="onSectionFocus('dateRange')"
                      (blur)="onSectionBlur('dateRange')"
                      class="floating-input"
                      [class.has-value]="appointmentForm.get('endDate')?.value"
                    />
                    <label for="endDate" class="floating-label"
                      >End Date *</label
                    >
                    <div
                      *ngIf="
                        appointmentForm.get('endDate')?.invalid &&
                        appointmentForm.get('endDate')?.touched
                      "
                      class="error-message"
                    >
                      End date is required
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="button-group">
              <button type="button" (click)="goBack()" class="btn-secondary">
                Back
              </button>
              <button
                type="submit"
                [disabled]="!isFormValid()"
                class="btn-primary"
              >
                Find Available Slots
              </button>
            </div>
          </form>
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
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHADisabledTextGray: #c4c4c4;
      }

      .appointment-form-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 70px);
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding: 20px;
      }

      .appointment-form-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--step-form-gap);
        width: 100%;
        max-width: var(--form-width);
        box-sizing: border-box;
      }

      .appointment-form-card {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        max-width: var(--form-width);
        height: var(--mobile-form-height);
        overflow-y: auto;
        width: 100%; /* fill the wrapper */
        box-sizing: border-box;
      }

      h2 {
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 24px;
        font-weight: 700;
        text-align: center;
      }

      .form-section {
        margin-bottom: 28px;
        background: var(--DHAOffWhite);
        border-radius: 12px;
        border: 1px solid var(--DHAGreen);
        overflow: hidden;
      }

      .form-section.collapsible {
        padding: 0;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        cursor: pointer;
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        transition: background-color 0.3s ease;
      }

      .section-header:hover {
        background: whitesmoke;
        color: var(--DHAGreen);
      }

      .section-header:hover h3 {
        color: var(--DHAGreen);
      }

      .section-header h3 {
        color: var(--DHAWhite);
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        transition: color 0.3s ease;
      }

      .expand-icon {
        font-size: 1.2rem;
        transition: transform 0.3s ease, color 0.3s ease;
        color: var(--DHAWhite);
      }

      .section-header:hover .expand-icon {
        color: var(--DHAGreen);
      }

      .expand-icon.expanded {
        transform: rotate(180deg);
      }

      .section-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
        padding: 0 25px;
      }

      .section-content.expanded {
        max-height: 1000px;
        padding: 25px;
      }

      .form-section:not(.collapsible) {
        padding: 25px;
      }

      .form-section:not(.collapsible) h3 {
        color: var(--DHAGreen);
        margin-bottom: 10px;
        font-size: 1.3rem;
        font-weight: 600;
      }

      .section-description {
        color: var(--DHATextGrayDark);
        margin-bottom: 20px;
        font-size: 1rem;
        margin-top: 0;
      }

      /* Applicant Overview Styles - Gestalt Principles */
      .applicants-overview {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 20px;
      }

      .applicant-card {
        background: var(--DHAWhite);
        border: 2px solid var(--DHAWhite);
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
      }

      .applicant-card:hover {
        border-color: var(--DHAGreen);
        box-shadow: 0 4px 12px rgba(1, 102, 53, 0.1);
      }

      .applicant-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
        row-gap: 4px;
      }

      .applicant-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .applicant-name {
        color: var(--DHAGreen);
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
      }

      .applicant-type {
        color: var(--DHATextGray);
        font-size: 10px;
        font-weight: 400;
        background: var(--DHABackGroundLightGray);
        padding: 4px 8px;
        border-radius: 12px;
        display: inline-block;
        width: fit-content;
      }

      .applicant-identifier {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
      }

      .identifier-label {
        color: var(--DHATextGray);
        font-size: 0.8rem;
        font-weight: 500;
        align-self: baseline;
      }

      .identifier-value {
        color: var(--DHATextGrayDark);
        font-size: 0.9rem;
        font-weight: 600;
        font-family: monospace;
        background: var(--DHAOffWhite);
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid var(--DHABackGroundLightGray);
      }

      .applicant-services {
        margin-top: 15px;
      }

      .services-label {
        color: var(--DHATextGrayDark);
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .services-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .no-services {
        margin-top: 15px;
        text-align: center;
        padding: 20px;
        background: var(--DHABackGroundLightGray);
        border-radius: 8px;
        border: 2px dashed var(--DHATextGray);
      }

      .no-services-text {
        color: var(--DHATextGray);
        font-size: 0.9rem;
        font-style: italic;
      }

      /* Legacy Services Display */
      .legacy-services {
        margin-bottom: 20px;
      }

      .selected-services-display {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
      }

      .service-badge {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 4px 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        width: fit-content;
      }

      .services-list {
        display: flex;
        gap: 15px;
      }

      .service-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 15px;
        background: var(--DHAWhite);
        border-radius: 8px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
      }

      .service-item:hover {
        border-color: var(--DHAOrange);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(243, 128, 31, 0.1);
      }

      .service-checkbox {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-top: 2px;
      }

      .service-checkbox input[type='checkbox'] {
        display: none;
      }

      .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid var(--DHAGreen);
        border-radius: 4px;
        position: relative;
        transition: all 0.3s ease;
      }

      .service-checkbox input[type='checkbox']:checked + .checkmark {
        background: var(--DHAGreen);
      }

      .service-checkbox input[type='checkbox']:checked + .checkmark::after {
        content: '✓';
        color: var(--DHAWhite);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 14px;
        font-weight: bold;
      }

      .service-details {
        flex: 1;
      }

      .service-name {
        font-weight: 600;
        color: var(--DHAGreen);
        margin-bottom: 5px;
        font-size: 1.1rem;
      }

      .service-description {
        color: var(--DHATextGrayDark);
        font-size: 0.95rem;
        line-height: 1.4;
      }

      .location-grid,
      .date-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      /* Floating Label Styles */
      .floating-label-group {
        position: relative;
        margin-top: 10px;
        margin-bottom: 20px;
      }

      .floating-input {
        padding: 16px 12px;
        border: 2px solid var(--DHATextGray);
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: var(--DHAWhite);
        width: 100%;
        box-sizing: border-box;
      }

      .floating-input:focus,
      .floating-input.has-value {
        padding: 16px 12px;
      }

      /* Special handling for select elements */
      select.floating-input {
        padding-right: 30px; /* Make room for dropdown arrow */
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23949494' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
      }

      /* Hide date format when label is inside input */
      input[type='date'].floating-input:not(:focus):not(.has-value) {
        color: transparent;
      }

      input[type='date'].floating-input:not(:focus):not(
          .has-value
        )::-webkit-datetime-edit {
        color: transparent;
      }

      input[type='date'].floating-input:not(:focus):not(
          .has-value
        )::-webkit-datetime-edit-fields-wrapper {
        color: transparent;
      }

      input[type='date'].floating-input:not(:focus):not(
          .has-value
        )::-webkit-datetime-edit-text {
        color: transparent;
      }

      input[type='date'].floating-input:not(:focus):not(
          .has-value
        )::-webkit-datetime-edit-month-field,
      input[type='date'].floating-input:not(:focus):not(
          .has-value
        )::-webkit-datetime-edit-day-field,
      input[type='date'].floating-input:not(:focus):not(
          .has-value
        )::-webkit-datetime-edit-year-field {
        color: transparent;
      }

      /* Show date format when focused or has value */
      input[type='date'].floating-input:focus,
      input[type='date'].floating-input.has-value {
        color: inherit;
      }

      input[type='date'].floating-input:focus::-webkit-datetime-edit,
      input[type='date'].floating-input.has-value::-webkit-datetime-edit {
        color: inherit;
      }

      input[type='date'].floating-input:focus::-webkit-datetime-edit-fields-wrapper,
      input[type='date'].floating-input.has-value::-webkit-datetime-edit-fields-wrapper {
        color: inherit;
      }

      input[type='date'].floating-input:focus::-webkit-datetime-edit-text,
      input[type='date'].floating-input.has-value::-webkit-datetime-edit-text {
        color: inherit;
      }

      input[type='date'].floating-input:focus::-webkit-datetime-edit-month-field,
      input[type='date'].floating-input:focus::-webkit-datetime-edit-day-field,
      input[type='date'].floating-input:focus::-webkit-datetime-edit-year-field,
      input[type='date'].floating-input.has-value::-webkit-datetime-edit-month-field,
      input[type='date'].floating-input.has-value::-webkit-datetime-edit-day-field,
      input[type='date'].floating-input.has-value::-webkit-datetime-edit-year-field {
        color: inherit;
      }

      .floating-input:focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-shadow: 0 0 0 3px rgba(1, 102, 53, 0.1);
      }

      .floating-input:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
      }

      .floating-label {
        position: absolute;
        top: 16px;
        left: 12px;
        font-weight: 600;
        color: var(--DHATextGray);
        font-size: 16px;
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

      /* Legacy label styles for non-floating inputs */
      label:not(.floating-label) {
        font-weight: 600;
        color: var(--DHAGreen);
        margin-bottom: 8px;
        font-size: 1rem;
      }

      select:not(.floating-input),
      input[type='date']:not(.floating-input) {
        padding: 12px;
        border: 2px solid var(--DHATextGray);
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: var(--DHAWhite);
      }

      select:not(.floating-input):focus,
      input[type='date']:not(.floating-input):focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-shadow: 0 0 0 3px rgba(1, 102, 53, 0.1);
      }

      select:not(.floating-input):disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
      }

      .error-message {
        color: var(--DHAErrorColor);
        font-size: 14px;
        margin-top: 5px;
        font-weight: 500;
      }

      .button-group {
        display: flex;
        gap: 20px;
        margin-top: 40px;
        justify-content: space-between;
      }

      .button-group > * {
        flex: 1;
        white-space: nowrap;
      }

      .btn-primary,
      .btn-secondary {
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 150px;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--DHAMaroon);
        transform: translateY(-2px);
      }

      .btn-primary:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
      }

      .btn-secondary {
        background: var(--DHATextGray);
        color: var(--DHAWhite);
      }

      .btn-secondary:hover {
        background: var(--DHATextGrayDark);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .appointment-form-container {
          padding: 24px 2px;
          flex-direction: column;
        }

        .appointment-form-content-wrapper {
          padding: 0 8px;
        }

        .appointment-form-card {
          padding: 25px 20px;
          min-width: unset;
          height: 600px;
          overflow-y: auto;
          width: 100%;
        }

        .form-section {
          padding: 20px 15px;
        }

        .location-grid,
        .date-grid {
          grid-template-columns: 1fr;
        }

        .button-group {
          flex-direction: column;
          align-items: space-between;
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
        }
      }
    `,
  ],
})
export class AppointmentFormComponent implements OnInit, OnChanges {
  @Input() selectedServices: any[] = [];
  @Input() stepTitles: string[] = [];
  @Input() bookingPersons: any[] = [];
  @Input() searchCriteria: any = null;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() goBackRequested = new EventEmitter<void>();

  appointmentForm: FormGroup;
  today: string;
  maxDate: string;

  // Section expansion state
  selectedServicesExpanded = true;
  locationExpanded = false;
  dateRangeExpanded = false;

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

  areas: Area[] = [
    // Gauteng
    { id: 'jhb-central', name: 'Johannesburg Central', provinceId: 'gauteng' },
    { id: 'jhb-sandton', name: 'Sandton', provinceId: 'gauteng' },
    { id: 'pta-central', name: 'Pretoria Central', provinceId: 'gauteng' },

    // Western Cape
    { id: 'ct-central', name: 'Cape Town Central', provinceId: 'western-cape' },
    { id: 'ct-bellville', name: 'Bellville', provinceId: 'western-cape' },
    { id: 'ct-durbanville', name: 'Durbanville', provinceId: 'western-cape' },

    // KwaZulu-Natal
    { id: 'dbn-central', name: 'Durban Central', provinceId: 'kwazulu-natal' },
    { id: 'dbn-umhlanga', name: 'Umhlanga', provinceId: 'kwazulu-natal' },

    // Eastern Cape
    {
      id: 'pe-central',
      name: 'Port Elizabeth Central',
      provinceId: 'eastern-cape',
    },
    { id: 'pe-east-london', name: 'East London', provinceId: 'eastern-cape' },

    // Free State
    {
      id: 'bloem-central',
      name: 'Bloemfontein Central',
      provinceId: 'free-state',
    },

    // Mpumalanga
    {
      id: 'nelspruit-central',
      name: 'Nelspruit Central',
      provinceId: 'mpumalanga',
    },

    // Limpopo
    {
      id: 'polokwane-central',
      name: 'Polokwane Central',
      provinceId: 'limpopo',
    },

    // North West
    {
      id: 'mahikeng-central',
      name: 'Mahikeng Central',
      provinceId: 'north-west',
    },

    // Northern Cape
    {
      id: 'kimberley-central',
      name: 'Kimberley Central',
      provinceId: 'northern-cape',
    },
  ];

  branches: Branch[] = [
    // Johannesburg Central
    {
      id: 'jhb-central-main',
      name: 'Johannesburg Central Main Office',
      areaId: 'jhb-central',
    },
    {
      id: 'jhb-central-east',
      name: 'Johannesburg Central East Office',
      areaId: 'jhb-central',
    },

    // Sandton
    {
      id: 'jhb-sandton-main',
      name: 'Sandton Main Office',
      areaId: 'jhb-sandton',
    },

    // Pretoria Central
    {
      id: 'pta-central-main',
      name: 'Pretoria Central Main Office',
      areaId: 'pta-central',
    },

    // Cape Town Central
    {
      id: 'ct-central-main',
      name: 'Cape Town Central Main Office',
      areaId: 'ct-central',
    },

    // Bellville
    {
      id: 'ct-bellville-main',
      name: 'Bellville Main Office',
      areaId: 'ct-bellville',
    },
    {
      id: 'ct-tygervalley-main',
      name: 'Tygervalley Main Office',
      areaId: 'ct-bellville',
    },

    // Durbanville
    {
      id: 'ct-durbanville-main',
      name: 'Durbanville Main Office',
      areaId: 'ct-durbanville',
    },

    // Durban Central
    {
      id: 'dbn-central-main',
      name: 'Durban Central Main Office',
      areaId: 'dbn-central',
    },

    // Umhlanga
    {
      id: 'dbn-umhlanga-main',
      name: 'Umhlanga Main Office',
      areaId: 'dbn-umhlanga',
    },

    // Port Elizabeth Central
    {
      id: 'pe-central-main',
      name: 'Port Elizabeth Central Main Office',
      areaId: 'pe-central',
    },

    // East London
    {
      id: 'pe-east-london-main',
      name: 'East London Main Office',
      areaId: 'pe-east-london',
    },

    // Bloemfontein Central
    {
      id: 'bloem-central-main',
      name: 'Bloemfontein Central Main Office',
      areaId: 'bloem-central',
    },

    // Nelspruit Central
    {
      id: 'nelspruit-central-main',
      name: 'Nelspruit Central Main Office',
      areaId: 'nelspruit-central',
    },

    // Polokwane Central
    {
      id: 'polokwane-central-main',
      name: 'Polokwane Central Main Office',
      areaId: 'polokwane-central',
    },

    // Mahikeng Central
    {
      id: 'mahikeng-central-main',
      name: 'Mahikeng Central Main Office',
      areaId: 'mahikeng-central',
    },

    // Kimberley Central
    {
      id: 'kimberley-central-main',
      name: 'Kimberley Central Main Office',
      areaId: 'kimberley-central',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      province: ['', Validators.required],
      area: ['', Validators.required],
      branch: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.today = new Date().toISOString().split('T')[0];

    // Set max date to 30 days from now
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    // Set default end date to 30 days from today
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    this.appointmentForm.patchValue({
      endDate: defaultEndDate.toISOString().split('T')[0],
    });

    // Pre-fill form if searchCriteria is provided (when editing search)
    this.prefillFormFromSearchCriteria();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Handle changes to searchCriteria input
    if (changes['searchCriteria'] && !changes['searchCriteria'].firstChange) {
      this.prefillFormFromSearchCriteria();
    }
  }

  private prefillFormFromSearchCriteria() {
    if (this.searchCriteria) {
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 30);

      this.appointmentForm.patchValue({
        province: this.searchCriteria.branch
          ? this.getProvinceFromBranch(this.searchCriteria.branch)
          : '',
        area: this.searchCriteria.branch
          ? this.getAreaFromBranch(this.searchCriteria.branch)
          : '',
        branch: this.searchCriteria.branch || '',
        startDate: this.searchCriteria.startDate || '',
        endDate:
          this.searchCriteria.endDate ||
          defaultEndDate.toISOString().split('T')[0],
      });

      // Auto-expand location section if branch is pre-filled
      if (this.searchCriteria.branch) {
        this.locationExpanded = true;
      }
    }
  }

  get filteredAreas() {
    const provinceId = this.appointmentForm.get('province')?.value;
    return this.areas.filter((area) => area.provinceId === provinceId);
  }

  get filteredBranches() {
    const areaId = this.appointmentForm.get('area')?.value;
    return this.branches.filter((branch) => branch.areaId === areaId);
  }

  getProvinceFromBranch(branchId: string): string {
    const branch = this.branches.find((b) => b.id === branchId);
    if (branch) {
      const area = this.areas.find((a) => a.id === branch.areaId);
      return area ? area.provinceId : '';
    }
    return '';
  }

  getAreaFromBranch(branchId: string): string {
    const branch = this.branches.find((b) => b.id === branchId);
    return branch ? branch.areaId : '';
  }

  onProvinceChange() {
    this.appointmentForm.patchValue({
      area: '',
      branch: '',
    });

    // Auto-expand location section when province is selected
    if (this.appointmentForm.get('province')?.value) {
      this.locationExpanded = true;
    }
  }

  onAreaChange() {
    this.appointmentForm.patchValue({
      branch: '',
    });

    // Auto-expand location section when area is selected
    if (this.appointmentForm.get('area')?.value) {
      this.locationExpanded = true;
    }
  }

  isFormValid(): boolean {
    return this.appointmentForm.valid && this.selectedServices.length > 0;
  }

  onSubmit() {
    if (this.isFormValid()) {
      const formData = {
        ...this.appointmentForm.value,
        selectedServices: this.selectedServices.map((service) => service.name),
      };

      this.formSubmitted.emit(formData);
    }
  }

  goBack() {
    // Emit event to parent component to go back to service selection
    this.goBackRequested.emit();
  }

  toggleSection(section: string) {
    switch (section) {
      case 'selectedServices':
        this.selectedServicesExpanded = !this.selectedServicesExpanded;
        break;
      case 'location':
        this.locationExpanded = !this.locationExpanded;
        break;
      case 'dateRange':
        this.dateRangeExpanded = !this.dateRangeExpanded;
        break;
    }
  }

  onSectionFocus(section: string) {
    // Collapse other sections when focusing on a new section
    switch (section) {
      case 'selectedServices':
        this.selectedServicesExpanded = true;
        this.locationExpanded = false;
        this.dateRangeExpanded = false;
        break;
      case 'location':
        this.selectedServicesExpanded = false;
        this.locationExpanded = true;
        this.dateRangeExpanded = false;
        break;
      case 'dateRange':
        this.selectedServicesExpanded = false;
        this.locationExpanded = false;
        this.dateRangeExpanded = true;
        break;
    }
  }

  onSectionBlur(section: string) {
    // Auto-collapse sections after a short delay to allow for navigation
    setTimeout(() => {
      // Check if any form controls in this specific section are still focused
      const activeElement = document.activeElement;
      let shouldCollapse = true;

      if (activeElement) {
        // Check if the active element is within the specific section
        const sectionElement = document.querySelector(
          `[data-section="${section}"]`
        );
        if (sectionElement && sectionElement.contains(activeElement)) {
          shouldCollapse = false;
        }

        // Also check if the active element is the section header itself (to prevent collapse on header click)
        const sectionHeader = sectionElement?.querySelector('.section-header');
        if (sectionHeader && sectionHeader.contains(activeElement)) {
          shouldCollapse = false;
        }
      }

      // Auto-collapse all sections when out of focus
      if (shouldCollapse) {
        switch (section) {
          case 'selectedServices':
            this.selectedServicesExpanded = false;
            break;
          case 'location':
            this.locationExpanded = false;
            break;
          case 'dateRange':
            this.dateRangeExpanded = false;
            break;
        }
      }
    }, 200); // Reduced delay to make it more responsive
  }

  // Handle clicks outside sections to auto-collapse
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Check if click is on a section header (don't collapse in this case)
    const clickedHeader = target.closest('.section-header');
    if (clickedHeader) {
      return; // Let the click event handle the toggle
    }

    // Check if click is on a form control within a section
    const clickedFormControl = target.closest('select, input');
    if (clickedFormControl) {
      const section = clickedFormControl.closest('[data-section]');
      if (section) {
        const sectionName = section.getAttribute('data-section');
        if (sectionName) {
          // Expand the section when clicking on its form controls and collapse others
          switch (sectionName) {
            case 'selectedServices':
              this.selectedServicesExpanded = true;
              this.locationExpanded = false;
              this.dateRangeExpanded = false;
              break;
            case 'location':
              this.selectedServicesExpanded = false;
              this.locationExpanded = true;
              this.dateRangeExpanded = false;
              break;
            case 'dateRange':
              this.selectedServicesExpanded = false;
              this.locationExpanded = false;
              this.dateRangeExpanded = true;
              break;
          }
        }
      }
      return;
    }

    // Check if click is outside any section
    const clickedSection = target.closest('[data-section]');
    if (!clickedSection) {
      // Clicked outside all sections, collapse all sections
      setTimeout(() => {
        this.selectedServicesExpanded = false;
        this.locationExpanded = false;
        this.dateRangeExpanded = false;
      }, 100);
    }
  }
}
