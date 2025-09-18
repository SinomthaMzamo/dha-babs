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

@Component({
  selector: 'app-edit-contact-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormPageLayoutComponent],
  template: `
    <app-form-page-layout
      [currentStep]="getProgressStep()"
      [steps]="stepTitles"
    >
      <div class="step-section">
        <h2>Edit Contact Information</h2>
        <p class="step-description">
          Update your contact details for appointment notifications
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
            <label for="email" class="floating-label">Email Address *</label>
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
              placeholder="+27"
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

          <div class="form-actions">
            <button type="button" (click)="goBack()" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="contactForm.invalid"
              class="btn-primary"
            >
              Update Contact Info
            </button>
          </div>
        </form>
      </div>
    </app-form-page-layout>
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
        --DHABlack: #000000;
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHAErrorColor: #e74c3c;
        --DHAErrorColorLight: #fdf2f2;
        --DHAErrorColorBorder: #fecaca;
      }

      .step-section {
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
      }

      h2 {
        color: var(--DHAGreen);
        font-size: 2rem;
        margin-bottom: 10px;
        text-align: center;
        font-weight: 700;
      }

      .step-description {
        color: var(--DHATextGrayDark);
        text-align: center;
        margin-bottom: 40px;
        font-size: 1.1rem;
        line-height: 1.5;
      }

      .form-group {
        margin-bottom: 30px;
        position: relative;
      }

      .floating-label-group {
        position: relative;
      }

      .floating-input {
        width: 100%;
        padding: 16px 20px;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        font-size: 16px;
        background: var(--DHAWhite);
        transition: all 0.3s ease;
        box-sizing: border-box;
      }

      .floating-input:focus {
        outline: none;
        border-color: var(--DHAOrange);
        box-shadow: 0 0 0 3px rgba(243, 128, 31, 0.1);
      }

      .floating-input.has-value,
      .floating-input:focus {
        padding-top: 24px;
        padding-bottom: 8px;
      }

      .floating-label {
        position: absolute;
        left: 20px;
        top: 16px;
        color: var(--DHATextGray);
        font-size: 16px;
        transition: all 0.3s ease;
        pointer-events: none;
        background: var(--DHAWhite);
        padding: 0 4px;
      }

      .floating-input.has-value + .floating-label,
      .floating-input:focus + .floating-label {
        top: -8px;
        font-size: 12px;
        color: var(--DHAOrange);
        font-weight: 500;
      }

      .error-message {
        color: var(--DHAErrorColor);
        font-size: 14px;
        margin-top: 8px;
        padding: 8px 12px;
        background: var(--DHAErrorColorLight);
        border: 1px solid var(--DHAErrorColorBorder);
        border-radius: 8px;
      }

      .form-actions {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 40px;
        flex-wrap: wrap;
      }

      .btn-primary,
      .btn-secondary {
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        min-width: 140px;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--DHAHoverGreen);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(1, 102, 53, 0.3);
      }

      .btn-primary:disabled {
        background: var(--DHATextGray);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .btn-secondary {
        background: var(--DHAWhite);
        color: var(--DHAGreen);
        border: 2px solid var(--DHAGreen);
      }

      .btn-secondary:hover {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(1, 102, 53, 0.3);
      }

      @media (max-width: 768px) {
        .step-section {
          padding: 15px;
        }

        h2 {
          font-size: 1.6rem;
        }

        .step-description {
          font-size: 1rem;
          margin-bottom: 30px;
        }

        .form-actions {
          flex-direction: column;
          align-items: center;
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
          max-width: 300px;
        }
      }
    `,
  ],
})
export class EditContactInfoComponent implements OnInit {
  contactForm: FormGroup;
  personalData: any;
  stepTitles: string[] = ['Edit Contact Info'];

  constructor(private fb: FormBuilder, private router: Router) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^(\+27|0)[0-9]{9}$/)],
      ],
    });
  }

  ngOnInit() {
    // Load existing personal data from session storage
    const personalDataStr = sessionStorage.getItem('personalData');
    if (personalDataStr) {
      this.personalData = JSON.parse(personalDataStr);

      // Pre-populate the form with existing data
      this.contactForm.patchValue({
        email: this.personalData.email || '',
        phone: this.personalData.phone || '',
      });
    } else {
      // If no personal data found, redirect to authenticate
      this.router.navigate(['/authenticate']);
      return;
    }

    window.scrollTo(0, 0);
  }

  getProgressStep(): number {
    return 1; // Single step for editing contact info
  }

  onContactSubmit() {
    if (this.contactForm.valid) {
      // Update the existing personal data with new contact info
      const updatedPersonalData = {
        ...this.personalData,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone,
      };

      // 1. Update personalData in session storage
      sessionStorage.setItem(
        'personalData',
        JSON.stringify(updatedPersonalData)
      );

      // 2. Update confirmedAppointment if it exists
      const confirmedAppointmentStr = sessionStorage.getItem(
        'confirmedAppointment'
      );
      if (confirmedAppointmentStr) {
        const confirmedAppointment = JSON.parse(confirmedAppointmentStr);
        confirmedAppointment.personalData = updatedPersonalData;
        sessionStorage.setItem(
          'confirmedAppointment',
          JSON.stringify(confirmedAppointment)
        );
      }

      // 3. Update ID-specific appointment if it exists
      const idSpecificAppointmentStr = sessionStorage.getItem(
        `appointment_${this.personalData.idNumber}`
      );
      if (idSpecificAppointmentStr) {
        const idSpecificAppointment = JSON.parse(idSpecificAppointmentStr);
        idSpecificAppointment.personalData = updatedPersonalData;
        sessionStorage.setItem(
          `appointment_${this.personalData.idNumber}`,
          JSON.stringify(idSpecificAppointment)
        );
      }

      // Navigate back to menu
      this.router.navigate(['/menu']);
    }
  }

  goBack() {
    // Navigate back to menu without saving changes
    this.router.navigate(['/menu']);
  }
}
