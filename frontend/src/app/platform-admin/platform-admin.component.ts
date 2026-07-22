import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminClient, PlatformAdminService } from './platform-admin.service';

@Component({
  selector: 'app-platform-admin',
  templateUrl: './platform-admin.component.html',
})
export class PlatformAdminComponent implements OnInit {
  private readonly platformAdminService = inject(PlatformAdminService);
  private readonly router = inject(Router);

  readonly clients = signal<AdminClient[]>([]);
  loadError: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.platformAdminService.listClients().subscribe({
      next: (clients) => this.clients.set(clients),
      error: () => (this.loadError = 'Could not load clients'),
    });
  }

  // Re-fetches the whole list after every change instead of patching local
  // state — simpler to reason about, and this screen isn't updated often
  // enough for the extra round trip to matter.
  toggleModule(clientId: string, moduleId: string, currentlyEnabled: boolean): void {
    this.platformAdminService.setModuleEnabled(clientId, moduleId, !currentlyEnabled).subscribe({
      next: () => this.load(),
    });
  }

  toggleSuspension(clientId: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    this.platformAdminService.setSubscriptionStatus(clientId, nextStatus).subscribe({
      next: () => this.load(),
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
