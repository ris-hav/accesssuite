import { useEffect, useState } from 'react';
import {
  listClients,
  listModuleCatalog,
  setModuleEnabled,
  setSubscriptionStatus,
  type AdminClient,
  type ModuleCatalogEntry,
} from './platformAdminApi';

const statusBadgeClass = (status: string) =>
  status === 'SUSPENDED'
    ? 'bg-red-100 text-red-700'
    : status === 'TRIAL'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700';

export function PlatformAdmin() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [moduleCatalog, setModuleCatalog] = useState<ModuleCatalogEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  function load() {
    Promise.all([listClients(), listModuleCatalog()])
      .then(([clientsResult, moduleCatalogResult]) => {
        setClients(clientsResult);
        setModuleCatalog(moduleCatalogResult);
      })
      .catch(() => setLoadError('Could not load clients'));
  }

  useEffect(load, []);

  // A client may have no ClientModuleAccess row at all for a given module
  // (never granted before) — that's just "not enabled", not an error.
  function isModuleEnabled(client: AdminClient, moduleId: string): boolean {
    return client.moduleAccess.some((a) => a.moduleId === moduleId && a.enabled);
  }

  // Re-fetches the whole list after every change instead of patching local
  // state — simpler to reason about, and this screen isn't updated often
  // enough for the extra round trip to matter.
  async function toggleModule(clientId: string, moduleId: string, currentlyEnabled: boolean) {
    await setModuleEnabled(clientId, moduleId, !currentlyEnabled);
    load();
  }

  async function toggleSuspension(clientId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await setSubscriptionStatus(clientId, nextStatus);
    load();
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Platform Admin</h1>

        {loadError && <p className="text-red-600">{loadError}</p>}

        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-medium text-gray-900">{client.name}</h2>
                  {client.subscription && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(client.subscription.status)}`}
                    >
                      {client.subscription.status}
                    </span>
                  )}
                </div>
                {client.subscription && (
                  <button
                    onClick={() => toggleSuspension(client.id, client.subscription!.status)}
                    className={`text-sm px-3 py-1 rounded border ${
                      client.subscription.status === 'SUSPENDED'
                        ? 'border-green-300 text-green-600'
                        : 'border-red-300 text-red-600'
                    }`}
                  >
                    {client.subscription.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                {moduleCatalog.map((module) => (
                  <label key={module.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={isModuleEnabled(client, module.id)}
                      onChange={() => toggleModule(client.id, module.id, isModuleEnabled(client, module.id))}
                    />
                    {module.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
