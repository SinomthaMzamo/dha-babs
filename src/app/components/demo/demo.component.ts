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
        <h1>DHA Online Booking System</h1>
        <p class="subtitle">
          A modern, user-friendly platform for South African citizens
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
            <p>Easy appointment scheduling and location selection</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile Responsive</h3>
            <p>Optimized for all devices and screen sizes</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🛠️</div>
            <h3>Book multiple services</h3>
            <p>Get all your affairs in order in one go</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Group bookings</h3>
            <p>Book for multiple people at once</p>
          </div>
        </div>

        <div class="cta-section">
          <h2>Ready to get started?</h2>
          <p>Experience the improved DHA booking system</p>
          <button (click)="startBooking()" class="cta-button">
            Start Booking Process
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
        background: var(--DHABackGroundLightGray);
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
        border: 2px solid var(--DHAGreen);
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
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
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

      @media (max-width: 768px) {
        .demo-card {
          padding: 20px;
        }

        h1 {
          font-size: 2rem;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }

        .services-list {
          grid-template-columns: 1fr;
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
