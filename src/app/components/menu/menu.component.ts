import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="menu-container">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="top-bar-content">
          <div class="logo-section">
            <button type="button" (click)="goHome()" class="btn-home-top">
              ← Home
            </button>
            <!-- <span class="logo-text">Branch Appointment Booking System</span> -->
          </div>
          <img src="/Logo_DHA_wecare.png" alt="DHA Logo" class="logo-icon" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="menu-content">
        <div class="menu-card">
          <div class="welcome-section">
            <h1 class="capitalised">
              Welcome, {{ getPersonalInfo().forenames }}!
            </h1>
            <p class="subtitle">What would you like to do today?</p>
          </div>

          <div class="menu-grid">
            <!-- Schedule Appointment -->
            <div class="menu-item" (click)="scheduleAppointment()">
              <!-- <div class="menu-icon">📅</div> -->
              <h3>Schedule Appointment</h3>
              <p>Book a new appointment for DHA services</p>
              <div class="menu-arrow">→</div>
            </div>

            <!-- Edit Contact Details -->
            <div class="menu-item" (click)="editContactDetails()">
              <!-- <div class="menu-icon">✏️</div> -->
              <h3>Edit Contact Details</h3>
              <p>Update your personal information and contact details</p>
              <div class="menu-arrow">→</div>
            </div>

            <!-- View Appointment -->
            <div
              class="menu-item"
              [class.disabled]="!hasAppointment()"
              (click)="hasAppointment() ? viewAppointment() : null"
            >
              <!-- <div class="menu-icon">👁️</div> -->
              <h3>View Appointment</h3>
              <p>
                {{
                  hasAppointment()
                    ? 'Check details of your current appointment'
                    : 'No appointment scheduled'
                }}
              </p>
              <div class="menu-arrow" *ngIf="hasAppointment()">→</div>
            </div>

            <!-- All Active Appointments -->
            <div class="menu-item" (click)="viewAllAppointments()">
              <!-- <div class="menu-icon">📋</div> -->
              <h3>All Active Appointments</h3>
              <p>View and manage all your scheduled appointments</p>
              <div class="menu-arrow">→</div>
            </div>
          </div>

          <div class="menu-footer">
            <button (click)="goBack()" class="btn-secondary">
              ← Back to Contact Info
            </button>
          </div>
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
        --DHAWhite: #ffffff;
        --DHAOffWhite: #fbfbfb;
        --DHABlack: #000000;
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
      }

      .capitalised {
        text-transform: capitalize;
      }

      .menu-container {
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding-top: 70px;
      }

      .top-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: whitesmoke;
        border-bottom: 2px solid var(--DHAGreen);
        z-index: 1000;
        display: flex;
        align-items: center;
        padding: 0 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .top-bar-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-icon {
        height: 60px;
        width: auto;
        object-fit: contain;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--DHATextGrayDark);
      }

      .btn-home-top {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-home-top:hover {
        background: var(--DHAOrange);
        transform: translateY(-1px);
      }

      .menu-content {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .menu-card {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAWhite);
      }

      .welcome-section {
        text-align: center;
        margin-bottom: 40px;
      }

      .welcome-section h1 {
        color: var(--DHAGreen);
        font-size: 2.5rem;
        margin-bottom: 10px;
        font-weight: 700;
      }

      .subtitle {
        color: var(--DHATextGrayDark);
        font-size: 1.2rem;
        margin: 0;
      }

      .menu-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
        margin-bottom: 40px;
      }

      .menu-item {
        background: var(--DHAOffWhite);
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 30px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .menu-item:hover:not(.disabled) {
        border-color: var(--DHAOrange);
        background: var(--DHAWhite);
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(243, 128, 31, 0.15);
      }

      .menu-item.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: var(--DHABackGroundLightGray);
      }

      .menu-item.disabled:hover {
        transform: none;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .menu-item:hover .menu-arrow {
        transform: translateX(5px);
        color: var(--DHAOrange);
      }

      .menu-icon {
        font-size: 3rem;
        margin-bottom: 20px;
        display: block;
      }

      .menu-item h3 {
        color: var(--DHAGreen);
        font-size: 1.4rem;
        margin-bottom: 15px;
        font-weight: 600;
      }

      .menu-item p {
        color: var(--DHATextGrayDark);
        font-size: 1rem;
        line-height: 1.5;
        margin: 0;
      }

      .menu-arrow {
        position: absolute;
        top: 30px;
        right: 30px;
        font-size: 1.5rem;
        color: var(--DHATextGray);
        transition: all 0.3s ease;
        font-weight: bold;
      }

      .menu-footer {
        text-align: center;
        padding-top: 30px;
      }

      .btn-secondary {
        background: var(--DHATextGray);
        color: var(--DHAWhite);
        border: none;
        border-radius: 8px;
        padding: 12px 30px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-secondary:hover {
        background: var(--DHATextGrayDark);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .menu-content {
          padding: 0;
        }

        .menu-card {
          padding: 10px 8px;
          border-radius: 12px;
          height: 660px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .welcome-section {
          margin-bottom: 25px;
        }

        .welcome-section h1 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 1rem;
        }

        .menu-grid {
          grid-template-columns: 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .menu-item {
          padding: 8px;
          border-radius: 10px;
        }

        .menu-icon {
          font-size: 1.5rem;
          margin-bottom: 0;
        }

        .menu-item h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
        }

        .menu-item p {
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .menu-arrow {
          top: 18px;
          right: 18px;
          font-size: 1.2rem;
        }

        .menu-footer {
          padding-top: 10px;
        }

        .btn-secondary {
          padding: 10px 24px;
          font-size: 14px;
        }

        .logo-icon {
          height: 28px;
        }
        .btn-home-top {
          padding: 4px 8px;
          font-size: 11px;
        }
      }

      @media (max-width: 480px) {
        .menu-card {
          padding: 10px 8px;
          margin: 10px;
        }

        .welcome-section h1 {
          font-size: 1.6rem;
        }

        .subtitle {
          font-size: 0.9rem;
        }

        .menu-item {
          padding: 15px;
        }

        .menu-icon {
          font-size: 1.5rem;
          margin-bottom: 0;
        }

        .menu-item h3 {
          font-size: 1rem;
          margin-bottom: 6px;
        }

        .menu-item p {
          font-size: 0.85rem;
        }

        .menu-arrow {
          top: 15px;
          right: 15px;
          font-size: 1.1rem;
        }
      }
    `,
  ],
})
export class MenuComponent implements OnInit {
  personalData: any;

  constructor(private router: Router) {}

  ngOnInit() {
    // Get personal data from session storage
    const storedData = sessionStorage.getItem('personalData');
    if (storedData) {
      this.personalData = JSON.parse(storedData);
    } else {
      // If no personal data, redirect to authenticate
      this.router.navigate(['/authenticate']);
    }
    window.scrollTo(0, 0);
    // Debug: Log appointment status
    console.log('Menu loaded - Has appointment:', this.hasAppointment());
    console.log('Personal data:', this.personalData);
  }

  getPersonalInfo() {
    return this.personalData || { forenames: 'User' };
  }

  scheduleAppointment() {
    // Navigate to book service with return path
    sessionStorage.setItem('returnToMenu', 'true');
    this.router.navigate(['/book-service']);
  }

  editContactDetails() {
    // Navigate to personal info with return path
    sessionStorage.setItem('returnToMenu', 'true');
    this.router.navigate(['/personal-info']);
  }

  hasAppointment(): boolean {
    // Check if there's a confirmed appointment in session storage
    const appointmentData = sessionStorage.getItem('confirmedAppointment');

    // Also check using ID number if personal data is available
    if (!appointmentData && this.personalData?.idNumber) {
      const appointmentByID = sessionStorage.getItem(
        `appointment_${this.personalData.idNumber}`
      );
      return appointmentByID !== null;
    }

    return appointmentData !== null;
  }

  viewAppointment() {
    if (this.hasAppointment()) {
      // Navigate to view appointment component
      this.router.navigate(['/view-appointment']);
    }
  }

  viewAllAppointments() {
    // TODO: Implement view all appointments functionality
    alert('View All Appointments feature coming soon!');
  }

  goBack() {
    this.router.navigate(['/contact-info']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
