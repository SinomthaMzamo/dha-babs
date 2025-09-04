import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthData {
  idType: string;
  idNumber: string;
}

export interface PersonalData extends AuthData {
  forenames: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface LocationData {
  province: string;
  area: string;
  branch: string;
}

export interface BookingData extends PersonalData, LocationData {
  selectedServices: string[];
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private authDataSubject = new BehaviorSubject<AuthData | null>(null);
  private personalDataSubject = new BehaviorSubject<PersonalData | null>(null);
  private bookingDataSubject = new BehaviorSubject<BookingData | null>(null);

  public authData$ = this.authDataSubject.asObservable();
  public personalData$ = this.personalDataSubject.asObservable();
  public bookingData$ = this.bookingDataSubject.asObservable();

  constructor() {
    this.loadFromSessionStorage();
  }

  // Authentication methods
  setAuthData(data: AuthData): void {
    this.authDataSubject.next(data);
    sessionStorage.setItem('authData', JSON.stringify(data));
  }

  getAuthData(): AuthData | null {
    return this.authDataSubject.value;
  }

  // Personal info methods
  setPersonalData(data: PersonalData): void {
    this.personalDataSubject.next(data);
    sessionStorage.setItem('personalData', JSON.stringify(data));
  }

  getPersonalData(): PersonalData | null {
    return this.personalDataSubject.value;
  }

  // Booking methods
  setBookingData(data: BookingData): void {
    this.bookingDataSubject.next(data);
    sessionStorage.setItem('bookingData', JSON.stringify(data));
  }

  getBookingData(): BookingData | null {
    return this.bookingDataSubject.value;
  }

  // Validation methods
  validateIdNumber(idNumber: string): boolean {
    // Basic validation for South African ID number
    if (!idNumber || idNumber.length !== 13) {
      return false;
    }
    
    // Check if all characters are digits
    if (!/^\d{13}$/.test(idNumber)) {
      return false;
    }

    // Luhn algorithm validation for ID number
    return this.validateLuhn(idNumber);
  }

  validatePhoneNumber(phone: string): boolean {
    // South African phone number validation
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return phoneRegex.test(phone);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Clear all data
  clearAllData(): void {
    this.authDataSubject.next(null);
    this.personalDataSubject.next(null);
    this.bookingDataSubject.next(null);
    sessionStorage.clear();
  }

  // Load data from session storage on service initialization
  private loadFromSessionStorage(): void {
    const authData = sessionStorage.getItem('authData');
    const personalData = sessionStorage.getItem('personalData');
    const bookingData = sessionStorage.getItem('bookingData');

    if (authData) {
      this.authDataSubject.next(JSON.parse(authData));
    }
    if (personalData) {
      this.personalDataSubject.next(JSON.parse(personalData));
    }
    if (bookingData) {
      this.bookingDataSubject.next(JSON.parse(bookingData));
    }
  }

  // Luhn algorithm for ID number validation
  private validateLuhn(idNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost side
    for (let i = idNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(idNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Mock API call for submitting booking
  submitBooking(bookingData: BookingData): Observable<any> {
    // In a real application, this would make an HTTP call
    return new Observable(observer => {
      setTimeout(() => {
        // Simulate API response
        const response = {
          success: true,
          bookingId: 'DHA-' + Date.now(),
          message: 'Booking submitted successfully',
          data: bookingData
        };
        observer.next(response);
        observer.complete();
      }, 2000); // Simulate network delay
    });
  }
}
