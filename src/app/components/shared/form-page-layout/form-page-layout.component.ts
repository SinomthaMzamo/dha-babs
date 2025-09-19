import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressIndicatorComponent } from '../../progress-indicator/progress-indicator.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-form-page-layout',
  standalone: true,
  imports: [CommonModule, ProgressIndicatorComponent, NavbarComponent],
  template: `
    <div class="form-page-container">
      <app-navbar></app-navbar>
      <div class="form-page-content-wrapper">
        <app-progress-indicator
          [currentStep]="currentStep"
          [steps]="steps"
        ></app-progress-indicator>
        <div class="form-page-card">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
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
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHAOffBlack: rgb(42, 41, 41);
        --DHADisabledTextGray: #c4c4c4;
        --form-width: 600px;
        --step-form-gap: 20px;
      }

      .form-page-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding: 20px;
        padding-top: 93px; /* Account for navbar height */
      }

      .form-page-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--step-form-gap);
        width: 100%;
        max-width: var(--form-width);
        position: relative;
        padding: 0 20px;
        box-sizing: border-box;
      }

      .form-page-card {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        max-width: var(--form-width);
        width: 100%;
        box-sizing: border-box;
        min-height: fit-content;
      }

      h2 {
        color: var(--DHAGreen);
        margin-bottom: 30px;
        font-size: 24px;
        font-weight: 700;
        text-align: center;
      }

      /* Mobile Styles */
      @media (max-width: 768px) {
        .form-page-container {
          padding: 24px 0;
          flex-direction: column;
          position: relative;
        }

        .form-page-content-wrapper {
          padding: 0 8px;
          position: relative;
          width: 100%;
          max-width: none;
          align-items: center;
        }

        .form-page-card {
          padding: 25px 20px;
          min-width: unset;
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .form-page-container {
          padding: 16px 0;
        }

        .form-page-content-wrapper {
          padding: 0 4px;
          width: 100%;
          max-width: none;
        }

        .form-page-card {
          padding: 20px 15px;
        }
      }
    `,
  ],
})
export class FormPageLayoutComponent {
  @Input() currentStep: number = 1;
  @Input() steps: string[] = [];
}
