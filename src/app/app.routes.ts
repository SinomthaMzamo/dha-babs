import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/demo/demo.component').then((m) => m.DemoComponent),
  },
  {
    path: 'authenticate',
    loadComponent: () =>
      import('./components/authenticate/authenticate.component').then(
        (m) => m.AuthenticateComponent
      ),
  },
  {
    path: 'personal-info',
    loadComponent: () =>
      import('./components/personal-info/personal-info.component').then(
        (m) => m.PersonalInfoComponent
      ),
  },
  // {
  //   path: 'contact-info',
  //   loadComponent: () =>
  //     import('./components/contact-info/contact-info.component').then(
  //       (m) => m.ContactInfoComponent
  //     ),
  // },
  {
    path: 'menu',
    loadComponent: () =>
      import('./components/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'book-service',
    loadComponent: () =>
      import('./components/book-service/book-service.component').then(
        (m) => m.BookServiceComponent
      ),
  },
  {
    path: 'view-appointment',
    loadComponent: () =>
      import('./components/view-appointment/view-appointment.component').then(
        (m) => m.ViewAppointmentComponent
      ),
  },
  { path: '**', redirectTo: '/' },
];
