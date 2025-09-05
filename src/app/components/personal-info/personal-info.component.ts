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
          <span class="logo-icon">🏛️</span>
          <span class="logo-text">DHA Online Booking</span>
        </div>
        <button type="button" (click)="goHome()" class="btn-home-top">
          🏠 Return Home
        </button>
      </div>
    </div>

    <div class="personal-info-container">
      <div class="personal-info-card">
        <app-progress-indicator [currentStep]="1"></app-progress-indicator>
        <h2>Personal Information</h2>

        <form [formGroup]="personalInfoForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="forenames">Forenames *</label>
            <input
              type="text"
              id="forenames"
              formControlName="forenames"
              class="form-control"
              placeholder="Enter your forenames"
            />
            <div
              *ngIf="
                personalInfoForm.get('forenames')?.invalid &&
                personalInfoForm.get('forenames')?.touched
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
              placeholder="Enter your last name"
            />
            <div
              *ngIf="
                personalInfoForm.get('lastName')?.invalid &&
                personalInfoForm.get('lastName')?.touched
              "
              class="error-message"
            >
              Last name is required
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email address"
            />
            <div
              *ngIf="
                personalInfoForm.get('email')?.invalid &&
                personalInfoForm.get('email')?.touched
              "
              class="error-message"
            >
              <div *ngIf="personalInfoForm.get('email')?.errors?.['required']">
                Email is required
              </div>
              <div *ngIf="personalInfoForm.get('email')?.errors?.['email']">
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
            />
            <div
              *ngIf="
                personalInfoForm.get('phone')?.invalid &&
                personalInfoForm.get('phone')?.touched
              "
              class="error-message"
            >
              <div *ngIf="personalInfoForm.get('phone')?.errors?.['required']">
                Phone number is required
              </div>
              <div *ngIf="personalInfoForm.get('phone')?.errors?.['pattern']">
                Please enter a valid phone number
              </div>
            </div>
          </div>

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

          <div class="button-group">
            <button type="button" (click)="goBack()" class="btn-secondary">
              Back
            </button>
            <button
              type="submit"
              [disabled]="personalInfoForm.invalid"
              class="btn-primary"
            >
              Continue
            </button>
          </div>
        </form>
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

      * {
        box-sizing: border-box;
      }

      .top-bar {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 15px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
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
        font-size: 24px;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--DHAWhite);
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

      .personal-info-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 70px);
        background: var(--DHABackGroundLightGray);
        padding: 20px;
      }

      .personal-info-card {
        background: var(--DHAWhite);
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 600px;
        border: 2px solid var(--DHAGreen);
      }

      h2 {
        text-align: center;
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 600;
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

        .personal-info-card {
          padding: 20px;
          max-width: 100%;
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
      }
    `,
  ],
})
export class PersonalInfoComponent implements OnInit {
  personalInfoForm: FormGroup;
  authData: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.personalInfoForm = this.fb.group({
      forenames: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^(\+27|0)[6-8][0-9]{8}$/)],
      ],
    });
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
  }

  onSubmit() {
    if (this.personalInfoForm.valid) {
      // Store personal info data in session storage
      const personalData = {
        ...this.authData,
        ...this.personalInfoForm.value,
      };
      sessionStorage.setItem('personalData', JSON.stringify(personalData));

      // Navigate to menu instead of directly to book service
      this.router.navigate(['/menu']);
    }
  }

  goBack() {
    this.router.navigate(['/authenticate']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
