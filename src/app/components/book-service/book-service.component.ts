import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { AppointmentResultsComponent } from '../appointment-results/appointment-results.component';

interface SlotSearchCriteria {
  branch: string;
  startDate: string;
  endDate: string;
  services: string[];
}

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentFormComponent,
    AppointmentResultsComponent,
  ],
  template: `
    <div class="book-service-container">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="top-bar-content">
          <div class="logo-section">
            <img src="/Logo_DHA_wecare.png" alt="DHA Logo" class="logo-icon" />
            <span class="logo-text">DHA Online Services</span>
          </div>
          <button (click)="goHome()" class="btn-home-top">
            🏠 Return Home
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Show Form or Results based on state -->
        <app-appointment-form
          *ngIf="!showResults"
          (formSubmitted)="onFormSubmitted($event)"
        ></app-appointment-form>

        <app-appointment-results
          *ngIf="showResults"
          [searchCriteria]="searchCriteria"
          (editSearchRequested)="onEditSearchRequested()"
        ></app-appointment-results>
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
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
      }

      .book-service-container {
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding-top: 70px;
      }

      .top-bar {
        background: whitesmoke;
        color: var(--DHATextGrayDark);
        padding: 15px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
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
        color: var(--DHATextGrayDark);
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

      .main-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      @media (max-width: 768px) {
        .main-content {
          padding: 15px;
        }
      }
    `,
  ],
})
export class BookServiceComponent implements OnInit {
  showResults = false;
  searchCriteria: SlotSearchCriteria | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if we should show results (e.g., from navigation or stored state)
    // For now, always start with the form
    this.showResults = false;
  }

  onFormSubmitted(formData: any) {
    // Store the search criteria
    this.searchCriteria = {
      branch: formData.branch,
      startDate: formData.startDate,
      endDate: formData.endDate,
      services: formData.selectedServices,
    };

    // Switch to results view
    this.showResults = true;

    // Scroll to top when switching to results
    window.scrollTo(0, 0);
  }

  onEditSearchRequested() {
    // Switch back to form view
    this.showResults = false;

    // Scroll to top when switching back to form
    window.scrollTo(0, 0);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
