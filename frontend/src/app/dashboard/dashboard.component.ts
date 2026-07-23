import { Component, inject } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  // Populated by LayoutComponent (the shell) on load — no need to fetch
  // again here, this just reads the same signal.
  readonly user = this.authService.user;
}
