import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

export function Layout() {
  const { user, fetchMe, logout } = useAuth();
  const navigate = useNavigate();

  // The toggle button lives in the top bar (outside the sidebar), so it
  // stays reachable even when the sidebar itself is collapsed to width 0.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Loaded once here, at the shell level, since every child page's nav
    // item (and the sidebar itself) depends on it — child pages read the
    // same user from context instead of each re-fetching it.
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors ${
      isActive ? 'bg-slate-800 text-white' : ''
    }`;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-16 shrink-0 flex items-center gap-3 px-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <button
          onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          type="button"
          className="p-2 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">AccessSuite</span>
        </div>

        <div className="flex-1" />

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200" />

            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-1.5 text-sm text-gray-600 rounded-md px-3 py-1.5 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 flex min-h-0">
        <aside
          className={`shrink-0 bg-slate-900 overflow-hidden transition-[width] duration-200 ease-in-out ${
            sidebarCollapsed ? 'w-0' : 'w-64'
          }`}
        >
          <nav className="w-64 h-full px-3 py-4 space-y-0.5 text-slate-300">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>

            {user?.modules.includes('reports') && (
              <NavLink to="/reports" className={navLinkClass}>
                Reports
              </NavLink>
            )}

            {user?.modules.includes('settings') && (
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
            )}

            {user?.role === 'ADMIN' && !user.isSuperAdmin && (
              <NavLink to="/team" className={navLinkClass}>
                Team
              </NavLink>
            )}

            {user?.isSuperAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-800">
                <NavLink to="/admin" className={navLinkClass}>
                  Platform Admin
                </NavLink>
              </div>
            )}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
