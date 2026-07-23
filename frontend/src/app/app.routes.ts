import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { superAdminGuard } from './core/super-admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, superAdminGuard],
    loadComponent: () =>
      import('./platform-admin/platform-admin.component').then((m) => m.PlatformAdminComponent),
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./reports/reports.component').then((m) => m.ReportsComponent),
  },
  {
    path: 'team',
    canActivate: [authGuard],
    loadComponent: () => import('./team/team.component').then((m) => m.TeamComponent),
  },
];
