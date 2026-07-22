import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  reports: 'Reports',
  settings: 'Settings',
};

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
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
    // logout() now revokes the refresh token server-side (best-effort) before
    // clearing local state, so navigate only once that's actually settled.
    this.authService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
