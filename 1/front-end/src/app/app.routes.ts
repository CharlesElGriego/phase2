import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'deadline',
    loadComponent: () =>
      import('./deadline/deadline.component').then((m) => m.DeadlineComponent),
  },
  {
    path: '',
    redirectTo: 'deadline',
    pathMatch: 'full',
  }, 
];