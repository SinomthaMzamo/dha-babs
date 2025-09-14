import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  styles: [],
})
export class AppComponent {
  // app.component.ts (or a global service)
  ngOnInit() {
    this.setViewportHeight();
    window.addEventListener('resize', this.setViewportHeight);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.setViewportHeight);
  }

  private setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
}
