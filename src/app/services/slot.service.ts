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

export interface AlternativeSuggestion {
  branchId: string;
  branchName: string;
  cityName: string;
  provinceName: string;
  distance: 'same-city' | 'same-province' | 'neighboring-province';
  availableSlots: number;
  nextAvailableDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  // Mock data for available slots - One branch per province has slots
  private mockSlots: AvailableSlot[] = [];

  // Complete branch data structure for alternative suggestions
  private branchData = {
    provinces: [
      { id: 'gauteng', name: 'Gauteng' },
      { id: 'western-cape', name: 'Western Cape' },
      { id: 'kwazulu-natal', name: 'KwaZulu-Natal' },
      { id: 'eastern-cape', name: 'Eastern Cape' },
      { id: 'free-state', name: 'Free State' },
      { id: 'mpumalanga', name: 'Mpumalanga' },
      { id: 'limpopo', name: 'Limpopo' },
      { id: 'north-west', name: 'North West' },
      { id: 'northern-cape', name: 'Northern Cape' },
    ],
    cities: [
      // Gauteng
      { id: 'johannesburg', name: 'Johannesburg', provinceId: 'gauteng' },
      { id: 'sandton', name: 'Sandton', provinceId: 'gauteng' },
      { id: 'pretoria', name: 'Pretoria', provinceId: 'gauteng' },
      // Western Cape
      { id: 'cape-town', name: 'Cape Town', provinceId: 'western-cape' },
      { id: 'bellville', name: 'Bellville', provinceId: 'western-cape' },
      { id: 'durbanville', name: 'Durbanville', provinceId: 'western-cape' },
      // KwaZulu-Natal
      { id: 'durban', name: 'Durban', provinceId: 'kwazulu-natal' },
      { id: 'umhlanga', name: 'Umhlanga', provinceId: 'kwazulu-natal' },
      // Eastern Cape
      {
        id: 'port-elizabeth',
        name: 'Port Elizabeth',
        provinceId: 'eastern-cape',
      },
      { id: 'east-london', name: 'East London', provinceId: 'eastern-cape' },
      // Free State
      { id: 'bloemfontein', name: 'Bloemfontein', provinceId: 'free-state' },
      // Mpumalanga
      { id: 'nelspruit', name: 'Nelspruit', provinceId: 'mpumalanga' },
      // Limpopo
      { id: 'polokwane', name: 'Polokwane', provinceId: 'limpopo' },
      // North West
      { id: 'mahikeng', name: 'Mahikeng', provinceId: 'north-west' },
      // Northern Cape
      { id: 'kimberley', name: 'Kimberley', provinceId: 'northern-cape' },
    ],
    branches: [
      // Gauteng branches
      { id: 'johannesburg', name: 'Johannesburg', cityId: 'johannesburg' },
      { id: 'sandton', name: 'Sandton', cityId: 'sandton' },
      { id: 'pretoria', name: 'Pretoria', cityId: 'pretoria' },
      // Western Cape branches
      { id: 'cape-town', name: 'Cape Town', cityId: 'cape-town' },
      { id: 'bellville', name: 'Bellville', cityId: 'bellville' },
      { id: 'tygervalley', name: 'Tygervalley', cityId: 'bellville' },
      { id: 'durbanville', name: 'Durbanville', cityId: 'durbanville' },
      // KwaZulu-Natal branches
      { id: 'durban', name: 'Durban', cityId: 'durban' },
      { id: 'umhlanga', name: 'Umhlanga', cityId: 'umhlanga' },
      // Eastern Cape branches
      {
        id: 'port-elizabeth',
        name: 'Port Elizabeth',
        cityId: 'port-elizabeth',
      },
      { id: 'east-london', name: 'East London', cityId: 'east-london' },
      // Free State branches
      { id: 'bloemfontein', name: 'Bloemfontein', cityId: 'bloemfontein' },
      // Mpumalanga branches
      { id: 'nelspruit', name: 'Nelspruit', cityId: 'nelspruit' },
      // Limpopo branches
      { id: 'polokwane', name: 'Polokwane', cityId: 'polokwane' },
      // North West branches
      { id: 'mahikeng', name: 'Mahikeng', cityId: 'mahikeng' },
      // Northern Cape branches
      { id: 'kimberley', name: 'Kimberley', cityId: 'kimberley' },
    ],
  };

  // Branches that will have slots (60% of branches per province)
  private branchesWithSlots: string[] = [];

  constructor() {
    // Initialize slot generation first to ensure consistent data source
    this.initializeSlotGeneration();
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
   * Search for available slots and return alternative suggestions if none found
   */
  searchAvailableSlotsWithAlternatives(
    criteria: SlotSearchCriteria
  ): Observable<{
    slots: AvailableSlot[];
    alternatives: AlternativeSuggestion[];
  }> {
    const slots = this.filterSlots(criteria);

    if (slots.length > 0) {
      // Return slots if found
      return of({ slots, alternatives: [] }).pipe(delay(1000));
    } else {
      // Return alternative suggestions if no slots found
      const alternatives = this.generateAlternativeSuggestions(criteria);
      return of({ slots: [], alternatives }).pipe(delay(1000));
    }
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
    const provinceBranches = this.branchData.branches.filter(
      (branch) =>
        this.branchData.cities.find((city) => city.id === branch.cityId)
          ?.provinceId === provinceId
    );
    const branchWithSlots = provinceBranches.find((branch) =>
      this.branchesWithSlots.includes(branch.id)
    );
    return branchWithSlots?.id || null;
  }

  /**
   * Get all provinces that have slots available
   */
  getProvincesWithSlots(): string[] {
    return this.branchData.provinces.map((p) => p.id);
  }

  /**
   * Initialize slot generation - called first to ensure consistent data source
   */
  private initializeSlotGeneration(): void {
    this.selectBranchesWithSlots();
    this.generateProvinceSlots();
  }

  /**
   * Select 60% of branches per province to have slots
   */
  private selectBranchesWithSlots(): void {
    this.branchesWithSlots = [];

    this.branchData.provinces.forEach((province) => {
      const provinceBranches = this.branchData.branches.filter(
        (branch) =>
          this.branchData.cities.find((city) => city.id === branch.cityId)
            ?.provinceId === province.id
      );

      // Calculate 60% of branches (rounded up)
      const branchesToSelect = Math.ceil(provinceBranches.length * 0.6);

      // Shuffle and select the required number
      const shuffledBranches = [...provinceBranches].sort(
        () => Math.random() - 0.5
      );
      const selectedBranches = shuffledBranches.slice(0, branchesToSelect);

      this.branchesWithSlots.push(...selectedBranches.map((b) => b.id));
    });
  }

  /**
   * Generate slots for selected branches (60% per province) for the next 30 days
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

    // Generate slots for selected branches (60% per province)
    this.branchesWithSlots.forEach((branchId) => {
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
    });
  }

  /**
   * Generate alternative suggestions when no slots are found
   */
  private generateAlternativeSuggestions(
    criteria: SlotSearchCriteria
  ): AlternativeSuggestion[] {
    const requestedBranch = this.branchData.branches.find(
      (b) => b.id === criteria.branch
    );
    if (!requestedBranch) return [];

    const requestedCity = this.branchData.cities.find(
      (c) => c.id === requestedBranch.cityId
    );
    const requestedProvince = this.branchData.provinces.find(
      (p) => p.id === requestedCity?.provinceId
    );

    if (!requestedCity || !requestedProvince) return [];

    const suggestions: AlternativeSuggestion[] = [];

    // 1. Same city branches (excluding the requested branch)
    const sameCityBranches = this.branchData.branches.filter(
      (b) => b.cityId === requestedCity.id && b.id !== criteria.branch
    );

    sameCityBranches.forEach((branch) => {
      const availableSlots = this.getAvailableSlotsCount(
        branch.id,
        criteria.startDate,
        criteria.endDate
      );
      if (availableSlots > 0) {
        suggestions.push({
          branchId: branch.id,
          branchName: branch.name,
          cityName: requestedCity.name,
          provinceName: requestedProvince.name,
          distance: 'same-city',
          availableSlots,
          nextAvailableDate: this.getNextAvailableDate(
            branch.id,
            criteria.startDate
          ),
        });
      }
    });

    // 2. Same province branches (other cities)
    const sameProvinceCities = this.branchData.cities.filter(
      (c) => c.provinceId === requestedProvince.id && c.id !== requestedCity.id
    );

    sameProvinceCities.forEach((city) => {
      const cityBranches = this.branchData.branches.filter(
        (b) => b.cityId === city.id
      );
      cityBranches.forEach((branch) => {
        const availableSlots = this.getAvailableSlotsCount(
          branch.id,
          criteria.startDate,
          criteria.endDate
        );
        if (availableSlots > 0) {
          suggestions.push({
            branchId: branch.id,
            branchName: branch.name,
            cityName: city.name,
            provinceName: requestedProvince.name,
            distance: 'same-province',
            availableSlots,
            nextAvailableDate: this.getNextAvailableDate(
              branch.id,
              criteria.startDate
            ),
          });
        }
      });
    });

    // 3. Neighboring provinces (limited to 2 suggestions)
    const neighboringProvinces = this.getNeighboringProvinces(
      requestedProvince.id
    );
    let neighboringCount = 0;

    for (const provinceId of neighboringProvinces) {
      if (neighboringCount >= 2) break; // Limit to 2 neighboring province suggestions

      const province = this.branchData.provinces.find(
        (p) => p.id === provinceId
      );
      if (!province) continue;

      const provinceCities = this.branchData.cities.filter(
        (c) => c.provinceId === provinceId
      );
      for (const city of provinceCities) {
        if (neighboringCount >= 2) break;

        const cityBranches = this.branchData.branches.filter(
          (b) => b.cityId === city.id
        );
        for (const branch of cityBranches) {
          if (neighboringCount >= 2) break;

          const availableSlots = this.getAvailableSlotsCount(
            branch.id,
            criteria.startDate,
            criteria.endDate
          );
          if (availableSlots > 0) {
            suggestions.push({
              branchId: branch.id,
              branchName: branch.name,
              cityName: city.name,
              provinceName: province.name,
              distance: 'neighboring-province',
              availableSlots,
              nextAvailableDate: this.getNextAvailableDate(
                branch.id,
                criteria.startDate
              ),
            });
            neighboringCount++;
          }
        }
      }
    }

    // Sort by priority: same-city first, then same-province, then neighboring
    const priorityOrder = {
      'same-city': 1,
      'same-province': 2,
      'neighboring-province': 3,
    };
    suggestions.sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.distance] - priorityOrder[b.distance];
      if (priorityDiff !== 0) return priorityDiff;
      return b.availableSlots - a.availableSlots; // More slots first within same priority
    });

    // Return up to 5 suggestions
    return suggestions.slice(0, 5);
  }

  /**
   * Get neighboring provinces (simplified mapping)
   */
  private getNeighboringProvinces(provinceId: string): string[] {
    const neighboringMap: { [key: string]: string[] } = {
      gauteng: ['mpumalanga', 'free-state', 'north-west', 'limpopo'],
      'western-cape': ['eastern-cape', 'northern-cape'],
      'kwazulu-natal': ['free-state', 'eastern-cape', 'mpumalanga'],
      'eastern-cape': ['western-cape', 'kwazulu-natal', 'free-state'],
      'free-state': ['gauteng', 'kwazulu-natal', 'eastern-cape', 'north-west'],
      mpumalanga: ['gauteng', 'kwazulu-natal', 'limpopo'],
      limpopo: ['gauteng', 'mpumalanga', 'north-west'],
      'north-west': ['gauteng', 'free-state', 'limpopo', 'northern-cape'],
      'northern-cape': ['western-cape', 'north-west', 'free-state'],
    };

    return neighboringMap[provinceId] || [];
  }

  /**
   * Get count of available slots for a branch in date range
   */
  private getAvailableSlotsCount(
    branchId: string,
    startDate: string,
    endDate: string
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.mockSlots.filter((slot) => {
      const slotDate = new Date(slot.date);
      return slot.branch === branchId && slotDate >= start && slotDate <= end;
    }).length;
  }

  /**
   * Get next available date for a branch after the given date
   */
  private getNextAvailableDate(
    branchId: string,
    afterDate: string
  ): string | undefined {
    const after = new Date(afterDate);
    const availableSlots = this.mockSlots
      .filter((slot) => {
        const slotDate = new Date(slot.date);
        return slot.branch === branchId && slotDate > after;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return availableSlots.length > 0 ? availableSlots[0].date : undefined;
  }
}
