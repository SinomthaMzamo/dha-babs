import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Add global emergency cleanup function for stuck modals
(window as any).emergencyModalCleanup = () => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.classList.remove('modal-open');
  console.log('Emergency modal cleanup completed - body styles restored');
};

// Add a more comprehensive cleanup function
(window as any).fixScrolling = () => {
  // Remove all modal-related styles
  document.body.removeAttribute('style');
  document.body.className = document.body.className.replace(/modal-open/g, '');

  // Also check document element
  document.documentElement.style.overflow = '';
  document.documentElement.style.position = '';

  console.log('Comprehensive scrolling fix applied');
};

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
