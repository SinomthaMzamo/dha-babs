import { Component } from '@angular/core';
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
  selector: 'app-authenticate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressIndicatorComponent],
  template: `
    <div class="top-bar">
      <div class="top-bar-content">
        <div class="logo-section">
          <img src="/logo.png" alt="DHA Logo" class="logo-icon" />
          <span class="logo-text">DHA Online Booking</span>
        </div>
        <button type="button" (click)="goHome()" class="btn-home-top">
          🏠 Return Home
        </button>
      </div>
    </div>

    <div class="auth-container">
      <div class="auth-card">
        <app-progress-indicator [currentStep]="0"></app-progress-indicator>
        <h2>Sign In</h2>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="idType">ID Type *</label>
            <select id="idType" formControlName="idType" class="form-control">
              <option value="">Select ID Type</option>
              <option value="id">ID Number</option>
              <option value="passport">Passport Number</option>
            </select>
            <div
              *ngIf="
                authForm.get('idType')?.invalid &&
                authForm.get('idType')?.touched
              "
              class="error-message"
            >
              Please select an ID type
            </div>
          </div>

          <div class="form-group">
            <label for="idNumber">ID Number *</label>
            <input
              type="text"
              id="idNumber"
              formControlName="idNumber"
              class="form-control"
              placeholder="Enter 13-digit ID number"
              maxlength="13"
            />
            <div
              *ngIf="
                authForm.get('idNumber')?.invalid &&
                authForm.get('idNumber')?.touched
              "
              class="error-message"
            >
              <div *ngIf="authForm.get('idNumber')?.errors?.['required']">
                ID number is required
              </div>
              <div *ngIf="authForm.get('idNumber')?.errors?.['pattern']">
                ID number must be exactly 13 digits
              </div>
            </div>
          </div>

          <div class="button-group">
            <button
              type="submit"
              [disabled]="authForm.invalid"
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
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
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
        height: 32px;
        width: auto;
        object-fit: contain;
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

      .auth-container {
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

      .auth-card {
        background: var(--DHAWhite);
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 500px;
      }

      h2 {
        text-align: center;
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 28px;
        font-weight: 600;
      }

      .form-group {
        margin-bottom: 20px;
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
      }

      .error-message {
        color: var(--DHAErrorColor);
        font-size: 14px;
        margin-top: 5px;
      }

      .button-group {
        display: flex;
        justify-content: center;
        margin-top: 30px;
      }

      .btn-primary {
        padding: 14px 40px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
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
    `,
  ],
})
export class AuthenticateComponent {
  authForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.authForm = this.fb.group({
      idType: ['', Validators.required],
      idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    });
  }

  onSubmit() {
    if (this.authForm.valid) {
      // Store authentication data in session storage
      sessionStorage.setItem('authData', JSON.stringify(this.authForm.value));

      // Navigate to next step
      this.router.navigate(['/personal-info']);
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
