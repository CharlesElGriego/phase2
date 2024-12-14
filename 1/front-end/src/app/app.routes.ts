import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'deadline',
    loadComponent: () => import('./deadline/deadline.component').then(m => m.DeadlineComponent),
  },
  {
    path: 'cameras-test',
    loadComponent: () =>
      import('./cameras-test/cameras-test.component').then(m => m.CamerasTestComponent),
  },
  {
    path: '',
    redirectTo: 'deadline',
    pathMatch: 'full',
  },
];
