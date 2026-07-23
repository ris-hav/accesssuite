import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminClient, ModuleCatalogEntry, PlatformAdminService } from './platform-admin.service';

@Component({
  selector: 'app-platform-admin',
  templateUrl: './platform-admin.component.html',
})
export class PlatformAdminComponent implements OnInit {
  private readonly platformAdminService = inject(PlatformAdminService);
  private readonly router = inject(Router);

  readonly clients = signal<AdminClient[]>([]);
  readonly moduleCatalog = signal<ModuleCatalogEntry[]>([]);
  loadError: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    forkJoin({
      clients: this.platformAdminService.listClients(),
      moduleCatalog: this.platformAdminService.listModuleCatalog(),
    }).subscribe({
      next: ({ clients, moduleCatalog }) => {
        this.clients.set(clients);
        this.moduleCatalog.set(moduleCatalog);
      },
      error: () => (this.loadError = 'Could not load clients'),
    });
  }

  // A client may have no ClientModuleAccess row at all for a given module
  // (never granted before) — that's just "not enabled", not an error.
  isModuleEnabled(client: AdminClient, moduleId: string): boolean {
    return client.moduleAccess.some((a) => a.moduleId === moduleId && a.enabled);
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
