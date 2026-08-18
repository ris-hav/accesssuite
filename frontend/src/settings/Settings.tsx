import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../core/AuthContext';
import { ApiError } from '../core/api';
import { getMyClient, updateMyClient, type ClientInfo } from './settingsApi';

export function Settings() {
  const { user } = useAuth();

  const [client, setClient] = useState<ClientInfo | null>(null);
  const [name, setName] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyClient()
      .then((c) => {
        setClient(c);
        setName(c.name);
      })
      .catch(() => setLoadError('Could not load account settings.'));
  }, []);

  const isValid = name.trim().length >= 2;
  const isAdmin = user?.role === 'ADMIN';

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await updateMyClient(name);
      setClient(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save changes.');
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>

        {loadError ? (
          <p className="text-red-600">{loadError}</p>
        ) : client ? (
          <form
            onSubmit={submit}
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4"
          >
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company name
              </label>
              <input
                id="companyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                readOnly={!isAdmin}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none read-only:bg-gray-50 read-only:text-gray-500"
              />
            </div>

            {isAdmin ? (
              <>
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                {saved && <p className="text-sm text-green-600">Saved.</p>}
                <button
                  type="submit"
                  disabled={!isValid}
                  className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Save changes
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">Only an account admin can change this.</p>
            )}
          </form>
        ) : (
          <p className="text-gray-500">Loading…</p>
        )}
      </div>
    </div>
  );
}
