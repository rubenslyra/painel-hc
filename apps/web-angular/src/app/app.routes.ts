import { Routes } from '@angular/router';
import { authGuard } from '@app/core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('@app/features/login/login.page').then(m => m.LoginPage) },
  {
    path: '',
    loadComponent: () => import('@app/layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('@app/features/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'projects/:id', loadComponent: () => import('@app/features/project-detail/project-detail.page').then(m => m.ProjectDetailPage) },
      { path: 'integrations', loadComponent: () => import('@app/features/integrations/integrations.page').then(m => m.IntegrationsPage) },
      { path: 'settings', loadComponent: () => import('@app/features/settings/settings.page').then(m => m.SettingsPage) }
    ]
  },
  { path: '**', redirectTo: '' }
];
