import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
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
  `,
  styles: [
    `
      .top-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: var(--DHAWhite);
        border-bottom: 1px solid var(--DHABorderGray);
        z-index: 1000;
        height: 73px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .top-bar-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        padding: 0 20px;
        max-width: 1200px;
        margin: 0 auto;
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

      .btn-home-top {
        background: transparent;
        color: var(--DHAGreen);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 24px;
        font-weight: 700;
        transition: all 0.3s ease;
        
        text-align: left;
      }

      .btn-home-top:hover {
        color: var(--DHAOrange);
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .top-bar-content {
          padding: 0 15px;
        }

        .logo-icon {
          height: 28px;
        }
        .btn-home-top {
          font-size: 16px;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
