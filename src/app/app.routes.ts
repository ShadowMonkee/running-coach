import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'plan', pathMatch: 'full' },
  {
    path: 'plan',
    loadComponent: () => import('./components/plan/plan.component').then(m => m.PlanComponent)
  },
  {
    path: 'prep',
    loadComponent: () => import('./components/prep/prep.component').then(m => m.PrepComponent)
  },
  {
    path: 'run',
    loadComponent: () => import('./components/active-run/active-run.component').then(m => m.ActiveRunComponent)
  },
  {
    path: 'custom',
    loadComponent: () => import('./components/custom-setup/custom-setup.component').then(m => m.CustomSetupComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./components/stats/stats.component').then(m => m.StatsComponent)
  },
  { path: '**', redirectTo: 'plan' }
];
