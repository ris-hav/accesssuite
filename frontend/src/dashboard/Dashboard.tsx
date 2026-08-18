import { useAuth } from '../core/AuthContext';

export function Dashboard() {
  // Populated by Layout (the shell) on mount — no need to fetch again here,
  // this just reads the same context value.
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {user ? (
          <>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1">
              {user.email} · {user.role}
            </p>
          </>
        ) : (
          <p className="text-gray-500">Loading…</p>
        )}
      </div>
    </div>
  );
}
