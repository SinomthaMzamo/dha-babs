import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, distinctUntilChanged, debounceTime } from 'rxjs';

interface LocationItem {
  id: string | number;
  name: string;
  provinceId?: string | number;
  cityId?: string | number;
}

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="location-grid" [formGroup]="form">
      <!-- Province Selector -->
      <div class="form-group floating-label-group">
        <div class="custom-select-wrapper">
          <div
            class="custom-select"
            [class.has-value]="provinceControl.value"
            [class.is-open]="provinceDropdownOpen"
            [class.is-focused]="provinceFocused"
            [class.is-invalid]="
              provinceControl.invalid && provinceControl.touched
            "
          >
            <div
              class="select-trigger"
              (click)="toggleDropdown('province', $event)"
              (focus)="provinceFocused = true"
              (blur)="provinceFocused = false"
              tabindex="0"
              (keydown.enter)="toggleDropdown('province', $event)"
              (keydown.space)="toggleDropdown('province', $event)"
              (keydown.escape)="closeAllDropdowns()"
            >
              <span class="selected-value">
                {{ getSelectedProvinceName() || '' }}
              </span>
              <span class="select-arrow" [class.rotate]="provinceDropdownOpen">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <button
                *ngIf="provinceControl.value"
                type="button"
                class="clear-button"
                (click)="clearSelection('province', $event)"
                aria-label="Clear province"
              >
                ×
              </button>
            </div>

            <div class="dropdown-panel" *ngIf="provinceDropdownOpen">
              <div class="search-box" *ngIf="provinces.length > 5">
                <input
                  #provinceSearchInput
                  type="text"
                  [(ngModel)]="provinceSearchTerm"
                  [ngModelOptions]="{ standalone: true }"
                  (input)="onSearch('province')"
                  placeholder="Search provinces..."
                  (click)="$event.stopPropagation()"
                />
              </div>
              <div class="options-list">
                <div
                  *ngFor="let province of getFilteredProvinces()"
                  class="option-item"
                  [class.selected]="provinceControl.value === province.id"
                  (click)="selectProvince(province, $event)"
                  tabindex="0"
                  (keydown.enter)="selectProvince(province, $event)"
                >
                  {{ province.name }}
                </div>
                <div
                  *ngIf="getFilteredProvinces().length === 0"
                  class="no-results"
                >
                  No provinces found
                </div>
              </div>
            </div>
          </div>
        </div>

        <label for="province" class="floating-label">Select province *</label>
        <div
          *ngIf="provinceControl.invalid && provinceControl.touched"
          class="error-message"
        >
          <span class="fas fa-exclamation-circle"></span>
          Province is required
        </div>
      </div>

      <!-- City Selector -->
      <div
        class="form-group floating-label-group"
        *ngIf="provinceControl.value"
      >
        <div class="custom-select-wrapper">
          <div
            class="custom-select"
            [class.has-value]="cityControl.value"
            [class.is-open]="cityDropdownOpen"
            [class.is-focused]="cityFocused"
            [class.is-invalid]="cityControl.invalid && cityControl.touched"
          >
            <div
              class="select-trigger"
              (click)="toggleDropdown('city', $event)"
              (focus)="cityFocused = true"
              (blur)="cityFocused = false"
              tabindex="0"
              (keydown.enter)="toggleDropdown('city', $event)"
              (keydown.space)="toggleDropdown('city', $event)"
              (keydown.escape)="closeAllDropdowns()"
            >
              <span class="selected-value">
                {{ getSelectedCityName() || '' }}
              </span>
              <span class="select-arrow" [class.rotate]="cityDropdownOpen">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <button
                *ngIf="cityControl.value"
                type="button"
                class="clear-button"
                (click)="clearSelection('city', $event)"
                aria-label="Clear city"
              >
                ×
              </button>
            </div>

            <div class="dropdown-panel" *ngIf="cityDropdownOpen">
              <div class="search-box" *ngIf="getFilteredCities().length > 5">
                <input
                  #citySearchInput
                  type="text"
                  [(ngModel)]="citySearchTerm"
                  [ngModelOptions]="{ standalone: true }"
                  (input)="onSearch('city')"
                  placeholder="Search cities..."
                  (click)="$event.stopPropagation()"
                />
              </div>
              <div class="options-list">
                <div
                  *ngFor="let city of getFilteredCities()"
                  class="option-item"
                  [class.selected]="cityControl.value === city.id"
                  (click)="selectCity(city, $event)"
                  tabindex="0"
                  (keydown.enter)="selectCity(city, $event)"
                >
                  {{ city.name }}
                </div>
                <div
                  *ngIf="getFilteredCities().length === 0"
                  class="no-results"
                >
                  No cities found
                </div>
              </div>
            </div>
          </div>
        </div>

        <label for="city" class="floating-label">Select city *</label>
        <div
          *ngIf="cityControl.invalid && cityControl.touched"
          class="error-message"
        >
          <span class="fas fa-exclamation-circle"></span>
          City is required
        </div>
      </div>

      <!-- Branch Selector -->
      <div class="form-group floating-label-group" *ngIf="cityControl.value">
        <div class="custom-select-wrapper">
          <div
            class="custom-select"
            [class.has-value]="branchControl.value"
            [class.is-open]="branchDropdownOpen"
            [class.is-focused]="branchFocused"
            [class.is-invalid]="branchControl.invalid && branchControl.touched"
          >
            <div
              class="select-trigger"
              (click)="toggleDropdown('branch', $event)"
              (focus)="branchFocused = true"
              (blur)="branchFocused = false"
              tabindex="0"
              (keydown.enter)="toggleDropdown('branch', $event)"
              (keydown.space)="toggleDropdown('branch', $event)"
              (keydown.escape)="closeAllDropdowns()"
            >
              <span class="selected-value">
                {{ getSelectedBranchName() || '' }}
              </span>
              <span class="select-arrow" [class.rotate]="branchDropdownOpen">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <button
                *ngIf="branchControl.value"
                type="button"
                class="clear-button"
                (click)="clearSelection('branch', $event)"
                aria-label="Clear branch"
              >
                ×
              </button>
            </div>

            <div class="dropdown-panel" *ngIf="branchDropdownOpen">
              <div class="search-box" *ngIf="getFilteredBranches().length > 5">
                <input
                  #branchSearchInput
                  type="text"
                  [(ngModel)]="branchSearchTerm"
                  [ngModelOptions]="{ standalone: true }"
                  (input)="onSearch('branch')"
                  placeholder="Search branches..."
                  (click)="$event.stopPropagation()"
                />
              </div>
              <div class="options-list">
                <div
                  *ngFor="let branch of getFilteredBranches()"
                  class="option-item"
                  [class.selected]="branchControl.value === branch.id"
                  (click)="selectBranch(branch, $event)"
                  tabindex="0"
                  (keydown.enter)="selectBranch(branch, $event)"
                >
                  {{ branch.name }}
                </div>
                <div
                  *ngIf="getFilteredBranches().length === 0"
                  class="no-results"
                >
                  No branches found
                </div>
              </div>
            </div>
          </div>
        </div>

        <label for="branch" class="floating-label">Select branch *</label>
        <div
          *ngIf="branchControl.invalid && branchControl.touched"
          class="error-message"
        >
          <span class="fas fa-exclamation-circle"></span>
          Branch is required
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --DHAGreen: #016635;
        --DHALightGreen: #018947;
        --DHALightGreenLight: #ddebe4;
        --DHAOrange: #f3801f;
        --DHALightOrange: #f8ab18;
        --DHAWhite: #ffffff;
        --DHAOffWhite: #fbfbfb;
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #ea2127;
        --DHADangerColor: #c41e3a;
        --DHADangerColorLight: #ebcad0;
        --DHADisabledButtonGray: #e6e6e6;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHAOffBlack: rgb(42, 41, 41);
        --DHADisabledTextGray: #c4c4c4;
        --DHAGrayLight: gainsboro;
      }

      .location-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        width: 100%;
      }

      @media (min-width: 768px) {
        .location-grid {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
      }

      .form-group {
        position: relative;
        margin-bottom: 0;
        width: 100%;
        min-width: 0;
      }

      .floating-label-group {
        position: relative;
        width: 100%;
      }

      .custom-select-wrapper {
        position: relative;
        width: 100%;
        max-width: 100%;
      }

      .custom-select {
        position: relative;
        width: 100%;
        max-width: 100%;
      }

      .select-trigger {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 100%;
        min-height: 44px;
        padding: 10px 40px 10px 12px;
        border: 1px solid var(--DividerGray);
        border-radius: 6px;
        background-color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        box-sizing: border-box;
      }

      .select-trigger:hover {
        border-color: #9ca3af;
      }

      .custom-select.is-open .select-trigger,
      .select-trigger:focus {
        border-color: var(--DHAGreen);
        box-shadow: 0 0 0 3px rgba(1, 102, 53, 0.1);
      }

      .custom-select.is-invalid .select-trigger {
        border-color: var(--DHAErrorColor);
      }

      .custom-select.has-value .select-trigger,
      .custom-select.is-open .select-trigger,
      .custom-select.is-focused .select-trigger {
        padding-top: 18px;
        padding-bottom: 16px;
      }

      .selected-value {
        flex: 1;
        color: #111827;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }

      .custom-select:not(.has-value):not(.is-open) .selected-value {
        color: transparent;
      }

      .select-arrow {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        transition: transform 0.2s ease;
        pointer-events: none;
        flex-shrink: 0;
      }

      .select-arrow.rotate {
        transform: translateY(-50%) rotate(180deg);
      }

      .clear-button {
        position: absolute;
        right: 36px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        border: none;
        background: #e5e7eb;
        border-radius: 50%;
        color: #6b7280;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        z-index: 2;
        flex-shrink: 0;
      }

      .clear-button:hover {
        background: #d1d5db;
        color: #374151;
      }

      .dropdown-panel {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        max-height: 280px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        box-shadow:
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-sizing: border-box;
      }

      .search-box {
        padding: 8px;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
        flex-shrink: 0;
      }

      .search-box input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: #3b82f6;
      }

      .options-list {
        overflow-y: auto;
        max-height: 230px;
        flex: 1;
      }

      .option-item {
        padding: 10px 12px;
        cursor: pointer;
        transition: background-color 0.15s ease;
        color: #374151;
        font-size: 14px;
      }

      .option-item:hover {
        background-color: #f3f4f6;
      }

      .option-item.selected {
        background-color: #eff6ff;
        color: #2563eb;
        font-weight: 500;
      }

      .option-item:focus {
        outline: none;
        background-color: #f3f4f6;
      }

      .no-results {
        padding: 16px;
        text-align: center;
        color: #9ca3af;
        font-size: 14px;
      }

      .floating-label {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--DHATextGray);
        font-size: 16px;
        font-weight: 600;
        transition: all 0.2s ease;
        pointer-events: none;
        background: white;
        padding: 0 4px;
        line-height: 1;
        z-index: 1;
      }

      .custom-select-wrapper:has(.custom-select.has-value) ~ .floating-label,
      .custom-select-wrapper:has(.custom-select.is-open) ~ .floating-label,
      .custom-select-wrapper:has(.custom-select.is-focused) ~ .floating-label {
        top: 0;
        left: 8px;
        font-size: 12px;
        color: var(--DHAGreen);
        font-weight: 600;
      }

      .custom-select-wrapper:has(.custom-select.is-invalid) ~ .floating-label {
        color: #ef4444;
      }

      .custom-select-wrapper:has(.custom-select.is-invalid.has-value)
        ~ .floating-label,
      .custom-select-wrapper:has(.custom-select.is-invalid.is-open)
        ~ .floating-label,
      .custom-select-wrapper:has(.custom-select.is-invalid.is-focused)
        ~ .floating-label {
        color: #ef4444;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        color: #ef4444;
        font-size: 12px;
      }

      .error-message .fa-exclamation-circle {
        font-size: 12px;
      }

      /* Ensure dropdowns work in collapsible containers */
      :host {
        display: block;
        position: relative;
        width: 100%;
        max-width: 100%;
      }

      /* Smooth scrollbar */
      .options-list::-webkit-scrollbar {
        width: 6px;
      }

      .options-list::-webkit-scrollbar-track {
        background: #f9fafb;
      }

      .options-list::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      .options-list::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `,
  ],
})
export class LocationSelectorComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() provinces: LocationItem[] = [];
  @Input() cities: LocationItem[] = [];
  @Input() branches: LocationItem[] = [];

  @Output() provinceChange = new EventEmitter<LocationItem | null>();
  @Output() cityChange = new EventEmitter<LocationItem | null>();
  //   @Output() branchChange = new EventEmitter<LocationItem | null>();

  provinceControl!: FormControl;
  cityControl!: FormControl;
  branchControl!: FormControl;

  provinceDropdownOpen = false;
  cityDropdownOpen = false;
  branchDropdownOpen = false;

  provinceFocused = false;
  cityFocused = false;
  branchFocused = false;

  provinceSearchTerm = '';
  citySearchTerm = '';
  branchSearchTerm = '';

  private destroy$ = new Subject<void>();
  private documentClickListener?: (event: MouseEvent) => void;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeControls();
    this.setupValueChangeListeners();
    this.setupDocumentClickListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeDocumentClickListener();
  }

  private initializeControls(): void {
    this.provinceControl = this.form.get('province') as FormControl;
    this.cityControl = this.form.get('city') as FormControl;
    this.branchControl = this.form.get('branch') as FormControl;

    if (!this.provinceControl) {
      this.provinceControl = new FormControl('', Validators.required);
      this.form.addControl('province', this.provinceControl);
    }

    if (!this.cityControl) {
      this.cityControl = new FormControl('', Validators.required);
      this.form.addControl('city', this.cityControl);
    }

    if (!this.branchControl) {
      this.branchControl = new FormControl('', Validators.required);
      this.form.addControl('branch', this.branchControl);
    }
  }

  private setupValueChangeListeners(): void {
    // Listen to province changes
    this.provinceControl.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(50))
      .subscribe((value) => {
        if (!value) {
          this.resetCityAndBranch();
        }
      });

    // Listen to city changes
    this.cityControl.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(50))
      .subscribe((value) => {
        if (!value) {
          this.resetBranch();
        }
      });
  }

  private setupDocumentClickListener(): void {
    // Use setTimeout to ensure this runs after Angular's change detection
    setTimeout(() => {
      this.documentClickListener = this.onDocumentClick.bind(this);
      document.addEventListener('click', this.documentClickListener);
    });
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.custom-select-wrapper');

    if (!clickedInside) {
      this.closeAllDropdowns();
      this.cdr.markForCheck();
    }
  }

  toggleDropdown(type: 'province' | 'city' | 'branch', event: Event): void {
    event.stopPropagation();

    switch (type) {
      case 'province':
        this.cityDropdownOpen = false;
        this.branchDropdownOpen = false;
        this.provinceDropdownOpen = !this.provinceDropdownOpen;
        this.provinceSearchTerm = '';
        break;
      case 'city':
        this.provinceDropdownOpen = false;
        this.branchDropdownOpen = false;
        this.cityDropdownOpen = !this.cityDropdownOpen;
        this.citySearchTerm = '';
        break;
      case 'branch':
        this.provinceDropdownOpen = false;
        this.cityDropdownOpen = false;
        this.branchDropdownOpen = !this.branchDropdownOpen;
        this.branchSearchTerm = '';
        break;
    }

    this.cdr.markForCheck();
  }

  closeAllDropdowns(): void {
    this.provinceDropdownOpen = false;
    this.cityDropdownOpen = false;
    this.branchDropdownOpen = false;
    this.cdr.markForCheck();
  }

  selectProvince(province: LocationItem, event: Event): void {
    event.stopPropagation();
    this.provinceControl.setValue(province.id);
    this.provinceControl.markAsTouched();
    this.provinceDropdownOpen = false;
    this.resetCityAndBranch();
    this.provinceChange.emit(province);
    this.cdr.markForCheck();
  }

  selectCity(city: LocationItem, event: Event): void {
    event.stopPropagation();
    this.cityControl.setValue(city.id);
    this.cityControl.markAsTouched();
    this.cityDropdownOpen = false;
    this.resetBranch();
    this.cityChange.emit(city);
    this.cdr.markForCheck();
  }

  selectBranch(branch: LocationItem, event: Event): void {
    event.stopPropagation();
    this.branchControl.setValue(branch.id);
    this.branchControl.markAsTouched();
    this.branchDropdownOpen = false;
    // this.branchChange.emit(branch);
    this.cdr.markForCheck();
  }

  clearSelection(type: 'province' | 'city' | 'branch', event: Event): void {
    event.stopPropagation();

    switch (type) {
      case 'province':
        this.provinceControl.setValue('');
        this.resetCityAndBranch();
        this.provinceChange.emit(null);
        break;
      case 'city':
        this.cityControl.setValue('');
        this.resetBranch();
        this.cityChange.emit(null);
        break;
      case 'branch':
        this.branchControl.setValue('');
        // this.branchChange.emit(null);
        break;
    }

    this.cdr.markForCheck();
  }

  private resetCityAndBranch(): void {
    this.cityControl.setValue('', { emitEvent: false });
    this.branchControl.setValue('', { emitEvent: false });
    this.citySearchTerm = '';
    this.branchSearchTerm = '';
  }

  private resetBranch(): void {
    this.branchControl.setValue('', { emitEvent: false });
    this.branchSearchTerm = '';
  }

  onSearch(type: 'province' | 'city' | 'branch'): void {
    // Search is handled by filtering in the getter methods
    this.cdr.markForCheck();
  }

  getFilteredProvinces(): LocationItem[] {
    if (!this.provinceSearchTerm) {
      return this.provinces;
    }
    const term = this.provinceSearchTerm.toLowerCase();
    return this.provinces.filter((p) => p.name.toLowerCase().includes(term));
  }

  getFilteredCities(): LocationItem[] {
    const provinceId = this.provinceControl.value;
    let filtered = this.cities.filter((c) => c.provinceId === provinceId);

    if (this.citySearchTerm) {
      const term = this.citySearchTerm.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(term));
    }

    return filtered;
  }

  getFilteredBranches(): LocationItem[] {
    const cityId = this.cityControl.value;
    let filtered = this.branches.filter((b) => b.cityId === cityId);

    if (this.branchSearchTerm) {
      const term = this.branchSearchTerm.toLowerCase();
      filtered = filtered.filter((b) => b.name.toLowerCase().includes(term));
    }

    return filtered;
  }

  getSelectedProvinceName(): string {
    const id = this.provinceControl.value;
    return this.provinces.find((p) => p.id === id)?.name || '';
  }

  getSelectedCityName(): string {
    const id = this.cityControl.value;
    return this.cities.find((c) => c.id === id)?.name || '';
  }

  getSelectedBranchName(): string {
    const id = this.branchControl.value;
    return this.branches.find((b) => b.id === id)?.name || '';
  }
}
