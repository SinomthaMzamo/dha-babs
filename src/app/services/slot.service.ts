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
  // Mock data for available slots - Only Tygervalley has slots
  private mockSlots: AvailableSlot[] = [];

  constructor() {
    this.generateTygervalleySlots();
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

      return branchMatch && dateMatch;
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
   * Generate Tygervalley branch slots for the next 20 days
   * Only 1-3 available 1-hour slots per day
   */
  private generateTygervalleySlots(): void {
    const timeSlots = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
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

      // Generate 1-3 random slots per day (1-hour slots only)
      const slotsPerDay = Math.floor(Math.random() * 3) + 1; // 1-3 slots
      const shuffledTimes = [...timeSlots].sort(() => Math.random() - 0.5);

      for (let i = 0; i < slotsPerDay; i++) {
        const time = shuffledTimes[i];

        this.mockSlots.push({
          id: slotId.toString(),
          date: dateStr,
          time: time,
          branch: 'ct-tygervalley-main',
        });

        slotId++;
      }
    }
  }
}
