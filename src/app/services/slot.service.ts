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
  // Mock data for available slots - One branch per province has slots
  private mockSlots: AvailableSlot[] = [];

  // Mapping of province to selected branch (one branch per province)
  private provinceBranchMapping: { [provinceId: string]: string } = {
    gauteng: 'johannesburg',
    'western-cape': 'cape-town',
    'kwazulu-natal': 'durban',
    'eastern-cape': 'port-elizabeth',
    'free-state': 'bloemfontein',
    mpumalanga: 'nelspruit',
    limpopo: 'polokwane',
    'north-west': 'mahikeng',
    'northern-cape': 'kimberley',
  };

  constructor() {
    this.generateProvinceSlots();
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
   * Get the branch ID that has slots for a specific province
   */
  getBranchForProvince(provinceId: string): string | null {
    return this.provinceBranchMapping[provinceId] || null;
  }

  /**
   * Get all provinces that have slots available
   */
  getProvincesWithSlots(): string[] {
    return Object.keys(this.provinceBranchMapping);
  }

  /**
   * Generate slots for one branch per province for the next 30 days
   * Varied slot availability: 1-6 slots per day, Monday to Friday, 8:00-15:00
   */
  private generateProvinceSlots(): void {
    const timeSlots = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
    ];

    let slotId = 1000; // Start with a unique ID range

    // Generate slots for each province's selected branch
    Object.entries(this.provinceBranchMapping).forEach(
      ([provinceId, branchId]) => {
        // Generate slots for the next 30 days
        for (let day = 0; day < 30; day++) {
          const date = new Date();
          date.setDate(date.getDate() + day);
          const dateStr = date.toISOString().split('T')[0];

          // Skip weekends (Saturday = 6, Sunday = 0)
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            continue;
          }

          // Generate 1-6 random slots per day with varied distribution
          // More likely to have 2-4 slots, less likely to have 1 or 6
          const random = Math.random();
          let slotsPerDay: number;

          if (random < 0.1) slotsPerDay = 1; // 10% chance
          else if (random < 0.3) slotsPerDay = 2; // 20% chance
          else if (random < 0.6) slotsPerDay = 3; // 30% chance
          else if (random < 0.85) slotsPerDay = 4; // 25% chance
          else if (random < 0.95) slotsPerDay = 5; // 10% chance
          else slotsPerDay = 6; // 5% chance

          // Shuffle time slots and select the required number
          const shuffledTimes = [...timeSlots].sort(() => Math.random() - 0.5);

          for (let i = 0; i < slotsPerDay; i++) {
            const time = shuffledTimes[i];

            this.mockSlots.push({
              id: slotId.toString(),
              date: dateStr,
              time: time,
              branch: branchId,
            });

            slotId++;
          }
        }
      }
    );
  }
}
