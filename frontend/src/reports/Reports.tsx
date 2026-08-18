import { useEffect, useState } from 'react';
import { getUsageReport, type UsageReport } from './reportsApi';

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

const statusBadgeClass = (status: string) =>
  status === 'SUSPENDED'
    ? 'bg-red-100 text-red-700'
    : status === 'TRIAL'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700';

export function Reports() {
  const [report, setReport] = useState<UsageReport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getUsageReport()
      .then(setReport)
      .catch(() => setLoadError('Could not load the report.'));
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Reports</h1>

        {loadError ? (
          <p className="text-red-600">{loadError}</p>
        ) : report ? (
          <>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-gray-900">{report.client.name}</h2>
                {report.subscription && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(report.subscription.status)}`}
                  >
                    {report.subscription.status}
                  </span>
                )}
              </div>
              {report.subscription?.status === 'TRIAL' && (
                <p className="text-sm text-gray-500 mt-1">
                  Trial ends {dateFormatter.format(new Date(report.subscription.trialEndsAt))}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 text-center">
                <p className="text-3xl font-semibold text-gray-900">{report.userCounts.ADMIN}</p>
                <p className="text-sm text-gray-500 mt-1">Admins</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 text-center">
                <p className="text-3xl font-semibold text-gray-900">{report.userCounts.MANAGER}</p>
                <p className="text-sm text-gray-500 mt-1">Managers</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 text-center">
                <p className="text-3xl font-semibold text-gray-900">{report.userCounts.VIEWER}</p>
                <p className="text-sm text-gray-500 mt-1">Viewers</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <h2 className="font-medium text-gray-900 mb-2">Enabled modules</h2>
              <p className="text-sm text-gray-600">{report.enabledModules.join(', ') || 'None'}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Loading…</p>
        )}
      </div>
    </div>
  );
}
