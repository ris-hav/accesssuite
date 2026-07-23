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
    // authGuard here applies to every child below — a guard on a parent
    // route runs before Angular activates any of its children.
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'team',
        loadComponent: () => import('./team/team.component').then((m) => m.TeamComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'admin',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./platform-admin/platform-admin.component').then((m) => m.PlatformAdminComponent),
      },
    ],
  },
];
