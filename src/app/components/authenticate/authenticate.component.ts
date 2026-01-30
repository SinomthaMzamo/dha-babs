import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FormPageLayoutComponent } from '../shared/form-page-layout/form-page-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

interface Country {
  code: string;
  name: string;
}

@Component({
  selector: 'app-authenticate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormPageLayoutComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <app-form-page-layout [currentStep]="0" [steps]="stepTitles">
      <h2>Sign In</h2>
      <p class="step-description">
        Please note that this service is only available for individuals who have
        a South African ID Number or a Passport registered on our system.
      </p>
      <form [formGroup]="authForm" (ngSubmit)="onSubmit()" autocomplete="off">
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
              authForm.get('idType')?.invalid && authForm.get('idType')?.touched
            "
            class="error-message"
          >
            <span class="fas fa-exclamation-circle"></span>
            Please select an ID type
          </div>
        </div>

        <!-- ID Number Field (shown when ID is selected) -->
        <div
          class="form-group floating-label-group"
          *ngIf="authForm.get('idType')?.value === 'id'"
        >
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
            <div
              *ngIf="authForm.get('idNumber')?.errors?.['required']"
              class="error-message-container"
            >
              <span class="fas fa-exclamation-circle"></span>
              ID number is required
            </div>
            <div
              *ngIf="authForm.get('idNumber')?.errors?.['pattern']"
              class="error-message-container"
            >
              <span class="fas fa-times"></span>
              ID number must be exactly 13 digits
            </div>
          </div>
        </div>

        <!-- Country Dropdown (shown when Passport is selected) -->
        <div
          class="form-group floating-label-group"
          *ngIf="authForm.get('idType')?.value === 'passport'"
        >
          <div class="searchable-dropdown">
            <input
              type="text"
              id="countrySearch"
              class="floating-input"
              placeholder=""
              [ngModel]="getDisplayValue()"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="onSearchInputChange($event)"
              (focus)="onCountryInputFocus()"
              [class.has-value]="selectedCountry"
              autocomplete="off"
            />
            <label for="countrySearch" class="floating-label">Country *</label>
            <div class="dropdown-controls">
              <div
                class="clear-button"
                *ngIf="selectedCountry"
                (click)="clearCountrySelection()"
                title="Clear selection"
              >
                <i class="fas fa-times"></i>
              </div>
              <div class="dropdown-arrow" (click)="toggleCountryDropdown()">
                <i
                  class="fas fa-chevron-down"
                  [class.rotated]="showCountryDropdown"
                ></i>
              </div>
            </div>

            <!-- Country Dropdown List -->
            <div
              class="dropdown-list"
              *ngIf="showCountryDropdown && filteredCountries.length > 0"
            >
              <div
                *ngFor="let country of filteredCountries"
                class="dropdown-item"
                (click)="selectCountry(country)"
              >
                {{ country.name }}
              </div>
            </div>

            <!-- No results message -->
            <div
              class="dropdown-list no-results"
              *ngIf="
                showCountryDropdown &&
                filteredCountries.length === 0 &&
                countrySearchTerm
              "
            >
              <div class="dropdown-item">No countries found</div>
            </div>
          </div>

          <div
            *ngIf="
              authForm.get('country')?.invalid &&
              authForm.get('country')?.touched
            "
            class="error-message"
          >
            <div
              *ngIf="authForm.get('country')?.errors?.['required']"
              class="error-message-container"
            >
              <span class="fas fa-exclamation-circle"></span>
              Please select a country
            </div>
          </div>
        </div>

        <!-- Passport Number Field (shown when Passport is selected) -->
        <div
          class="form-group floating-label-group"
          *ngIf="authForm.get('idType')?.value === 'passport'"
        >
          <input
            type="text"
            id="passportNumber"
            formControlName="passportNumber"
            class="floating-input"
            maxlength="20"
            autocomplete="username"
            [class.has-value]="authForm.get('passportNumber')?.value"
            placeholder=""
          />
          <label for="passportNumber" class="floating-label"
            >Passport Number *</label
          >
          <div
            *ngIf="
              authForm.get('passportNumber')?.invalid &&
              authForm.get('passportNumber')?.touched
            "
            class="error-message"
          >
            <div
              *ngIf="authForm.get('passportNumber')?.errors?.['required']"
              class="error-message-container"
            >
              <span class="fas fa-exclamation-circle"></span>
              Passport number is required
            </div>
            <div
              *ngIf="authForm.get('passportNumber')?.errors?.['pattern']"
              class="error-message-container"
            >
              <span class="fas fa-times"></span>
              Please enter a valid passport number
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
    </app-form-page-layout>
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
        --DHAGrayLight: gainsboro;
      }

      /* Change floating label color when active */
      .mat-form-field.mat-focused .mat-form-field-label {
        color: var(--DHAGreen) !important;
        font-weight: 600;
      }

      /* Label inside before float */
      .mat-form-field-label {
        color: var(--DHATextGray);
        font-weight: 600;
      }

      /* Optional: custom float position */
      .mat-form-field-appearance-fill .mat-form-field-label {
        transform: translateY(-1.3em) scale(0.75); /* adjust float height */
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
        color: var(--DHAGreen)
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

      /* Searchable Dropdown Styles */
      .searchable-dropdown {
        position: relative;
        width: 100%;
      }

      .dropdown-controls {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 4px;
        z-index: 2;
      }

      .clear-button {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--DHATextGray);
        color: var(--DHAWhite);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 10px;
      }

      .clear-button:hover {
        background: var(--DHARed);
        transform: scale(1.1);
      }

      .dropdown-arrow {
        color: var(--DHATextGray);
        cursor: pointer;
        transition: transform 0.3s ease;
        padding: 4px;
      }

      .dropdown-arrow i {
        font-size: 14px;
      }

      .dropdown-arrow i.rotated {
        transform: rotate(180deg);
      }

      .dropdown-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--DHAWhite);
        border: 1px solid var(--DividerGray);
        border-top: none;
        border-radius: 0 0 6px 6px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .dropdown-item {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
        transition: background-color 0.2s ease;
        font-size: 14px;
        color: var(--DHATextGrayDark);
      }

      .dropdown-item:last-child {
        border-bottom: none;
      }

      .dropdown-item:hover {
        background-color: var(--DHABackGroundLightGray);
      }

      .dropdown-list.no-results .dropdown-item {
        color: var(--DHATextGray);
        font-style: italic;
        cursor: default;
      }

      .dropdown-list.no-results .dropdown-item:hover {
        background-color: transparent;
      }

      /* Custom scrollbar for dropdown */
      .dropdown-list::-webkit-scrollbar {
        width: 6px;
      }

      .dropdown-list::-webkit-scrollbar-track {
        background: var(--DHABackGroundLightGray);
      }

      .dropdown-list::-webkit-scrollbar-thumb {
        background: var(--DHATextGray);
        border-radius: 3px;
      }

      .dropdown-list::-webkit-scrollbar-thumb:hover {
        background: var(--DHATextGrayDark);
      }

      .demo-section {
        margin-top: 20px;
        text-align: center;
      }

      .modal-demo-content {
        h4 {
          color: var(--DHAGreen);
          margin-bottom: 16px;
        }

        p {
          margin-bottom: 12px;
          color: var(--DHATextGrayDark);
        }

        ul {
          margin-bottom: 20px;
          padding-left: 20px;

          li {
            margin-bottom: 8px;
            color: var(--DHATextGrayDark);
          }
        }

        .form-group {
          margin-bottom: 16px;

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--DHAGreen);
          }

          .form-input,
          .form-select {
            width: 100%;
            padding: 12px;
            border: 2px solid var(--DHAGrayLight);
            border-radius: 6px;
            font-size: 16px;
            background-color: var(--DHAWhite);
            transition: border-color 0.3s ease;
            /* iOS Safari zoom prevention */
            -webkit-appearance: none;
            -webkit-tap-highlight-color: transparent;
            min-height: 44px;
            box-sizing: border-box;

            &:focus {
              outline: none;
              border-color: var(--DHAGreen);
              box-shadow: 0 0 0 3px rgba(1, 102, 53, 0.1);
              /* Additional iOS Safari focus fixes */
              -webkit-appearance: none;
              transform: translateZ(0);
            }
          }

          /* Specific iOS Safari input zoom prevention */
          @supports (-webkit-touch-callout: none) {
            .form-input,
            .form-select {
              font-size: 16px !important;
              -webkit-text-size-adjust: 100%;
              -webkit-user-select: text;
            }
          }
        }
      }
    `,
  ],
})
export class AuthenticateComponent implements OnInit {
  authForm: FormGroup;
  showDemoModal: boolean = false;
  stepTitles: string[] = [
    'Sign In',
    'Personal Info',
    'Contact Info',
    'Book Service',
  ];

  // Country dropdown properties
  countries: Country[] = []; // is this what we initialise?
  filteredCountries: Country[] = [];
  selectedCountry: Country | null = null;
  countrySearchTerm: string = '';
  showCountryDropdown: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.authForm = this.fb.group({
      idType: ['', Validators.required],
      idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      country: ['', Validators.required],
      passportNumber: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z0-9]{6,20}$/)],
      ],
    });

    this.initializeCountries();
  }

  displayValue() {
    return this.selectedCountry?.name || this.countrySearchTerm;
  }

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    // Watch for ID type changes to update validation
    this.authForm.get('idType')?.valueChanges.subscribe((value) => {
      this.updateFormValidation(value);
    });
  }

  initializeCountries() {
    // Initialize with comprehensive list of countries, prioritizing African and West Asian countries
    this.countries = [
      // African Countries (All 54 countries)
      { code: 'DZ', name: 'Algeria' },
      { code: 'AO', name: 'Angola' },
      { code: 'BJ', name: 'Benin' },
      { code: 'BW', name: 'Botswana' },
      { code: 'BF', name: 'Burkina Faso' },
      { code: 'BI', name: 'Burundi' },
      { code: 'CV', name: 'Cape Verde' },
      { code: 'CM', name: 'Cameroon' },
      { code: 'CF', name: 'Central African Republic' },
      { code: 'TD', name: 'Chad' },
      { code: 'KM', name: 'Comoros' },
      { code: 'CG', name: 'Republic of the Congo' },
      { code: 'CD', name: 'Democratic Republic of the Congo' },
      { code: 'CI', name: "Côte d'Ivoire" },
      { code: 'DJ', name: 'Djibouti' },
      { code: 'EG', name: 'Egypt' },
      { code: 'GQ', name: 'Equatorial Guinea' },
      { code: 'ER', name: 'Eritrea' },
      { code: 'SZ', name: 'Eswatini' },
      { code: 'ET', name: 'Ethiopia' },
      { code: 'GA', name: 'Gabon' },
      { code: 'GM', name: 'Gambia' },
      { code: 'GH', name: 'Ghana' },
      { code: 'GN', name: 'Guinea' },
      { code: 'GW', name: 'Guinea-Bissau' },
      { code: 'KE', name: 'Kenya' },
      { code: 'LS', name: 'Lesotho' },
      { code: 'LR', name: 'Liberia' },
      { code: 'LY', name: 'Libya' },
      { code: 'MG', name: 'Madagascar' },
      { code: 'MW', name: 'Malawi' },
      { code: 'ML', name: 'Mali' },
      { code: 'MR', name: 'Mauritania' },
      { code: 'MU', name: 'Mauritius' },
      { code: 'MA', name: 'Morocco' },
      { code: 'MZ', name: 'Mozambique' },
      { code: 'NA', name: 'Namibia' },
      { code: 'NE', name: 'Niger' },
      { code: 'NG', name: 'Nigeria' },
      { code: 'RW', name: 'Rwanda' },
      { code: 'ST', name: 'São Tomé and Príncipe' },
      { code: 'SN', name: 'Senegal' },
      { code: 'SC', name: 'Seychelles' },
      { code: 'SL', name: 'Sierra Leone' },
      { code: 'SO', name: 'Somalia' },
      { code: 'ZA', name: 'South Africa' },
      { code: 'SS', name: 'South Sudan' },
      { code: 'SD', name: 'Sudan' },
      { code: 'TZ', name: 'Tanzania' },
      { code: 'TG', name: 'Togo' },
      { code: 'TN', name: 'Tunisia' },
      { code: 'UG', name: 'Uganda' },
      { code: 'ZM', name: 'Zambia' },
      { code: 'ZW', name: 'Zimbabwe' },

      // West Asian Countries (Middle East)
      { code: 'AF', name: 'Afghanistan' },
      { code: 'AM', name: 'Armenia' },
      { code: 'AZ', name: 'Azerbaijan' },
      { code: 'BH', name: 'Bahrain' },
      { code: 'CY', name: 'Cyprus' },
      { code: 'GE', name: 'Georgia' },
      { code: 'IR', name: 'Iran' },
      { code: 'IQ', name: 'Iraq' },
      { code: 'IL', name: 'Israel' },
      { code: 'JO', name: 'Jordan' },
      { code: 'KW', name: 'Kuwait' },
      { code: 'LB', name: 'Lebanon' },
      { code: 'OM', name: 'Oman' },
      { code: 'PS', name: 'Palestine' },
      { code: 'QA', name: 'Qatar' },
      { code: 'SA', name: 'Saudi Arabia' },
      { code: 'SY', name: 'Syria' },
      { code: 'TR', name: 'Turkey' },
      { code: 'AE', name: 'United Arab Emirates' },
      { code: 'YE', name: 'Yemen' },

      // Other Major Countries
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' },
      { code: 'NZ', name: 'New Zealand' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'IT', name: 'Italy' },
      { code: 'ES', name: 'Spain' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'BE', name: 'Belgium' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'AT', name: 'Austria' },
      { code: 'SE', name: 'Sweden' },
      { code: 'NO', name: 'Norway' },
      { code: 'DK', name: 'Denmark' },
      { code: 'FI', name: 'Finland' },
      { code: 'IE', name: 'Ireland' },
      { code: 'PT', name: 'Portugal' },
      { code: 'GR', name: 'Greece' },
      { code: 'PL', name: 'Poland' },
      { code: 'CZ', name: 'Czech Republic' },
      { code: 'HU', name: 'Hungary' },
      { code: 'RO', name: 'Romania' },
      { code: 'BG', name: 'Bulgaria' },
      { code: 'HR', name: 'Croatia' },
      { code: 'SI', name: 'Slovenia' },
      { code: 'SK', name: 'Slovakia' },
      { code: 'LT', name: 'Lithuania' },
      { code: 'LV', name: 'Latvia' },
      { code: 'EE', name: 'Estonia' },
      { code: 'JP', name: 'Japan' },
      { code: 'KR', name: 'South Korea' },
      { code: 'CN', name: 'China' },
      { code: 'IN', name: 'India' },
      { code: 'PK', name: 'Pakistan' },
      { code: 'BD', name: 'Bangladesh' },
      { code: 'LK', name: 'Sri Lanka' },
      { code: 'MV', name: 'Maldives' },
      { code: 'NP', name: 'Nepal' },
      { code: 'BT', name: 'Bhutan' },
      { code: 'MM', name: 'Myanmar' },
      { code: 'TH', name: 'Thailand' },
      { code: 'LA', name: 'Laos' },
      { code: 'KH', name: 'Cambodia' },
      { code: 'VN', name: 'Vietnam' },
      { code: 'MY', name: 'Malaysia' },
      { code: 'SG', name: 'Singapore' },
      { code: 'ID', name: 'Indonesia' },
      { code: 'PH', name: 'Philippines' },
      { code: 'BN', name: 'Brunei' },
      { code: 'TL', name: 'East Timor' },
      { code: 'BR', name: 'Brazil' },
      { code: 'AR', name: 'Argentina' },
      { code: 'MX', name: 'Mexico' },
      { code: 'CL', name: 'Chile' },
      { code: 'PE', name: 'Peru' },
      { code: 'CO', name: 'Colombia' },
      { code: 'VE', name: 'Venezuela' },
      { code: 'EC', name: 'Ecuador' },
      { code: 'UY', name: 'Uruguay' },
      { code: 'PY', name: 'Paraguay' },
      { code: 'BO', name: 'Bolivia' },
      { code: 'GY', name: 'Guyana' },
      { code: 'SR', name: 'Suriname' },
      { code: 'RU', name: 'Russia' },
      { code: 'UA', name: 'Ukraine' },
      { code: 'BY', name: 'Belarus' },
      { code: 'MD', name: 'Moldova' },
      { code: 'KZ', name: 'Kazakhstan' },
      { code: 'UZ', name: 'Uzbekistan' },
      { code: 'TM', name: 'Turkmenistan' },
      { code: 'TJ', name: 'Tajikistan' },
      { code: 'KG', name: 'Kyrgyzstan' },
      { code: 'MN', name: 'Mongolia' },
    ];

    // Sort countries alphabetically by name
    this.countries.sort((a, b) => a.name.localeCompare(b.name));
    this.filteredCountries = [...this.countries];
  }

  updateFormValidation(idType: string) {
    if (idType === 'id') {
      // Clear passport fields and set ID validation
      this.authForm.get('country')?.clearValidators();
      this.authForm.get('passportNumber')?.clearValidators();
      this.authForm
        .get('idNumber')
        ?.setValidators([Validators.required, Validators.pattern(/^\d{13}$/)]);
    } else if (idType === 'passport') {
      // Clear ID field and set passport validation
      this.authForm.get('idNumber')?.clearValidators();
      this.authForm.get('country')?.setValidators([Validators.required]);
      this.authForm
        .get('passportNumber')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^[A-Z0-9]{6,20}$/),
        ]);
    }

    // Update validation for all fields
    this.authForm.get('idNumber')?.updateValueAndValidity();
    this.authForm.get('country')?.updateValueAndValidity();
    this.authForm.get('passportNumber')?.updateValueAndValidity();
  }

  filterCountries() {
    if (!this.countrySearchTerm || this.countrySearchTerm.trim() === '') {
      this.filteredCountries = [...this.countries];
    } else {
      const searchTerm = this.countrySearchTerm.toLowerCase().trim();
      this.filteredCountries = this.countries.filter((country) => {
        const countryName = country.name.toLowerCase();
        // Search by full name or partial matches
        return (
          countryName.includes(searchTerm) ||
          countryName.startsWith(searchTerm) ||
          // Also search by common alternative names
          this.getAlternativeNames(country.name).some((alt) =>
            alt.toLowerCase().includes(searchTerm)
          )
        );
      });
    }
  }

  getAlternativeNames(countryName: string): string[] {
    // Add common alternative names for better search
    const alternatives: { [key: string]: string[] } = {
      'United States': ['USA', 'US', 'America'],
      'United Kingdom': ['UK', 'Britain', 'Great Britain'],
      'South Africa': ['SA', 'RSA'],
      'United Arab Emirates': ['UAE', 'Emirates'],
      'Saudi Arabia': ['KSA'],
      'South Korea': ['Korea'],
      'North Korea': ['DPRK'],
      'Democratic Republic of the Congo': ['DRC', 'Congo-Kinshasa'],
      'Republic of the Congo': ['Congo-Brazzaville'],
      "Côte d'Ivoire": ['Ivory Coast'],
      Eswatini: ['Swaziland'],
      'East Timor': ['Timor-Leste'],
      Myanmar: ['Burma'],
      'Czech Republic': ['Czechia'],
      Macedonia: ['North Macedonia'],
    };
    return alternatives[countryName] || [];
  }

  selectCountry(country: Country) {
    this.selectedCountry = country;
    this.countrySearchTerm = country.name;
    this.authForm.get('country')?.setValue(country.code);
    this.showCountryDropdown = false;
    // Mark the field as touched to show validation
    this.authForm.get('country')?.markAsTouched();
    // Update the filtered countries to show the selected country
    this.filteredCountries = [country];
  }

  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
    if (this.showCountryDropdown) {
      // Show all countries when dropdown is opened
      this.filteredCountries = [...this.countries];
      // Focus the input when dropdown opens
      setTimeout(() => {
        const input = document.getElementById(
          'countrySearch'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.searchable-dropdown');

    // Close dropdown if click is outside the dropdown
    if (dropdown && !dropdown.contains(target)) {
      this.showCountryDropdown = false;
    }
  }

  onCountryInputFocus() {
    this.showCountryDropdown = true;
  }

  clearCountrySelection() {
    this.selectedCountry = null;
    this.countrySearchTerm = '';
    this.authForm.get('country')?.setValue('');
    this.filterCountries();
  }

  getDisplayValue(): string {
    if (this.selectedCountry) {
      return this.selectedCountry.name;
    }
    return this.countrySearchTerm;
  }

  onSearchInputChange(value: string) {
    this.countrySearchTerm = value;
    // If user is typing and it doesn't match the selected country, clear selection
    if (this.selectedCountry && this.selectedCountry.name !== value) {
      this.selectedCountry = null;
      this.authForm.get('country')?.setValue('');
    }
    this.filterCountries();
  }

  onSubmit() {
    if (this.authForm.valid) {
      // Store authentication data in session storage
      const authData = {
        ...this.authForm.value,
        countryName: this.selectedCountry?.name,
      };
      sessionStorage.setItem('authData', JSON.stringify(authData));

      // Navigate to next step
      this.router.navigate(['/personal-info']);
    }
  }

  openDemoModal() {
    this.showDemoModal = true;
  }

  closeDemoModal() {
    this.showDemoModal = false;
  }
}
