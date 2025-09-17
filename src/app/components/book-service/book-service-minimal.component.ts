import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-service-minimal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="background: purple; color: white; padding: 20px; margin: 20px;">
      <h1>ULTRA MINIMAL BOOK SERVICE COMPONENT</h1>
      <p>Current Step: {{ currentStep }}</p>
      <p>Personal Data: {{ personalData ? 'Loaded' : 'Not Loaded' }}</p>
      <p>Booking Persons: {{ bookingPersons.length }}</p>
      <button
        (click)="goBack()"
        style="background: red; color: white; padding: 10px;"
      >
        Go Back to Menu
      </button>
    </div>
  `,
  styles: [],
})
export class BookServiceMinimalComponent implements OnInit, OnDestroy {
  currentStep: 'preview' | 'form' | 'results' | 'confirm' = 'preview';
  personalData: any;
  bookingPersons: any[] = [];

  constructor(private router: Router) {
    console.log('BookServiceMinimalComponent constructor called');
  }

  ngOnInit() {
    console.log('BookServiceMinimalComponent ngOnInit started - ULTRA MINIMAL');
    console.log('Current step:', this.currentStep);
    window.scrollTo(0, 0);

    // MINIMAL INITIALIZATION
    this.currentStep = 'preview';
    this.personalData = { forenames: 'Test', lastName: 'User' };
    this.bookingPersons = [
      {
        id: 'self',
        name: 'Test User',
        type: 'Main Applicant',
        idNumber: '1234567890123',
        selectedServices: [],
      },
    ];

    console.log(
      'BookServiceMinimalComponent ngOnInit completed - ULTRA MINIMAL'
    );
    console.log('Final currentStep:', this.currentStep);
    console.log('Final bookingPersons:', this.bookingPersons);
  }

  ngOnDestroy() {
    console.log('BookServiceMinimalComponent ngOnDestroy called');
    console.log('Stack trace:', new Error().stack);
  }

  goBack() {
    console.log('BookServiceMinimalComponent goBack called');
    this.router.navigate(['/menu']);
  }
}
