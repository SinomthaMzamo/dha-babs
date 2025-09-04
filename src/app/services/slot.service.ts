import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  date: string;
}

export interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  branch: string;
  serviceType: string;
}

export interface SlotSearchCriteria {
  branch: string;
  startDate: string;
  endDate: string;
  services: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  // Mock data for available slots
  private mockSlots: AvailableSlot[] = [
    // Johannesburg Central
    {
      id: '1',
      date: '2024-02-15',
      time: '09:00',
      branch: 'jhb-central',
      serviceType: 'smart-id',
    },
    {
      id: '2',
      date: '2024-02-15',
      time: '10:00',
      branch: 'jhb-central',
      serviceType: 'passport',
    },
    {
      id: '3',
      date: '2024-02-15',
      time: '11:00',
      branch: 'jhb-central',
      serviceType: 'smart-id',
    },
    {
      id: '4',
      date: '2024-02-15',
      time: '14:00',
      branch: 'jhb-central',
      serviceType: 'id-book',
    },
    {
      id: '5',
      date: '2024-02-16',
      time: '09:00',
      branch: 'jhb-central',
      serviceType: 'passport',
    },
    {
      id: '6',
      date: '2024-02-16',
      time: '13:00',
      branch: 'jhb-central',
      serviceType: 'smart-id',
    },

    // Sandton
    {
      id: '7',
      date: '2024-02-15',
      time: '10:30',
      branch: 'jhb-sandton',
      serviceType: 'smart-id',
    },
    {
      id: '8',
      date: '2024-02-15',
      time: '15:00',
      branch: 'jhb-sandton',
      serviceType: 'passport',
    },
    {
      id: '9',
      date: '2024-02-16',
      time: '11:00',
      branch: 'jhb-sandton',
      serviceType: 'smart-id',
    },

    // Pretoria Central
    {
      id: '10',
      date: '2024-02-15',
      time: '08:30',
      branch: 'pta-central',
      serviceType: 'smart-id',
    },
    {
      id: '11',
      date: '2024-02-15',
      time: '12:00',
      branch: 'pta-central',
      serviceType: 'id-book',
    },
    {
      id: '12',
      date: '2024-02-16',
      time: '09:30',
      branch: 'pta-central',
      serviceType: 'passport',
    },

    // Cape Town Central
    {
      id: '13',
      date: '2024-02-15',
      time: '10:00',
      branch: 'ct-central',
      serviceType: 'smart-id',
    },
    {
      id: '14',
      date: '2024-02-16',
      time: '14:00',
      branch: 'ct-central',
      serviceType: 'passport',
    },

    // Durban Central
    {
      id: '15',
      date: '2024-02-15',
      time: '11:30',
      branch: 'dbn-central',
      serviceType: 'smart-id',
    },
    {
      id: '16',
      date: '2024-02-16',
      time: '10:00',
      branch: 'dbn-central',
      serviceType: 'id-book',
    },
  ];

  constructor() {
    this.generateBellvilleSlots();
  }

  /**
   * Search for available slots based on criteria
   */
  searchAvailableSlots(
    criteria: SlotSearchCriteria
  ): Observable<AvailableSlot[]> {
    // Simulate API call delay
    return of(this.filterSlots(criteria)).pipe(delay(1000));
  }

  /**
   * Filter slots based on search criteria
   */
  private filterSlots(criteria: SlotSearchCriteria): AvailableSlot[] {
    const startDate = new Date(criteria.startDate);
    const endDate = new Date(criteria.endDate);

    return this.mockSlots.filter((slot) => {
      const slotDate = new Date(slot.date);
      const branchMatch = slot.branch === criteria.branch;
      const dateMatch = slotDate >= startDate && slotDate <= endDate;
      const serviceMatch = criteria.services.some(
        (service) =>
          slot.serviceType === service ||
          (service === 'smart-id' && slot.serviceType === 'smart-id') ||
          (service === 'id-book' && slot.serviceType === 'id-book') ||
          (service === 'passport' && slot.serviceType === 'passport')
      );

      return branchMatch && dateMatch && serviceMatch;
    });
  }

  /**
   * Get time slots for a specific date
   */
  getTimeSlotsForDate(date: string): TimeSlot[] {
    const baseTimeSlots = [
      { time: '08:00', available: false },
      { time: '08:30', available: false },
      { time: '09:00', available: false },
      { time: '09:30', available: false },
      { time: '10:00', available: false },
      { time: '10:30', available: false },
      { time: '11:00', available: false },
      { time: '11:30', available: false },
      { time: '12:00', available: false },
      { time: '13:00', available: false },
      { time: '13:30', available: false },
      { time: '14:00', available: false },
      { time: '14:30', available: false },
      { time: '15:00', available: false },
      { time: '15:30', available: false },
      { time: '16:00', available: false },
    ];

    return baseTimeSlots.map((slot, index) => ({
      id: `${date}-${index}`,
      time: slot.time,
      available: Math.random() > 0.7, // Random availability for demo
      date: date,
    }));
  }

  /**
   * Book a specific slot
   */
  bookSlot(
    slotId: string
  ): Observable<{ success: boolean; message: string; bookingId?: string }> {
    // Simulate booking process
    return of({
      success: true,
      message: 'Slot booked successfully!',
      bookingId: `DHA-${Date.now()}`,
    }).pipe(delay(1500));
  }

  /**
   * Get available dates for a branch within a range
   */
  getAvailableDates(
    branch: string,
    startDate: string,
    endDate: string
  ): string[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availableDates: string[] = [];

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split('T')[0];
      const hasSlots = this.mockSlots.some(
        (slot) => slot.branch === branch && slot.date === dateStr
      );
      if (hasSlots) {
        availableDates.push(dateStr);
      }
    }

    return availableDates;
  }

  /**
   * Generate Bellville branch slots for the next 20 days
   */
  private generateBellvilleSlots(): void {
    const timeSlots = [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
    ];
    const serviceTypes = [
      'smart-id',
      'passport',
      'id-book',
      'birth-cert',
      'marriage-cert',
    ];

    let slotId = 1000; // Start with a unique ID range

    // Generate slots for the next 20 days
    for (let day = 0; day < 20; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      // Generate 3-6 random slots per day for better demonstration
      const slotsPerDay = Math.floor(Math.random() * 4) + 3; // 3-6 slots
      const shuffledTimes = [...timeSlots].sort(() => Math.random() - 0.5);

      for (let i = 0; i < slotsPerDay; i++) {
        const time = shuffledTimes[i];
        const serviceType =
          serviceTypes[Math.floor(Math.random() * serviceTypes.length)];

        this.mockSlots.push({
          id: slotId.toString(),
          date: dateStr,
          time: time,
          branch: 'ct-bellville',
          serviceType: serviceType,
        });

        slotId++;
      }
    }
  }
}
