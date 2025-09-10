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
  selector: 'app-contact-info',
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

    <div class="contact-info-container">
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

      .contact-info-container {
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

        .contact-info-container {
          padding: 0 8px;
          margin: 73px 0;
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

  goHome() {
    this.router.navigate(['/']);
  }
}
