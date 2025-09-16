import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalCleanupService {
  private static instance: ModalCleanupService;
  private cleanupCallbacks: (() => void)[] = [];

  constructor() {
    if (!ModalCleanupService.instance) {
      ModalCleanupService.instance = this;
      this.setupGlobalCleanup();
    }
    return ModalCleanupService.instance;
  }

  /**
   * Register a cleanup callback for a component
   */
  registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Unregister a cleanup callback
   */
  unregisterCleanup(callback: () => void): void {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index > -1) {
      this.cleanupCallbacks.splice(index, 1);
    }
  }

  /**
   * Force cleanup of all registered modals
   */
  forceCleanupAll(): void {
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.warn('Error during modal cleanup:', error);
      }
    });

    // Also force restore body styles as a safety net
    this.restoreBodyStyles();
  }

  /**
   * Restore body styles to their original state
   */
  private restoreBodyStyles(): void {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.classList.remove('modal-open');
  }

  /**
   * Setup global event listeners for cleanup
   */
  private setupGlobalCleanup(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.forceCleanupAll();
      }
    });

    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
      this.forceCleanupAll();
    });

    // Handle popstate (back/forward navigation)
    window.addEventListener('popstate', () => {
      this.forceCleanupAll();
    });

    // Handle unhandled errors that might leave modals stuck
    window.addEventListener('error', () => {
      this.forceCleanupAll();
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', () => {
      this.forceCleanupAll();
    });
  }

  /**
   * Check if body is currently locked by a modal
   */
  isBodyLocked(): boolean {
    return (
      document.body.style.overflow === 'hidden' ||
      document.body.style.position === 'fixed' ||
      document.body.classList.contains('modal-open')
    );
  }

  /**
   * Emergency cleanup - can be called from console or anywhere
   */
  static emergencyCleanup(): void {
    const service = new ModalCleanupService();
    service.forceCleanupAll();
  }
}

