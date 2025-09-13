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
  selector: 'app-authenticate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressIndicatorComponent,
    NavbarComponent,
  ],
  template: `
    <div class="auth-container">
      <app-navbar></app-navbar>
      <div class="auth-content-wrapper">
        <app-progress-indicator [currentStep]="0"></app-progress-indicator>
        <div class="auth-card">
          <h2>Sign In</h2>
          <p class="step-description">
            Please note that this service is only available for individuals who
            have a South African ID Number or a Passport registered on our
            system.
          </p>
          <form
            [formGroup]="authForm"
            (ngSubmit)="onSubmit()"
            autocomplete="on"
          >
            <div class="form-group floating-label-group">
              <select
                id="idType"
                formControlName="idType"
                class="floating-input"
                [class.has-value]="authForm.get('idType')?.value"
              >
                <option value=""></option>
                <option value="id">ID Number</option>
                <option value="passport">Passport Number</option>
              </select>
              <label for="idType" class="floating-label">ID Type *</label>
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

            <div class="form-group floating-label-group">
              <input
                type="text"
                id="idNumber"
                formControlName="idNumber"
                class="floating-input"
                maxlength="13"
                autocomplete="username"
                [class.has-value]="authForm.get('idNumber')?.value"
              />
              <label for="idNumber" class="floating-label">ID Number *</label>
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
                Sign In
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

      .auth-container {
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
        position: relative;
      }

      .auth-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--step-form-gap);
        width: var(--form-width);
      }

      .auth-card {
        background: var(--DHAWhite);
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 100%;
        box-sizing: border-box;
        height: var(--mobile-form-height);
      }

      h2 {
        text-align: center;
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 28px;
        font-weight: 600;
      }

      .step-description {
        color: var(--DHATextGray);
        font-size: 14px;
        margin-bottom: 30px;
        line-height: 1.5;
        text-align: left;
      }

      .form-group {
        margin-bottom: 20px;
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

      /* Special handling for select elements */
      .floating-input[type='select-one'],
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
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        min-width: 150px;
        width: 100%;
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

      @media (max-width: 768px) {
        .auth-container {
          padding: 0 8px;
          margin-top: 73px;
        }
        .auth-card {
          padding: 20px;
          height: var(--mobile-form-height);
          overflow-y: auto;
          box-sizing: border-box;
        }
      }
    `,
  ],
})
export class AuthenticateComponent implements OnInit {
  authForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.authForm = this.fb.group({
      idType: ['', Validators.required],
      idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    });
  }
  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);
  }

  onSubmit() {
    if (this.authForm.valid) {
      // Store authentication data in session storage
      sessionStorage.setItem('authData', JSON.stringify(this.authForm.value));

      // Navigate to next step
      this.router.navigate(['/personal-info']);
    }
  }
}
