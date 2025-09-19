import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FormPageLayoutComponent } from '../shared/form-page-layout/form-page-layout.component';
import { IosModalComponent } from '../shared/ios-modal/ios-modal.component';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormPageLayoutComponent,
    IosModalComponent,
  ],
  template: `
    <app-form-page-layout
      [currentStep]="getProgressStep()"
      [steps]="stepTitles"
    >
      <!-- Step 1: Personal Details Verification -->
      <div *ngIf="currentStep === 1" class="step-section">
        <h2>Verify Personal Information</h2>
        <p class="step-description">
          Please enter your personal details, we will verify them against DHA
          records
        </p>

        <form
          [formGroup]="verificationForm"
          (ngSubmit)="onVerificationSubmit()"
          autocomplete="on"
        >
          <div class="form-group floating-label-group">
            <div class="field-info">
              <small>ID number from previous step</small>
            </div>
            <input
              type="text"
              id="idNumber"
              [value]="authData?.idNumber || ''"
              class="floating-input has-value"
              disabled
              readonly
            />
            <!-- <label for="idNumber" class="floating-label">ID Number</label> -->
          </div>

          <div class="form-group floating-label-group">
            <input
              type="text"
              id="forenames"
              formControlName="forenames"
              class="floating-input"
              autocomplete="given-name"
              [class.has-value]="verificationForm.get('forenames')?.value"
            />
            <label for="forenames" class="floating-label">Forenames *</label>
            <div
              *ngIf="
                verificationForm.get('forenames')?.invalid &&
                verificationForm.get('forenames')?.touched
              "
              class="error-message"
            >
              <span class="fas fa-exclamation-circle"></span>
              Forenames are required
            </div>
          </div>

          <div class="form-group floating-label-group">
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              class="floating-input"
              autocomplete="family-name"
              [class.has-value]="verificationForm.get('lastName')?.value"
            />
            <label for="lastName" class="floating-label">Last Name *</label>
            <div
              *ngIf="
                verificationForm.get('lastName')?.invalid &&
                verificationForm.get('lastName')?.touched
              "
              class="error-message"
            >
              <span class="fas fa-exclamation-circle"></span>
              Last name is required
            </div>
          </div>

          <div class="button-group">
            <button
              type="button"
              (click)="showSignOutConfirmation()"
              class="btn-sign-out"
            >
              ← Sign Out
            </button>
            <button
              type="submit"
              [disabled]="verificationForm.invalid"
              class="btn-primary"
            >
              Verify
            </button>
          </div>

          <!-- Demo Mode Section -->
          <div class="demo-section" *ngIf="showDemoMode">
            <hr class="demo-divider" />
            <h4>🎬 Demo Mode</h4>
            <p class="demo-description">Quick fill for demo purposes</p>
            <div class="demo-buttons">
              <button type="button" (click)="fillDemoData()" class="btn-demo">
                Fill Demo Data
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Step 2: Verification Success -->
      <div *ngIf="currentStep === 2" class="step-section">
        <div class="success-message">
          <!-- <div class="success-icon">✅</div> -->
          <h2>Verification Successful!</h2>
          <p class="success-description">
            Your personal details have been successfully verified against DHA
            records.
          </p>
        </div>

        <div class="verified-details-preview">
          <h3>Verified Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <label>ID Number:</label>
              <span class="detail-value">{{ authData?.idNumber }}</span>
            </div>
            <div class="detail-item">
              <label>Full Name:</label>
              <span class="detail-value"
                >{{ verificationForm.get('forenames')?.value }}
                {{ verificationForm.get('lastName')?.value }}</span
              >
            </div>
          </div>
        </div>

        <div class="button-group">
          <!-- <button
                type="button"
                (click)="goBackToVerification()"
                class="btn-secondary"
              >
                Back
              </button> -->
          <button
            type="button"
            (click)="proceedToContact()"
            class="btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </app-form-page-layout>

    <!-- Sign Out Confirmation Modal -->
    <app-ios-modal
      [isOpen]="showSignOutModal"
      title="Confirm Sign Out"
      [closeOnOverlayClick]="true"
      [closeOnEscape]="true"
      cancelText="Cancel"
      confirmText="Sign Out"
      [confirmDisabled]="false"
      (modalClosed)="closeSignOutModal()"
      (cancelClicked)="closeSignOutModal()"
      (confirmClicked)="confirmSignOut()"
    >
      <div class="sign-out-content">
        <div class="warning-icon">⚠️</div>
        <h3>Are you sure you want to sign out?</h3>
        <p>
          This will clear all your session data and you'll need to authenticate
          again.
        </p>
        <div class="sign-out-details">
          <p><strong>This will:</strong></p>
          <ul>
            <li>Clear your personal information</li>
            <li>Remove any saved appointments</li>
            <li>Sign you out of the system</li>
          </ul>
        </div>
      </div>
    </app-ios-modal>
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
        --DHAOffBlack: rgb(51, 51, 51);
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
      }

      * {
        box-sizing: border-box;
      }

      h2 {
        text-align: center;
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 600;
        margin-top: 0;
      }

      .form-group {
        margin-bottom: 20px;
        width: 100%;
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
        border: 1px solid var(--DividerGray);
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.3s ease;
        box-sizing: border-box;
        background: var(--DHAWhite);
      }

      .floating-input:focus {
        padding: 8px 12px;
      }

      .floating-input:focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-shadow: 0 0 0 3px rgba(1, 102, 53, 0.1);
      }

      .floating-input:disabled {
        background-color: var(--DHABackGroundLightGray);
        cursor: not-allowed;
        color: var(--DHADisabledTextGray);
        border-color: var(--DividerGray);
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

      /* Legacy styles for non-floating inputs */
      label:not(.floating-label) {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--DHATextGrayDark);
      }

      .form-control:not(.floating-input) {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--DividerGray);
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
      }

      .form-control:not(.floating-input):focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-sizing: border-box;
      }

      .form-control:not(.floating-input):disabled {
        background-color: var(--DHABackGroundLightGray);
        cursor: not-allowed;
        color: var(--DHADisabledTextGray);
        border-color: var(--DividerGray);
        box-sizing: border-box;
      }

      .floating-input:focus,
      .floating-input.has-value {
        padding: 16px 12px;
      }

      .error-message {
        color: var(--DHAErrorColor);
        font-size: 14px;
        margin-top: 5px;
      }

      .field-info {
        margin-top: 5px;
      }

      .field-info small {
        color: var(--DHATextGray);
        font-size: 12px;
        font-style: italic;
      }

      .step-section {
        animation: fadeIn 0.3s ease-in;
      }

      .step-description {
        color: var(--DHATextGray);
        font-size: 16px;
        margin-bottom: 30px;
        line-height: 1.5;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .success-message {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
        border-radius: 12px;
        border: 2px solid var(--DHAGreen);
        margin-top: 0;
      }

      .success-icon {
        font-size: 48px;
        margin-bottom: 15px;
        animation: bounce 0.6s ease-in-out;
      }

      .success-message h2 {
        color: var(--DHAGreen);
        margin-bottom: 10px;
        font-size: 24px;
      }

      .success-description {
        color: var(--DHATextGrayDark);
        font-size: 16px;
        margin: 0;
        line-height: 1.5;
      }

      .verified-details-preview {
        background: var(--DHAOffWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 30px;
      }

      .verified-details-preview h3 {
        color: var(--DHATextGrayDark);
        margin-bottom: 15px;
        font-size: 18px;
        font-weight: 600;
      }

      .details-grid {
        display: grid;
        gap: 12px;
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
        font-size: 14px;
      }

      .detail-value {
        color: var(--DHAGreen);
        font-weight: 500;
        font-size: 14px;
        text-align: right;
        overflow-wrap: break-word;
      }

      @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-10px);
        }
        60% {
          transform: translateY(-5px);
        }
      }

      .button-group {
        display: flex;
        gap: 15px;
        margin-top: 30px;
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
        min-width: 150px;
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

      @media (max-width: 768px) {
        .main-content {
          padding: 15px;
        }

        input {
          font-size: 14px;
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-control {
          padding: 10px;
          font-size: 16px; /* Prevents zoom on iOS */
        }

        .button-group {
          gap: 10px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px;
          min-width: 0;
        }
      }

      .btn-sign-out {
        background: #e74c3c;
        color: var(--DHAWhite);
        border: none;
        border-radius: 8px;
        padding: 12px 30px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-sign-out:hover {
        background: #c0392b;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
      }

      .sign-out-content {
        text-align: center;
        padding: 20px;
      }

      .warning-icon {
        font-size: 3rem;
        margin-bottom: 20px;
      }

      .sign-out-content h3 {
        color: var(--DHAGreen);
        font-size: 1.5rem;
        margin-bottom: 15px;
        font-weight: 600;
      }

      .sign-out-content p {
        color: var(--DHATextGrayDark);
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      .sign-out-details {
        background: var(--DHAOffWhite);
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
        text-align: left;
      }

      .sign-out-details p {
        margin-bottom: 10px;
        font-weight: 600;
        color: var(--DHAGreen);
      }

      .sign-out-details ul {
        margin: 0;
        padding-left: 20px;
        color: var(--DHATextGrayDark);
      }

      .sign-out-details li {
        margin-bottom: 5px;
        font-size: 0.9rem;
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
export class PersonalInfoComponent implements OnInit {
  verificationForm: FormGroup;
  authData: any;
  currentStep: number = 1;
  showDemoMode: boolean = false;
  stepTitles: string[] = [
    'Sign In',
    'Personal Info',
    'Contact Info',
    'Book Service',
  ];
  showSignOutModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingService
  ) {
    // Form for personal details verification
    this.verificationForm = this.fb.group({
      forenames: ['', Validators.required],
      lastName: ['', Validators.required],
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
    // Get auth data from session storage
    const authDataStr = sessionStorage.getItem('authData');
    if (authDataStr) {
      this.authData = JSON.parse(authDataStr);
    } else {
      // Redirect back to authentication if no auth data
      this.router.navigate(['/authenticate']);
    }

    window.scrollTo(0, 0);

    // Automatically capitalise forenames and lastName
    ['forenames', 'lastName'].forEach((field) => {
      this.verificationForm.get(field)?.valueChanges.subscribe((value) => {
        if (value) {
          const capitalised = this.capitaliseWords(value);
          // Only update if the value actually changed to avoid cursor jump
          if (value !== capitalised) {
            this.verificationForm
              .get(field)
              ?.setValue(capitalised, { emitEvent: false });
          }
        }
      });
    });

    // Check for demo mode
    this.checkDemoMode();
  }

  onVerificationSubmit() {
    if (this.verificationForm.valid) {
      // Capitalise the names before storing/submitting
      const capitalisedData = {
        ...this.verificationForm.value,
        forenames: this.capitaliseWords(this.verificationForm.value.forenames),
        lastName: this.capitaliseWords(this.verificationForm.value.lastName),
      };

      // Merge with authData
      const verificationData = {
        ...this.authData,
        ...capitalisedData,
      };

      console.log(verificationData);
      sessionStorage.setItem(
        'verificationData',
        JSON.stringify(verificationData)
      );

      // Move to step 2 (success message and preview)
      this.currentStep = 2;
    }
  }

  proceedToContact() {
    // Navigate to contact info component
    this.router.navigate(['/contact-info']);
  }

  goBackToVerification() {
    this.currentStep = 1;
  }

  goBack() {
    if (this.currentStep === 1) {
      this.router.navigate(['/authenticate']);
    } else if (this.currentStep === 2) {
      this.goBackToVerification();
    }
  }

  getProgressStep(): number {
    // Map internal steps to progress indicator steps
    // Step 1 (verification) and Step 2 (success) both show as step 2 (Personal Info)
    // Step 3 (contact) shows as step 3 (Contact Info)
    if (this.currentStep === 1 || this.currentStep === 2) {
      return 1; // Personal Info step
    } else if (this.currentStep === 3) {
      return 2; // Contact Info step
    }
    return 1; // Default to Personal Info
  }

  showSignOutConfirmation() {
    this.showSignOutModal = true;
  }

  closeSignOutModal() {
    this.showSignOutModal = false;
  }

  confirmSignOut() {
    // Clear all data using the booking service
    this.bookingService.clearAllData();

    // Close the modal
    this.showSignOutModal = false;

    // Navigate to the authenticate page
    this.router.navigate(['/authenticate']);
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

  fillDemoData() {
    // Fill with realistic South African names
    this.verificationForm.patchValue({
      forenames: 'Thabo Mpho',
      lastName: 'Mthembu',
    });

    // Mark fields as touched to show validation
    Object.keys(this.verificationForm.controls).forEach((key) => {
      this.verificationForm.get(key)?.markAsTouched();
    });
  }
}
