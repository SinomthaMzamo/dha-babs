import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ios-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="ios-modal-overlay"
      [class.ios-modal-overlay--open]="isOpen"
      (touchstart)="onOverlayTouch($event)"
      (click)="onOverlayClick($event)"
    >
      <div
        class="ios-modal-container"
        [class.ios-modal-container--open]="isOpen"
        (touchstart)="onModalTouch($event)"
        (click)="onModalClick($event)"
        #modalContainer
      >
        <div class="ios-modal-header" *ngIf="title">
          <h3 class="ios-modal-title">{{ title }}</h3>
          <button
            type="button"
            class="ios-modal-close"
            (click)="closeModal()"
            (touchstart)="onCloseTouch($event)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="ios-modal-body">
          <ng-content></ng-content>
        </div>

        <div class="ios-modal-footer" *ngIf="showFooter">
          <button
            *ngIf="cancelText"
            type="button"
            class="btn-secondary"
            (click)="onCancel()"
          >
            {{ cancelText }}
          </button>
          <button
            *ngIf="confirmText"
            type="button"
            class="btn-primary"
            [disabled]="confirmDisabled"
            (click)="onConfirm()"
          >
            {{ confirmText }}
          </button>
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
        --DHAOffBlack: rgb(51, 51, 51);
        --DHATextGray: #949494;
        --DHATextGrayDark: #5a5a5a;
        --DHAErrorColor: #ea2127;
        --DHADisabledButtonGray: #e6e6e6;
        --DHAGrayLight: gainsboro;
        --DHABackGroundLightGray: #f4f4f4;
        --DividerGray: #949494;
        --DHADisabledTextGray: #c4c4c4;
      }

      .ios-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        /* iOS Safari specific fixes */
        -webkit-overflow-scrolling: touch;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        will-change: opacity, visibility;
      }

      .ios-modal-overlay--open {
        opacity: 1;
        visibility: visible;
      }

      .ios-modal-container {
        background: var(--DHAWhite);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        max-height: 90vh;
        width: 100%;
        display: flex;
        flex-direction: column;
        /* iOS Safari specific fixes */
        -webkit-transform: translateZ(0) scale(0.9);
        transform: translateZ(0) scale(0.9);
        -webkit-transition: -webkit-transform 0.3s ease;
        transition: transform 0.3s ease;
        will-change: transform;
        /* Prevent iOS Safari zoom on input focus */
        font-size: 16px;
      }

      .ios-modal-container--open {
        -webkit-transform: translateZ(0) scale(1);
        transform: translateZ(0) scale(1);
      }

      .ios-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--DHABackGroundLightGray);
        flex-shrink: 0;
      }

      .ios-modal-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--DHAGreen);
        line-height: 1.3;
      }

      .ios-modal-close {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        /* iOS Safari touch target */
        min-width: 44px;
        min-height: 44px;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      }

      .ios-modal-close:hover {
        background-color: var(--DHABackGroundLightGray);
      }

      .ios-modal-close svg {
        width: 20px;
        height: 20px;
        color: var(--DHATextGray);
      }

      .ios-modal-body {
        padding: 20px 24px;
        flex: 1;
        overflow-y: auto;
        /* iOS Safari scrolling fix */
        -webkit-overflow-scrolling: touch;
        /* Prevent iOS Safari zoom on input focus */
        font-size: 16px;
      }

      /* Global iOS Safari zoom prevention for all inputs in modal */
      .ios-modal-body * {
        -webkit-text-size-adjust: 100%;
      }

      .ios-modal-body input[type='text'],
      .ios-modal-body input[type='email'],
      .ios-modal-body input[type='password'],
      .ios-modal-body input[type='number'],
      .ios-modal-body input[type='tel'],
      .ios-modal-body input[type='url'],
      .ios-modal-body input[type='search'],
      .ios-modal-body textarea,
      .ios-modal-body select {
        font-size: 16px !important;
        -webkit-appearance: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-text-size-adjust: 100%;
        -webkit-user-select: text;
        transform: translateZ(0);
        min-height: 44px;
        box-sizing: border-box;
      }

      .ios-modal-footer {
        padding: 16px 24px 20px;
        border-top: 1px solid var(--DHABackGroundLightGray);
        flex-shrink: 0;
        display: flex;
        gap: 12px;
        justify-content: space-between;
      }

      .button-group {
        display: flex;
        gap: 15px;
        margin-top: 30px;
      }

      .btn-primary,
      .btn-secondary {
        flex: 1;
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 150px;
      }

      .btn-primary {
        background: var(--DHAGreen);
        color: var(--DHAWhite);
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--DHAWhite);
        transform: translateY(-2px);
        color: var(--DHAGreen);
        border: 1px solid var(--DHAGreen);
      }

      .btn-primary:disabled {
        background: var(--DHADisabledButtonGray);
        color: var(--DHADisabledTextGray);
        cursor: not-allowed;
      }

      .btn-secondary {
        background: var(--DHATextGrayDark);
        color: var(--DHAWhite);
      }

      .btn-secondary:hover {
        background: var(--DHAOffBlack);
      }

      /* iOS Safari specific media queries */
      @supports (-webkit-touch-callout: none) {
        .ios-modal-overlay {
          /* Fix iOS Safari viewport issues */
          position: fixed;
          top: env(safe-area-inset-top);
          left: env(safe-area-inset-left);
          right: env(safe-area-inset-right);
          bottom: env(safe-area-inset-bottom);
        }

        .ios-modal-container {
          /* Ensure proper touch targets on iOS */
          min-height: 200px;
        }

        .ios-modal-body {
          /* Prevent iOS Safari input zoom */
          font-size: 16px;
        }

        .ios-modal-body input,
        .ios-modal-body select,
        .ios-modal-body textarea {
          font-size: 16px !important;
          min-height: 44px;
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          -webkit-text-size-adjust: 100%;
          -webkit-user-select: text;
          transform: translateZ(0);
        }

        .ios-modal-close {
          /* iOS Safari touch target */
          min-width: 44px;
          min-height: 44px;
        }
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .ios-modal-overlay {
          padding: 10px;
        }

        .ios-modal-container {
          max-width: 500px;
          max-height: 95vh;
          border-radius: 8px;
        }

        .ios-modal-header {
          padding: 16px 20px 12px;
        }

        .ios-modal-title {
          font-size: 16px;
        }

        .ios-modal-body {
          padding: 16px 20px;
        }

        .ios-modal-footer {
          padding: 12px 20px 16px;
          display: flex;
          flex-direction: row;
          gap: 8px;
          justify-content: flex-end;
        }

        .ios-modal-footer .btn-primary,
        .ios-modal-footer .btn-secondary {
          flex: 1;
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 0;
          /* Reset default button styles */
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          outline: none;
          text-decoration: none;
          display: inline-block;
          box-sizing: border-box;
        }

        .ios-modal-footer .btn-primary {
          background: var(--DHAGreen);
          color: var(--DHAWhite);
        }

        .ios-modal-footer .btn-primary:hover:not(:disabled) {
          background: var(--DHAWhite);
          transform: translateY(-2px);
          color: var(--DHAGreen);
          border: 1px solid var(--DHAGreen);
        }

        .ios-modal-footer .btn-primary:disabled {
          background: var(--DHADisabledButtonGray);
          color: var(--DHADisabledTextGray);
          cursor: not-allowed;
        }

        .ios-modal-footer .btn-secondary {
          background: var(--DHATextGrayDark);
          color: var(--DHAWhite);
        }

        .ios-modal-footer .btn-secondary:hover {
          background: var(--DHAOffBlack);
          transform: translateY(-2px);
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px;
          min-width: 0;
        }
      }

      /* Prevent body scroll when modal is open */
      :host-context(body.modal-open) {
        overflow: hidden;
      }
    `,
  ],
})
export class IosModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showFooter: boolean = true;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() cancelText: string = '';
  @Input() confirmText: string = '';
  @Input() confirmDisabled: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() modalOpened = new EventEmitter<void>();
  @Output() cancelClicked = new EventEmitter<void>();
  @Output() confirmClicked = new EventEmitter<void>();

  @ViewChild('modalContainer', { static: false }) modalContainer!: ElementRef;

  private originalBodyOverflow: string = '';
  private originalBodyPosition: string = '';

  ngOnInit() {
    // Always ensure body is clean before opening
    if (
      document.body.style.overflow === 'hidden' ||
      document.body.classList.contains('modal-open')
    ) {
      console.warn('Body was already locked on modal init, cleaning up first');
      this.forceCleanup();
    }

    if (this.isOpen) {
      this.openModal();
    }
  }

  ngOnDestroy() {
    this.cleanupModal();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.openModal();
      } else {
        this.cleanupModal();
      }
    }
  }

  private openModal() {
    // Check if body is already locked by another modal
    if (
      document.body.style.overflow === 'hidden' ||
      document.body.classList.contains('modal-open')
    ) {
      console.warn(
        'Body is already locked by another modal, forcing cleanup first'
      );
      this.forceCleanup();
    }

    // Prevent body scroll on iOS Safari
    this.originalBodyOverflow = document.body.style.overflow;
    this.originalBodyPosition = document.body.style.position;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.classList.add('modal-open');

    // Add escape key listener
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.handleEscapeKey);
    }

    this.modalOpened.emit();
  }

  closeModal() {
    this.isOpen = false;
    this.cleanupModal();
  }

  private cleanupModal() {
    // Restore body scroll
    document.body.style.overflow = this.originalBodyOverflow;
    document.body.style.position = this.originalBodyPosition;
    document.body.style.width = '';
    document.body.classList.remove('modal-open');

    // Remove escape key listener
    document.removeEventListener('keydown', this.handleEscapeKey);

    // Reset original values to prevent issues
    this.originalBodyOverflow = '';
    this.originalBodyPosition = '';

    this.modalClosed.emit();
  }

  /**
   * Force cleanup of current modal state
   */
  private forceCleanup() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.classList.remove('modal-open');
  }

  /**
   * Static method to force cleanup of any stuck modal states
   * This can be called globally to ensure body styles are restored
   */
  static forceCleanup() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.classList.remove('modal-open');
  }

  onOverlayClick(event: Event) {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onOverlayTouch(event: TouchEvent) {
    // Prevent iOS Safari touch issues
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      event.preventDefault();
      this.closeModal();
    }
  }

  onModalClick(event: Event) {
    // Prevent clicks inside modal from closing it
    event.stopPropagation();
  }

  onModalTouch(event: TouchEvent) {
    // Prevent iOS Safari touch issues
    event.stopPropagation();
  }

  onCloseTouch(event: TouchEvent) {
    // Prevent iOS Safari touch issues
    event.preventDefault();
    event.stopPropagation();
    this.closeModal();
  }

  onCancel() {
    this.cancelClicked.emit();
    this.closeModal();
  }

  onConfirm() {
    this.confirmClicked.emit();
  }

  private handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.closeOnEscape) {
      this.closeModal();
    }
  };

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isOpen && this.closeOnEscape) {
      this.closeModal();
    }
  }
}
