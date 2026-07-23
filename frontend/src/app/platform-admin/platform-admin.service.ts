import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ModuleAccessEntry {
  id: string;
  clientId: string;
  moduleId: string;
  enabled: boolean;
  module: { id: string; key: string; name: string };
}

export interface AdminClient {
  id: string;
  name: string;
  createdAt: string;
  subscription: { id: string; status: string; trialEndsAt: string; clientId: string } | null;
  moduleAccess: ModuleAccessEntry[];
}

export interface ModuleCatalogEntry {
  id: string;
  key: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformAdminService {
  private readonly http = inject(HttpClient);

  listClients(): Observable<AdminClient[]> {
    return this.http.get<AdminClient[]>(`${environment.apiBase}/admin/clients`);
  }

  // The full catalog, not just a client's existing grants -- needed so the
  // UI can offer a checkbox for every module, even ones never granted before.
  listModuleCatalog(): Observable<ModuleCatalogEntry[]> {
    return this.http.get<ModuleCatalogEntry[]>(`${environment.apiBase}/admin/modules`);
  }

  setModuleEnabled(clientId: string, moduleId: string, enabled: boolean): Observable<unknown> {
    return this.http.patch(`${environment.apiBase}/admin/clients/${clientId}/modules/${moduleId}`, { enabled });
  }

  setSubscriptionStatus(clientId: string, status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED'): Observable<unknown> {
    return this.http.patch(`${environment.apiBase}/admin/clients/${clientId}/subscription`, { status });
  }
}
