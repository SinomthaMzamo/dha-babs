import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-step-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="booking-progress-container">
      <div class="booking-progress-steps">
        <div
          *ngFor="let step of steps; let i = index"
          class="booking-step"
          [class.active]="i + 1 === currentStep"
          [class.completed]="i + 1 < currentStep"
        >
          <div class="booking-step-number">
            <span *ngIf="i + 1 < currentStep" class="checkmark">✓</span>
            <span *ngIf="i + 1 >= currentStep">{{ i + 1 }}</span>
          </div>
          <div class="booking-step-label">{{ step }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --DHAOrange: #f3801f;
        --DHALightOrange: #f8ab18;
        --DHAGreen: #016635;
        --DHAWhite: #ffffff;
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHABackGroundLightGray: #f4f4f4;
      }

      .booking-progress-container {
        margin-bottom: 20px;
      }

      .booking-progress-steps {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        position: relative;
      }

      .booking-progress-steps::before {
        content: '';
        position: absolute;
        top: 10px;
        left: 50%;
        right: 50%;
        height: 2px;
        background: var(--DHABackGroundLightGray);
        z-index: 1;
        transform: translateX(-50%);
        width: calc(100% - 40px);
      }

      .booking-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 2;
        flex: 1;
      }

      .booking-step-number {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--DHABackGroundLightGray);
        color: var(--DHATextGray);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
        transition: all 0.3s ease;
      }

      .booking-step.completed .booking-step-number {
        background: var(--DHAGreen) !important;
        color: var(--DHAWhite) !important;
        transform: scale(1.05);
      }

      .booking-step.active .booking-step-number {
        background: var(--DHAOrange) !important;
        color: var(--DHAWhite) !important;
        transform: scale(1.05);
      }

      .booking-step-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--DHATextGray);
        text-align: center;
        transition: color 0.3s ease;
      }

      .booking-step.completed .booking-step-label {
        color: var(--DHAGreen) !important;
        font-weight: 600;
      }

      .booking-step.active .booking-step-label {
        color: var(--DHAOrange) !important;
        font-weight: 600;
      }

      .checkmark {
        font-size: 10px;
        font-weight: bold;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .booking-step-number {
          width: 18px;
          height: 18px;
          font-size: 11px;
        }

        .booking-step-label {
          font-size: 11px;
        }

        .checkmark {
          font-size: 9px;
        }
      }
    `,
  ],
})
export class BookingStepIndicatorComponent {
  @Input() currentStep: number = 1;

  steps: string[] = ['Add Service(s)', 'Appointment Details'];
}
