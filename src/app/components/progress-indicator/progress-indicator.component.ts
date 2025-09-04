import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="progress-steps">
        <div
          *ngFor="let step of steps; let i = index"
          class="step"
          [class.active]="i === currentStep"
          [class.completed]="i < currentStep"
        >
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-label">{{ step }}</div>
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
        --DHAErrorColor: #f57c00;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
      }

      .progress-container {
        margin-bottom: 30px;
      }

      .progress-steps {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 600px;
        margin: 0 auto;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
      }

      .step:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 20px;
        left: 50%;
        width: 100%;
        height: 2px;
        background: var(--DividerGray);
        z-index: 1;
      }

      .step.completed:not(:last-child)::after {
        background: var(--DHAGreen);
      }

      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--DividerGray);
        color: var(--DHATextGrayDark);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
      }

      .step.active .step-number {
        background: var(--DHAGreen) !important;
        color: var(--DHAWhite) !important;
        transform: scale(1.1);
      }

      .step.completed .step-number {
        background: var(--DHAGreen) !important;
        color: var(--DHAWhite) !important;
      }

      .step-label {
        font-size: 14px;
        color: var(--DHATextGray);
        text-align: center;
        font-weight: 500;
        transition: color 0.3s ease;
      }

      .step.active .step-label {
        color: var(--DHAGreen) !important;
        font-weight: 600;
      }

      .step.completed .step-label {
        color: var(--DHAGreen) !important;
      }

      @media (max-width: 600px) {
        .progress-steps {
          flex-direction: column;
          gap: 20px;
        }

        .step:not(:last-child)::after {
          display: none;
        }

        .step-number {
          width: 35px;
          height: 35px;
          font-size: 14px;
        }

        .step-label {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class ProgressIndicatorComponent {
  @Input() currentStep: number = 0;

  steps = ['Authenticate', 'Personal Info', 'Book Service'];
}
