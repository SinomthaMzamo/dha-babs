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
import { NavbarComponent } from "../shared/navbar/navbar.component";

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressIndicatorComponent,
    NavbarComponent,
  ],
  template: `
    <div class="contact-info-container">
      <app-navbar></app-navbar>
      <div class="contact-info-content-wrapper">
        <app-progress-indicator
          [currentStep]="getProgressStep()"
        ></app-progress-indicator>
        <div class="contact-info-card">
          <div class="step-section">
            <h2>Contact Information</h2>
            <p class="step-description">
              Please provide your contact details for appointment notifications
            </p>

            <form
              [formGroup]="contactForm"
              (ngSubmit)="onContactSubmit()"
              autocomplete="on"
            >
              <div class="form-group floating-label-group">
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="floating-input"
                  autocomplete="email"
                  [class.has-value]="contactForm.get('email')?.value"
                />
                <label for="email" class="floating-label"
                  >Email Address *</label
                >
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

              <div class="form-group floating-label-group">
                <input
                  type="tel"
                  id="phone"
                  formControlName="phone"
                  class="floating-input"
                  autocomplete="tel"
                  [class.has-value]="contactForm.get('phone')?.value"
                />
                <label for="phone" class="floating-label">Phone Number *</label>
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
                <button type="button" (click)="goBack()" class="btn-secondary">
                  Back
                </button>
                <button
                  type="submit"
                  [disabled]="contactForm.invalid"
                  class="btn-primary"
                >
                  Submit
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

      .contact-info-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 73px);
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding: 20px;
        height: 100vh;
      }

      .contact-info-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--step-form-gap);
        width: var(--form-width);
      }

      .contact-info-card {
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

      .floating-input:focus,
      .floating-input.has-value {
        padding: 16px 12px;
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

        .contact-info-container {
          padding: 0 8px;
          margin-top: 73px 0;
        }

        input {
          font-size: 14px;
        }

        .contact-info-card {
          padding: 20px;
          max-width: 100%;
          height: var(--mobile-form-height);
          overflow-y: auto;
          box-sizing: border-box;
          max-height: calc(100vh - 150px);
        }

        .contact-info-content-wrapper {
          margin-top: 150px;
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
    `,
  ],
})
export class ContactInfoComponent implements OnInit {
  contactForm: FormGroup;
  personalData: any;

  constructor(private fb: FormBuilder, private router: Router) {
    // Form for contact information
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^(\+27|0)[6-8][0-9]{8}$/)],
      ],
    });
  }

  ngOnInit() {
    // Load data from session storage - check both verificationData and personalData
    const verificationDataStr = sessionStorage.getItem('verificationData');
    const personalDataStr = sessionStorage.getItem('personalData');

    if (verificationDataStr) {
      // Coming from personal-info component
      this.personalData = JSON.parse(verificationDataStr);
    } else if (personalDataStr) {
      // Coming from menu (back to contact info)
      this.personalData = JSON.parse(personalDataStr);
    } else {
      // If no data found, redirect to authenticate
      this.router.navigate(['/authenticate']);
      return;
    }

    // Pre-fill form if data exists
    if (this.personalData.email) {
      this.contactForm.patchValue({
        email: this.personalData.email,
        phone: this.personalData.phone,
      });
    }
  }

  getProgressStep(): number {
    return 2; // Contact info is step 3
  }

  onContactSubmit() {
    if (this.contactForm.valid) {
      // Combine existing data with contact info
      const completePersonalData = {
        ...this.personalData,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone,
      };

      // Save to session storage
      sessionStorage.setItem(
        'personalData',
        JSON.stringify(completePersonalData)
      );

      // Clean up temporary verification data if it exists
      sessionStorage.removeItem('verificationData');

      // Navigate to menu
      this.router.navigate(['/menu']);
    }
  }

  goBack() {
    // Navigate back to personal info verification
    this.router.navigate(['/personal-info']);
  }
}
