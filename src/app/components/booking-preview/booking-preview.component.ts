import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormPageLayoutComponent } from '../shared/form-page-layout/form-page-layout.component';

interface BookingPerson {
  id: string;
  name: string;
  type: 'Main Applicant' | 'Child' | 'Friend' | 'Family Member' | 'Other';
  idNumber?: string;
  selectedServices: any[];
}

@Component({
  selector: 'app-booking-preview',
  standalone: true,
  imports: [CommonModule, FormPageLayoutComponent],
  template: `
    <app-form-page-layout [currentStep]="0" [steps]="stepTitles">
      <h2 class="step-title">Select Required Services</h2>
      <div class="card-wrapper">
        <h6 class="step-description">
          Manage booking applicants and their required services ({{
            bookingPersons.length
          }})
        </h6>

        <!-- add applicant menu -->
        <div class="add-applicant-menu">
          <div class="header-info">
            <p class="header-description">
              Add additional applicants to this booking
            </p>
          </div>
          <div class="applicants-header">
            <div class="header-actions">
              <button
                type="button"
                (click)="onAddPersonToBooking()"
                class="action-btn std"
                title="Add an accompanying applicant to this booking"
              >
                <span class="btn-text">Add Applicant</span>
              </button>
              <button
                type="button"
                (click)="onRemovePersonFromBooking()"
                class="action-btn std"
                [disabled]="bookingPersons.length <= 1"
                title="Remove an additional applicant from this booking"
              >
                <span class="btn-text">Remove</span>
              </button>
              <button
                type="button"
                (click)="onClearAllPersons()"
                class="action-btn white"
                [disabled]="bookingPersons.length <= 1"
                title="Remove all additional applicants from this booking"
              >
                <span class="btn-text">Clear All</span>
              </button>
            </div>
          </div>
        </div>

        <div class="registered-applicants">
          <p class="header-description">
            Select required services for each applicant
          </p>
          <!-- Applicants List -->
          <div class="applicants-list">
            <div *ngIf="bookingPersons.length > 0" class="applicants-grid">
              <div
                *ngFor="let person of bookingPersons; let i = index"
                class="applicant-card"
                [class.primary-applicant]="person.type === 'Main Applicant'"
              >
                <div class="applicant-header">
                  <div class="applicant-info">
                    <span class="applicant-name "
                      >{{ person.name }} ({{ person.type }})</span
                    >
                    <span class="applicant-type">{{ person.idNumber }}</span>
                  </div>
                  <button
                    *ngIf="bookingPersons.length > 1"
                    type="button"
                    (click)="onRemoveSpecificPerson(i)"
                    class="remove-applicant-btn"
                    title="Remove this applicant"
                  >
                    ×
                  </button>
                </div>

                <div class="applicant-services">
                  <div class="services-header">
                    <span class="services-label">Required Services:</span>
                    <button
                      type="button"
                      (click)="onEditPersonServices(i)"
                      class="edit-services-btn"
                      title="Edit services for this applicant"
                    >
                      {{
                        person.selectedServices.length === 0
                          ? 'Add Services'
                          : 'Edit Services'
                      }}
                    </button>
                  </div>

                  <div class="person-services-preview">
                    <div
                      *ngIf="person.selectedServices.length === 0"
                      class="no-services"
                    >
                      <span>No services selected</span>
                    </div>
                    <div
                      *ngFor="let service of person.selectedServices"
                      class="service-badge"
                    >
                      <span>{{ service.name }}</span>
                      <button
                        type="button"
                        (click)="onRemoveServiceFromPerson(i, service)"
                        class="remove-service-btn"
                        title="Remove this service"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button type="button" (click)="onGoBack()" class="btn-secondary">
            Back
          </button>
          <button
            type="button"
            (click)="onProceedToLocation()"
            [disabled]="!hasAnyServicesSelected()"
            class="btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </app-form-page-layout>
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
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHAOffBlack: rgb(42, 41, 41);
        --DHADisabledTextGray: #c4c4c4;
      }

      .card-wrapper {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .step-description {
        color: var(--DHATextGray);
        font-size: 16px;
        margin: 0;
        margin-bottom: 30px;
        line-height: 1.5;
        font-weight: 400;
      }

      .step-title {
        text-align: center;
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 600;
        margin-top: 0;
      }

      .applicants-list {
        margin-bottom: 20px;
      }

      .applicants-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .applicant-card {
        background: var(--DHAWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .applicant-card.primary-applicant {
        border-color: var(--DHAGreen);
        background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%);
      }

      .applicant-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .applicant-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .applicant-name {
        font-weight: 600;
        color: var(--DHAOffBlack);
        font-size: 14px;
      }

      .applicant-type {
        font-size: 12px;
        color: var(--DHATextGray);
      }

      .remove-applicant-btn {
        background: var(--DHAErrorColor);
        color: var(--DHAWhite);
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.2s ease;
      }

      .remove-applicant-btn:hover {
        background: #c41e3a;
        transform: scale(1.1);
      }

      .applicant-services {
        border-top: 1px solid var(--DHABackGroundLightGray);
        padding-top: 12px;
      }

      .services-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .services-label {
        font-size: 12px;
        color: var(--DHATextGrayDark);
        font-weight: 500;
      }

      .edit-services-btn {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 10px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .edit-services-btn:hover {
        background: var(--DHAOffBlack);
      }

      .person-services-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .no-services {
        color: var(--DHATextGray);
        font-size: 12px;
        font-style: italic;
        padding: 8px 0;
      }

      .service-badge {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border-radius: 12px;
        padding: 4px 8px;
        font-size: 10px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .remove-service-btn {
        background: none;
        border: none;
        color: var(--DHAWhite);
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        padding: 0;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .remove-service-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .applicants-header {
        background: var(--DHAOffWhite);
        border: 1px solid var(--DHABackGroundLightGray);
        border-radius: 8px;
        padding: 16px;
      }

      .header-info {
      }

      .header-description {
        color: var(--DHATextGrayDark);
        font-size: 16px;
        margin: 0;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .header-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .action-btn {
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .action-btn:first-child {
        margin-right: auto; /* pushes the rest away, keeps it at flex-start */
      }

      .action-btn:nth-child(2),
      .action-btn:nth-child(3) {
        flex: 0; /* share remaining space equally */
        text-align: center; /* optional: center text inside */
      }

      .action-btn.std {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .action-btn.std:hover:not(:disabled) {
        background: var(--DHAOffBlack);
        transform: translateY(-1px);
      }

      .action-btn.white {
        background: var(--DHAWhite);
        color: var(--DHATextGrayDark);
        border: 1px solid var(--DHABackGroundLightGray);
      }

      .action-btn.white:hover:not(:disabled) {
        background: var(--DHAOffWhite);
        border-color: var(--DHATextGray);
      }

      .action-btn:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
        transform: none;
      }

      .btn-text {
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }

      .action-buttons {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--DHABackGroundLightGray);
      }

      .btn-primary,
      .btn-secondary {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--DHAOffBlack);
        transform: translateY(-1px);
      }

      .btn-primary:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
        transform: none;
      }

      .btn-secondary {
        background: var(--DHATextGrayDark);
        color: var(--DHAWhite);
      }

      .btn-secondary:hover {
        background: var(--DHAOffBlack);
        transform: translateY(-1px);
      }

      /* Mobile Styles */
      @media (max-width: 768px) {
        .step-title {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }

        .step-description {
          font-size: 14px;
        }

        .applicant-header {
          flex-direction: column;
          gap: 8px;
        }

        .remove-applicant-btn {
          align-self: flex-end;
        }

        .header-actions {
          /* flex-direction: column; */
        }

        .action-btn {
          width: 100%;
          justify-content: center;
        }

        .action-btn:nth-child(2),
        .action-btn:nth-child(3) {
          flex: 1; /* share remaining space equally */
          text-align: center; /* optional: center text inside */
        }

        .action-buttons {
          /* flex-direction: column; */
        }

        .btn-primary,
        .btn-secondary {
          width: 100%;
        }
      }
    `,
  ],
})
export class BookingPreviewComponent {
  @Input() stepTitles: string[] = [
    'Services',
    'Details',
    'Timeslots',
    'Confirm',
  ];
  @Input() bookingPersons: BookingPerson[] = [];

  @Output() goBack = new EventEmitter<void>();
  @Output() proceedToLocation = new EventEmitter<void>();
  @Output() addPersonToBooking = new EventEmitter<void>();
  @Output() removePersonFromBooking = new EventEmitter<void>();
  @Output() clearAllPersons = new EventEmitter<void>();
  @Output() removeSpecificPerson = new EventEmitter<number>();
  @Output() editPersonServices = new EventEmitter<number>();
  @Output() removeServiceFromPerson = new EventEmitter<{
    personIndex: number;
    service: any;
  }>();

  hasAnyServicesSelected(): boolean {
    return this.bookingPersons.some(
      (person) => person.selectedServices.length > 0
    );
  }

  onGoBack(): void {
    this.goBack.emit();
  }

  onProceedToLocation(): void {
    this.proceedToLocation.emit();
  }

  onAddPersonToBooking(): void {
    this.addPersonToBooking.emit();
  }

  onRemovePersonFromBooking(): void {
    this.removePersonFromBooking.emit();
  }

  onClearAllPersons(): void {
    this.clearAllPersons.emit();
  }

  onRemoveSpecificPerson(index: number): void {
    this.removeSpecificPerson.emit(index);
  }

  onEditPersonServices(index: number): void {
    this.editPersonServices.emit(index);
  }

  onRemoveServiceFromPerson(personIndex: number, service: any): void {
    this.removeServiceFromPerson.emit({ personIndex, service });
  }
}
