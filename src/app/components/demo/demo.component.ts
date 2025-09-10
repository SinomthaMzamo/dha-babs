import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-container">
      <div class="demo-card">
        <div class="header-section">
          <img src="/Logo_DHA_wecare.png" alt="DHA Logo" class="demo-logo" />
          <!-- <h4>Department of Home Affairs</h4> -->
        </div>
        <h1>Branch Appointment Booking System</h1>
        <p class="subtitle">
          A modern, user-friendly platform for DHA appointment management
        </p>

        <div class="features-grid">
          <div class="feature-card">
            <!-- TODO: highlight easy log in with ID or Passport number -->
            <div class="feature-icon">🔐</div>
            <h3>Easy Login</h3>
            <p>Sign in with your ID or Passport number</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📅</div>
            <h3>Service Booking</h3>
            <p>Easily book appointments for single or multiple services</p>
          </div>

          <!-- <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile Responsive</h3>
            <p>Optimized for all devices and screen sizes</p>
          </div> -->
          <!-- <div class="feature-card">
            <div class="feature-icon">🛠️</div>
            <h3>Book multiple services</h3>
            <p>Get all your affairs in order in one go</p>
          </div> -->
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Group bookings</h3>
            <p>Book for multiple people at once</p>
          </div>
          <div class="feature-card empty">
            <!-- TODO: highlight easy log in with ID or Passport number -->
            <div class="feature-icon">⏱️</div>
            <h3>Avoid long queues with us!</h3>
            <p>Spend less time standing around</p>
          </div>
        </div>

        <div class="cta-section">
          <h2>Ready to get started?</h2>
          <p>Experience the improved DHA booking system</p>
          <button (click)="startBooking()" class="cta-button">
            Book Today
          </button>
        </div>

        <div class="info-section">
          <h3>Available Services</h3>
          <ul class="services-list">
            <li>Smart ID Card application/renewal</li>
            <li>ID Book application/renewal</li>
            <li>Passport application/renewal</li>
            <li>Birth, Marriage & Death Certificates</li>
            <li>Citizenship & Naturalization</li>
            <li>Visa Services</li>
          </ul>
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

      .demo-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--DHAOffWhite) 0%,
          #e8f5e8 100%
        );
        padding: 20px;
      }

      .demo-card {
        background: var(--DHAWhite);
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 800px;
        text-align: center;
      }

      .header-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-bottom: 20px;
      }

      .demo-logo {
        height: 80px;
        width: auto;
        object-fit: contain;
      }

      h4 {
        color: var(--DHAGreen);
        font-size: 1.5rem;
        margin: 0;
        font-weight: 600;
      }

      h1 {
        color: var(--DHAGreen);
        font-size: 2.5rem;
        margin-bottom: 10px;
        font-weight: 700;
      }

      .subtitle {
        color: var(--DHATextGrayDark);
        font-size: 1.2rem;
        margin-bottom: 40px;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }

      /* Make the last item fill the row */
      .features-grid > :last-child {
        grid-column: 1 / -1;
      }

      .feature-card {
        padding: 20px;
        border-radius: 12px;
        background: var(--DHABackGroundLightGray);
        border: 2px solid transparent;
        transition: all 0.3s ease;
      }

      .feature-card:hover {
        border-color: var(--DHAGreen);
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(1, 102, 53, 0.1);
      }

      .feature-icon {
        font-size: 3rem;
        margin-bottom: 15px;
      }

      .feature-card h3 {
        color: var(--DHATextGrayDark);
        margin-bottom: 10px;
        font-size: 1.3rem;
      }

      .feature-card p {
        color: var(--DHATextGray);
        line-height: 1.5;
      }

      .cta-section {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
        padding: 30px;
        border-radius: 12px;
        margin-bottom: 30px;
      }

      .cta-section h2 {
        margin-bottom: 10px;
        font-size: 1.8rem;
      }

      .cta-section p {
        margin-bottom: 20px;
        opacity: 0.9;
      }

      .cta-button {
        background: var(--DHAOrange);
        color: var(--DHAWhite);
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .cta-button:hover {
        background: var(--DHALightOrange);
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      .info-section {
        text-align: left;
      }

      .info-section h3 {
        color: var(--DHAGreen);
        margin-bottom: 15px;
        font-size: 1.4rem;
      }

      .services-list {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 10px;
        padding: 0 20px;
      }

      .services-list li {
        padding: 8px 0;
        color: var(--DHATextGray);
        position: relative;
        padding-left: 20px;
      }

      .services-list li::before {
        content: '✓';
        color: var(--DHAGreen);
        font-weight: bold;
        position: absolute;
        left: 0;
      }

      @media (max-width: 780px) {
        .demo-container {
          padding: 10px;
        }
        .demo-card {
          padding: 20px 15px;
        }

        .header-section {
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .demo-logo {
          height: 50px;
        }

        h4 {
          font-size: 1.2rem;
        }

        h1 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 1rem;
          margin-bottom: 25px;
        }

        .features-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }

        .feature-card {
          padding: 12px;
          border-radius: 8px;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .feature-card h3 {
          font-size: 0.9rem;
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .feature-card p {
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .cta-section {
          padding: 20px;
          margin-bottom: 20px;
        }

        .cta-section h2 {
          font-size: 1.4rem;
        }

        .cta-section p {
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .cta-button {
          padding: 12px 24px;
          font-size: 1rem;
        }

        .services-list {
          grid-template-columns: 1fr;
          padding: 0 10px;
        }

        .services-list li {
          font-size: 0.9rem;
          padding: 6px 0 6px 20px;
        }
      }

      @media (max-width: 480px) {
        .demo-container {
          padding: 5px;
        }

        .demo-card {
          padding: 15px 10px;
        }

        h1 {
          font-size: 1.6rem;
        }

        .subtitle {
          font-size: 0.9rem;
          margin-bottom: 20px;
        }

        .features-grid {
          gap: 8px;
          margin-bottom: 20px;
          grid-template-columns: repeat(2, 1fr);
        }
        /* unset grid-column: 1 / -1; */
        .features-grid > :last-child {
          grid-column: auto;
        }

        .feature-card {
          padding: 10px;
        }

        .feature-icon {
          font-size: 1.8rem;
          margin-bottom: 6px;
        }

        .feature-card h3 {
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .feature-card p {
          font-size: 0.7rem;
        }

        .cta-section {
          padding: 15px;
        }

        .cta-section h2 {
          font-size: 1.2rem;
        }

        .cta-button {
          padding: 10px 20px;
          font-size: 0.9rem;
        }

        .services-list li {
          padding: 6px 0 6px 20px;
          font-size: 0.85rem;
        }
      }
    `,
  ],
})
export class DemoComponent {
  constructor(private router: Router) {}

  startBooking() {
    this.router.navigate(['/authenticate']);
  }
}
