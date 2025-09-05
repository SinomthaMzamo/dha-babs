import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
      <div class="appointment-form-card">
        <app-progress-indicator [currentStep]="2"></app-progress-indicator>
        <h2>Step 3: Book A New Appointment</h2>

        <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
          <!-- Selected Services Display -->
          <div
            class="form-section"
            *ngIf="selectedServices && selectedServices.length > 0"
          >
            <h3>Selected Services</h3>
            <div class="selected-services-display">
              <div
                *ngFor="let service of selectedServices"
                class="service-badge"
              >
                {{ service.name }}
              </div>
            </div>
          </div>

          <!-- Location Selection -->
          <div class="form-section">
            <h3>Select Location</h3>
            <p class="section-description">Choose your preferred branch:</p>

            <div class="location-grid">
              <div class="form-group">
                <label for="province">Province *</label>
                <select
                  id="province"
                  formControlName="province"
                  (change)="onProvinceChange()"
                >
                  <option value="">Select Province</option>
                  <option
                    *ngFor="let province of provinces"
                    [value]="province.id"
                  >
                    {{ province.name }}
                  </option>
                </select>
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

              <div class="form-group">
                <label for="area">Area *</label>
                <select
                  id="area"
                  formControlName="area"
                  (change)="onAreaChange()"
                  [disabled]="!appointmentForm.get('province')?.value"
                >
                  <option value="">Select Area</option>
                  <option *ngFor="let area of filteredAreas" [value]="area.id">
                    {{ area.name }}
                  </option>
                </select>
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

              <div class="form-group">
                <label for="branch">Branch *</label>
                <select
                  id="branch"
                  formControlName="branch"
                  [disabled]="!appointmentForm.get('area')?.value"
                >
                  <option value="">Select Branch</option>
                  <option
                    *ngFor="let branch of filteredBranches"
                    [value]="branch.id"
                  >
                    {{ branch.name }}
                  </option>
                </select>
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

          <!-- Date Range Selection -->
          <div class="form-section">
            <h3>Select Date Range</h3>
            <p class="section-description">
              Choose when you'd like to book your appointment:
            </p>

            <div class="date-grid">
              <div class="form-group">
                <label for="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  formControlName="startDate"
                  [min]="today"
                />
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

              <div class="form-group">
                <label for="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  formControlName="endDate"
                  [min]="appointmentForm.get('startDate')?.value || today"
                />
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
        padding: 20px;
        min-height: calc(100vh - 70px);
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
      }

      .appointment-form-card {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 800px;
      }

      h2 {
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 700;
        text-align: center;
      }

      .form-section {
        margin-bottom: 40px;
        padding: 25px;
        background: var(--DHAOffWhite);
        border-radius: 12px;
        border: 1px solid var(--DHAGreen);
      }

      .form-section h3 {
        color: var(--DHAGreen);
        margin-bottom: 10px;
        font-size: 1.3rem;
        font-weight: 600;
      }

      .section-description {
        color: var(--DHATextGrayDark);
        margin-bottom: 20px;
        font-size: 1rem;
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
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
      }

      .services-list {
        display: flex;
        flex-direction: column;
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

      label {
        font-weight: 600;
        color: var(--DHAGreen);
        margin-bottom: 8px;
        font-size: 1rem;
      }

      select,
      input[type='date'] {
        padding: 12px;
        border: 2px solid var(--DHATextGray);
        border-radius: 6px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: var(--DHAWhite);
      }

      select:focus,
      input[type='date']:focus {
        outline: none;
        border-color: var(--DHAGreen);
        box-shadow: 0 0 0 3px rgba(1, 102, 53, 0.1);
      }

      select:disabled {
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
        justify-content: center;
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
        .appointment-form-card {
          padding: 25px 20px;
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
export class AppointmentFormComponent implements OnInit {
  @Input() selectedServices: any[] = [];
  @Output() formSubmitted = new EventEmitter<any>();

  appointmentForm: FormGroup;
  today: string;

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
  }

  ngOnInit() {
    // Set default end date to 30 days from today
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    this.appointmentForm.patchValue({
      endDate: defaultEndDate.toISOString().split('T')[0],
    });
  }

  get filteredAreas() {
    const provinceId = this.appointmentForm.get('province')?.value;
    return this.areas.filter((area) => area.provinceId === provinceId);
  }

  get filteredBranches() {
    const areaId = this.appointmentForm.get('area')?.value;
    return this.branches.filter((branch) => branch.areaId === areaId);
  }

  onProvinceChange() {
    this.appointmentForm.patchValue({
      area: '',
      branch: '',
    });
  }

  onAreaChange() {
    this.appointmentForm.patchValue({
      branch: '',
    });
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
    // This will be handled by the parent component
    window.history.back();
  }
}
