import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;

  // The toggle button lives in the top bar (outside the sidebar), so it
  // stays reachable even when the sidebar itself is collapsed to width 0.
  readonly sidebarCollapsed = signal(false);

  ngOnInit(): void {
    // Loaded once here, at the shell level, since every child page's nav
    // item (and the sidebar itself) depends on it — child pages read the
    // same authService.user signal instead of each re-fetching it.
    this.authService.fetchMe().subscribe();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  logout(): void {
    this.authService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
