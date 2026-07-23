import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  // Populated by LayoutComponent (the shell) on load — no need to fetch
  // again here, this just reads the same signal.
  readonly user = this.authService.user;
  readonly moduleLabels = MODULE_LABELS;
}
