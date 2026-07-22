import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  reports: 'Reports',
  settings: 'Settings',
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly moduleLabels = MODULE_LABELS;
  loadError: string | null = null;

  ngOnInit(): void {
    // The dashboard's module tiles come from a live DB query (see
    // AuthService.getMe() on the backend), not from anything baked into the
    // JWT — so a module an admin just revoked won't show up here even
    // without logging back in.
    this.authService.fetchMe().subscribe({
      error: () => (this.loadError = 'Could not load your account. Please log in again.'),
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
