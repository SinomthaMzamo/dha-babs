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
          <div class="step-number">
            <span *ngIf="i + 1 <= currentStep" class="checkmark">✓</span>
            <span *ngIf="i + 1 > currentStep">{{ i + 1 }}</span>
          </div>

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
        --DHAOffBlack: rgb(51, 51, 51);
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #f57c00;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
        width: 100%;
        max-width: 600px;
      }

      .progress-container {
        margin-bottom: 20px;
        padding: 8px 0;
        margin: 0 auto;
      }

      .progress-steps {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0;
        box-sizing: border-box;
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
        top: 10px;
        left: 50%;
        width: 100%;
        height: 1px;
        background: gainsboro;
        z-index: 1;
      }

      .step.completed:not(:last-child)::after {
        background: var(--DividerGray);
      }

      .step-number {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: gainsboro;
        color: var(--DHATextGrayDark);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
        margin-bottom: 4px;
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
      }

      .step.active .step-number {
        background: var(--DHAOrange) !important;
        color: var(--DHAWhite) !important;
        transform: scale(1.05);
      }

      .step.completed .step-number {
        background: var(--DHAGreen) !important;
        color: var(--DHAWhite) !important;
      }

      .step-label {
        font-size: 11px;
        color: var(--DHATextGray);
        text-align: center;
        font-weight: 500;
        transition: color 0.3s ease;
        line-height: 1.2;
      }

      .step.active .step-label {
        color: var(--DHAOrange) !important;
        font-weight: 600;
      }

      .step.completed .step-label {
        color: var(--DHAGreen) !important;
      }

      @media (max-width: 274px) {
        .progress-container {
          margin-bottom: 15px;
          padding: 8px 0;
        }

        .progress-steps {
          flex-direction: column;
          gap: 12px;
          padding: 0 15px;
          width: 100%;
        }

        .step:not(:last-child)::after {
          display: none;
        }

        .step-number {
          width: 24px;
          height: 24px;
          font-size: 11px;
        }

        .step-label {
          font-size: 10px;
        }
      }
    `,
  ],
})
export class ProgressIndicatorComponent {
  @Input() currentStep: number = 0;
  @Input() steps: string[] = ['Sign In', 'Personal Info', 'Contact Info'];
}
