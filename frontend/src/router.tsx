import { createBrowserRouter, redirect } from 'react-router-dom';
import { App } from './App';
import { requireAuthLoader } from './core/requireAuth';
import { requireSuperAdminLoader } from './core/requireSuperAdmin';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, loader: () => redirect('/login') },
      {
        path: 'login',
        lazy: () => import('./auth/Login').then((m) => ({ Component: m.Login })),
      },
      {
        path: 'signup',
        lazy: () => import('./auth/Signup').then((m) => ({ Component: m.Signup })),
      },
      {
        // requireAuthLoader here applies to every child below — a loader on
        // a parent route runs before React Router renders any of its
        // children.
        loader: requireAuthLoader,
        lazy: () => import('./layout/Layout').then((m) => ({ Component: m.Layout })),
        children: [
          {
            path: 'dashboard',
            lazy: () => import('./dashboard/Dashboard').then((m) => ({ Component: m.Dashboard })),
          },
          {
            path: 'reports',
            lazy: () => import('./reports/Reports').then((m) => ({ Component: m.Reports })),
          },
          {
            path: 'team',
            lazy: () => import('./team/Team').then((m) => ({ Component: m.Team })),
          },
          {
            path: 'settings',
            lazy: () => import('./settings/Settings').then((m) => ({ Component: m.Settings })),
          },
          {
            path: 'admin',
            loader: requireSuperAdminLoader,
            lazy: () =>
              import('./platform-admin/PlatformAdmin').then((m) => ({ Component: m.PlatformAdmin })),
          },
        ],
      },
    ],
  },
]);
