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
            <h1>Welcome, {{ getPersonalInfo().forenames }}!</h1>
            <p class="subtitle">What would you like to do today?</p>
          </div>

          <div class="menu-grid">
            <!-- Schedule Appointment -->
            <div class="menu-item" (click)="scheduleAppointment()">
              <div class="menu-icon">📅</div>
              <h3>Schedule Appointment</h3>
              <p>Book a new appointment for DHA services</p>
              <div class="menu-arrow">→</div>
            </div>

            <!-- Edit Contact Details -->
            <div class="menu-item" (click)="editContactDetails()">
              <div class="menu-icon">✏️</div>
              <h3>Edit Contact Details</h3>
              <p>Update your personal information and contact details</p>
              <div class="menu-arrow">→</div>
            </div>

            <!-- View Appointment -->
            <div class="menu-item" (click)="viewAppointment()">
              <div class="menu-icon">👁️</div>
              <h3>View Appointment</h3>
              <p>Check details of your current appointment</p>
              <div class="menu-arrow">→</div>
            </div>

            <!-- All Active Appointments -->
            <div class="menu-item" (click)="viewAllAppointments()">
              <div class="menu-icon">📋</div>
              <h3>All Active Appointments</h3>
              <p>View and manage all your scheduled appointments</p>
              <div class="menu-arrow">→</div>
            </div>
          </div>

          <div class="menu-footer">
            <button (click)="goBack()" class="btn-secondary">
              ← Back to Personal Info
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

      .menu-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .menu-card {
        background: var(--DHAWhite);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 2px solid var(--DHAGreen);
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

      .menu-item:hover {
        border-color: var(--DHAOrange);
        background: var(--DHAWhite);
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(243, 128, 31, 0.15);
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
        border-top: 2px solid var(--DividerGray);
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
          padding: 30px 20px;
        }

        .welcome-section h1 {
          font-size: 2rem;
        }

        .menu-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .menu-item {
          padding: 25px;
        }
        .logo-icon {
          height: 32px;
        }
        .btn-home-top {
          padding: 4px 10px;
          font-size: 12px;
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

  viewAppointment() {
    // TODO: Implement view appointment functionality
    alert('View Appointment feature coming soon!');
  }

  viewAllAppointments() {
    // TODO: Implement view all appointments functionality
    alert('View All Appointments feature coming soon!');
  }

  goBack() {
    this.router.navigate(['/personal-info']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
