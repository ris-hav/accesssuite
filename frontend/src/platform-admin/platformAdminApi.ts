import { apiFetch } from '../core/api';

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

export function listClients(): Promise<AdminClient[]> {
  return apiFetch<AdminClient[]>('/admin/clients');
}

// The full catalog, not just a client's existing grants -- needed so the UI
// can offer a checkbox for every module, even ones never granted before.
export function listModuleCatalog(): Promise<ModuleCatalogEntry[]> {
  return apiFetch<ModuleCatalogEntry[]>('/admin/modules');
}

export function setModuleEnabled(
  clientId: string,
  moduleId: string,
  enabled: boolean,
): Promise<unknown> {
  return apiFetch(`/admin/clients/${clientId}/modules/${moduleId}`, {
    method: 'PATCH',
    body: { enabled },
  });
}

export function setSubscriptionStatus(
  clientId: string,
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED',
): Promise<unknown> {
  return apiFetch(`/admin/clients/${clientId}/subscription`, {
    method: 'PATCH',
    body: { status },
  });
}
