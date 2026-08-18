import { apiFetch } from '../core/api';

export interface UsageReport {
  client: { name: string; createdAt: string };
  subscription: { status: string; trialEndsAt: string } | null;
  userCounts: Record<'ADMIN' | 'MANAGER' | 'VIEWER', number>;
  enabledModules: string[];
}

export function getUsageReport(): Promise<UsageReport> {
  return apiFetch<UsageReport>('/reports');
}
