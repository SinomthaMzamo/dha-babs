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

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressIndicatorComponent],
  template: `
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

    <div class="personal-info-container">
      <div class="personal-info-content-wrapper">
        <app-progress-indicator
          [currentStep]="getProgressStep()"
        ></app-progress-indicator>
        <div class="personal-info-card">
          <!-- Step 1: Personal Details Verification -->
          <div *ngIf="currentStep === 1" class="step-section">
            <h2>Verify Personal Information</h2>
            <p class="step-description">
              Please verify your personal details against DHA records
            </p>

            <form
              [formGroup]="verificationForm"
              (ngSubmit)="onVerificationSubmit()"
              autocomplete="on"
            >
              <div class="form-group">
                <label for="idNumber">ID Number</label>
                <input
                  type="text"
                  id="idNumber"
                  [value]="authData?.idNumber || ''"
                  class="form-control"
                  disabled
                  readonly
                />
                <div class="field-info">
                  <small>ID number from previous step</small>
                </div>
              </div>

              <div class="form-group">
                <label for="forenames">Forenames *</label>
                <input
                  type="text"
                  id="forenames"
                  formControlName="forenames"
                  class="form-control"
                  placeholder="Enter your forenames as they appear on your ID"
                  autocomplete="given-name"
                />
                <div
                  *ngIf="
                    verificationForm.get('forenames')?.invalid &&
                    verificationForm.get('forenames')?.touched
                  "
                  class="error-message"
                >
                  Forenames are required
                </div>
              </div>

              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  class="form-control"
                  placeholder="Enter your last name as it appears on your ID"
                  autocomplete="family-name"
                />
                <div
                  *ngIf="
                    verificationForm.get('lastName')?.invalid &&
                    verificationForm.get('lastName')?.touched
                  "
                  class="error-message"
                >
                  Last name is required
                </div>
              </div>

              <div class="button-group">
                <button type="button" (click)="goBack()" class="btn-secondary">
                  Back
                </button>
                <button
                  type="submit"
                  [disabled]="verificationForm.invalid"
                  class="btn-primary"
                >
                  Verify Details
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Verification Success -->
          <div *ngIf="currentStep === 2" class="step-section">
            <div class="success-message">
              <!-- <div class="success-icon">✅</div> -->
              <h2>Verification Successful!</h2>
              <p class="success-description">
                Your personal details have been successfully verified against
                DHA records.
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
              <button
                type="button"
                (click)="goBackToVerification()"
                class="btn-secondary"
              >
                Back to Edit
              </button>
              <button
                type="button"
                (click)="proceedToContact()"
                class="btn-primary"
              >
                Continue to Contact Info
              </button>
            </div>
          </div>

          <!-- Step 3: Contact Information -->
          <div *ngIf="currentStep === 3" class="step-section">
            <h2>Contact Information</h2>
            <p class="step-description">
              Please provide your contact details for appointment notifications
            </p>

            <form
              [formGroup]="contactForm"
              (ngSubmit)="onContactSubmit()"
              autocomplete="on"
            >
              <div class="form-group">
                <label for="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="form-control"
                  placeholder="Enter your email address"
                  autocomplete="email"
                />
                <div
                  *ngIf="
                    contactForm.get('email')?.invalid &&
                    contactForm.get('email')?.touched
                  "
                  class="error-message"
                >
                  <div *ngIf="contactForm.get('email')?.errors?.['required']">
                    Email is required
                  </div>
                  <div *ngIf="contactForm.get('email')?.errors?.['email']">
                    Please enter a valid email address
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  formControlName="phone"
                  class="form-control"
                  placeholder="Enter your phone number"
                  autocomplete="tel"
                />
                <div
                  *ngIf="
                    contactForm.get('phone')?.invalid &&
                    contactForm.get('phone')?.touched
                  "
                  class="error-message"
                >
                  <div *ngIf="contactForm.get('phone')?.errors?.['required']">
                    Phone number is required
                  </div>
                  <div *ngIf="contactForm.get('phone')?.errors?.['pattern']">
                    Please enter a valid phone number
                  </div>
                </div>
              </div>

              <div class="button-group">
                <button
                  type="button"
                  (click)="goBackToSuccess()"
                  class="btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  [disabled]="contactForm.invalid"
                  class="btn-primary"
                >
                  Complete Registration
                </button>
              </div>
            </form>
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
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
      }

      * {
        box-sizing: border-box;
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

      .personal-info-container {
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

      .personal-info-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--step-form-gap);
        width: var(--form-width);
      }

      .personal-info-card {
        background: var(--DHAWhite);
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: var(--form-width);
        height: var(--mobile-form-height);
        overflow-y: auto;
        box-sizing: border-box;
        border: 2px solid var(--DHAWhite);
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
        overflow: hidden;
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
        box-sizing: border-box;
      }

      .form-control:focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-sizing: border-box;
      }

      .form-control:disabled {
        background-color: var(--DHABackGroundLightGray);
        cursor: not-allowed;
        color: var(--DHADisabledTextGray);
        border-color: var(--DividerGray);
        box-sizing: border-box;
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
        word-break: break-all;
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

      @media (max-width: 768px) {
        .main-content {
          padding: 15px;
        }

        .personal-info-container {
          padding: 0 8px;
          margin: 73px 0;
        }

        input {
          font-size: 14px;
        }

        .personal-info-card {
          padding: 20px;
          max-width: 100%;
          height: var(--mobile-form-height);
          overflow-y: auto;
          box-sizing: border-box;
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
          flex-direction: column;
          gap: 10px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px;
        }

        .logo-icon {
          height: 32px;
        }

        .btn-home-top {
          padding: 4px 10px;
          font-size: 12px;
        }
      }
    `,
  ],
})
export class PersonalInfoComponent implements OnInit {
  verificationForm: FormGroup;
  contactForm: FormGroup;
  authData: any;
  currentStep: number = 1;

  constructor(private fb: FormBuilder, private router: Router) {
    // Form for personal details verification
    this.verificationForm = this.fb.group({
      forenames: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    // Form for contact information
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^(\+27|0)[6-8][0-9]{8}$/)],
      ],
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

  onContactSubmit() {
    if (this.contactForm.valid) {
      // Get verification data
      const verificationDataStr = sessionStorage.getItem('verificationData');
      const verificationData = verificationDataStr
        ? JSON.parse(verificationDataStr)
        : {};

      // Combine all data
      const personalData = {
        ...verificationData,
        ...this.contactForm.value,
      };

      // Store complete personal data
      sessionStorage.setItem('personalData', JSON.stringify(personalData));

      // Clean up temporary verification data
      sessionStorage.removeItem('verificationData');

      // Navigate to menu
      this.router.navigate(['/menu']);
    }
  }

  proceedToContact() {
    this.currentStep = 3;
  }

  goBackToVerification() {
    this.currentStep = 1;
  }

  goBackToSuccess() {
    this.currentStep = 2;
  }

  goBack() {
    if (this.currentStep === 1) {
      this.router.navigate(['/authenticate']);
    } else if (this.currentStep === 2) {
      this.goBackToVerification();
    } else {
      this.goBackToSuccess();
    }
  }

  goHome() {
    this.router.navigate(['/']);
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
}
